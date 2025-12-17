<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\GameService;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function __construct(private GameService $gameService)
    {
    }

    public function create(Request $request): Response
    {
        $registeredTeams = Team::query()
            ->where('is_registered', true)
            ->with([
                'media',
                'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'coach', 'manager', 'score', 'side', 'game_id', 'is_registered', 'registered_team_id']);

        $tournaments = Tournament::with(['pools.teams:id,name'])
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'venue']);

        return Inertia::render('Game/Create', [
            'teams' => $registeredTeams,
            'sportsOptions' => config('game.sports'),
            'tournaments' => $tournaments,
            'prefillTournamentId' => $request->input('tournament_id'),
        ]);
    }

    public function store(StoreGameRequest $request): RedirectResponse
    {
        $game = $this->gameService->createGame($request->validated(), Auth::user());

        return redirect()->route('games.summary', $game);
    }

    public function showSummary(Game $game): Response
    {
        $game->load([
            'teams.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'homeTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'awayTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'sessions' => fn ($q) => $q->orderBy('number'),
        ]);

        return Inertia::render('Game/Summary', [
            'game' => $game,
        ]);
    }

    public function showTimer(Game $game): Response|RedirectResponse
    {
        $this->ensureGameTeams($game);

        $game->load([
            'teams.players',
            'homeTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'awayTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderBy('occurred_at'),
        ]);

        $isFinished = $game->status === 'finished' || $game->events->contains('event_type', 'game_end');
        if ($isFinished) {
            return redirect()->route('games.report', $game);
        }

        return Inertia::render('Game/Timer', [
            'game' => $game,
            'config' => [
                'timer_lock' => config('game.timer_lock'),
            ],
        ]);
    }

    public function showReport(Game $game): Response
    {
        $game->load([
            'teams.players',
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderBy('occurred_at'),
        ]);

        return Inertia::render('Game/Report', [
            'game' => $game,
        ]);
    }

    public function showOfficialHtml(Game $game): Response
    {
        $game->load([
            'teams.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderBy('occurred_at')->orderBy('id'),
        ]);

        $sessionCount = $game->sessions instanceof \Illuminate\Support\Collection
            ? $game->sessions->count()
            : (int) ($game->sessions ?? 0);

        $sessionScores = [];
        for ($i = 1; $i <= $sessionCount; $i++) {
            $sessionScores[] = [
                'session_number' => $i,
                'label' => $this->sessionLabel($i, $sessionCount),
                'scores' => $game->sessionScores($i, true),
            ];
        }

        return Inertia::render('Game/OfficialPrintableReport', [
            'game' => $game,
            'sessionScores' => $sessionScores,
            'sessionLabels' => $sessionCount > 0
                ? collect(range(1, $sessionCount))->mapWithKeys(fn ($n) => [$n => $this->sessionLabel($n, $sessionCount)])->all()
                : [],
            'events' => $game->events,
        ]);
    }

    public function edit(Game $game): Response
    {
        $game->load(['teams.players']);

        $teams = Team::where('is_registered', true)
            ->orderBy('name')
            ->with('media')
            ->get(['id', 'name', 'coach', 'manager', 'score', 'side', 'game_id', 'is_registered', 'registered_team_id']);

        $tournaments = Tournament::with(['pools.teams:id,name'])
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'venue']);

        return Inertia::render('Game/Edit', [
            'game' => $game,
            'sportsOptions' => config('game.sports'),
            'teams' => $teams,
            'tournaments' => $tournaments,
        ]);
    }

    public function update(UpdateGameRequest $request, Game $game): RedirectResponse
    {
        $this->gameService->updateGame($game, $request->validated());

        return redirect()->route('games.summary', $game)->with('success', 'Game updated.');
    }

    public function destroy(Game $game): RedirectResponse
    {
        $game->delete();

        return redirect()->route('dashboard')->with('success', 'Game deleted.');
    }

    private function sessionLabel(int $number, int $total): string
    {
        $prefix = $total === 2
            ? 'H' // Half
            : ($total === 4 ? 'Q' : 'S'); // Quarter or Session

        return "{$prefix}{$number}";
    }

    /**
     * Ensure a game has side-specific team records (with players) so timer/events work.
     */
    private function ensureGameTeams(Game $game): void
    {
        $game->loadMissing(['teams.players', 'homeTeam.players', 'awayTeam.players']);

        $existingBySide = $game->teams->keyBy('side');

        $sides = [
            'home' => $game->homeTeam,
            'away' => $game->awayTeam,
        ];

        foreach ($sides as $side => $template) {
            if ($existingBySide->has($side) || ! $template) {
                continue;
            }

            $team = Team::create([
                'game_id' => $game->id,
                'registered_team_id' => $template->id,
                'is_registered' => $template->is_registered ?? true,
                'name' => $template->name,
                'side' => $side,
                'score' => 0,
                'coach' => $template->coach,
                'manager' => $template->manager,
            ]);

            foreach ($template->players as $player) {
                $team->players()->create([
                    'registered_player_id' => $player->id,
                    'name' => $player->name,
                    'shirt_number' => $player->shirt_number,
                    'player_pass_number' => $player->player_pass_number,
                    'nic_number' => $player->nic_number,
                    'date_of_birth' => $player->date_of_birth,
                    'is_active' => $player->is_active,
                ]);
            }
        }

        // Refresh relations if we created new teams/players.
        $game->unsetRelation('teams');
        $game->load(['teams.players']);
    }
}
