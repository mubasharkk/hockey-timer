<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\GameService;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\EventResource;
use App\Http\Resources\GameResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\TournamentResource;
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
            ->where('user_id', Auth::id())
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
            'teams' => TeamResource::collection($registeredTeams),
            'sportsOptions' => config('game.sports'),
            'tournaments' => TournamentResource::collection($tournaments),
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
            'game' => GameResource::make($game),
        ]);
    }

    public function showTimer(Game $game): Response|RedirectResponse
    {
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
            'game' => GameResource::make($game),
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
            'game' => GameResource::make($game),
        ]);
    }

    public function showOfficialHtml(Game $game): Response
    {
        $game->load([
            'teams.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderBy('occurred_at')->orderBy('id'),
            'tournament',
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
            'game' => GameResource::make($game),
            'sessionScores' => $sessionScores,
            'sessionLabels' => $sessionCount > 0
                ? collect(range(1, $sessionCount))->mapWithKeys(fn ($n) => [$n => $this->sessionLabel($n, $sessionCount)])->all()
                : [],
            'events' => EventResource::collection($game->events),
        ]);
    }

    public function edit(Game $game): Response
    {
        $game->load(['teams.players']);

        $teams = Team::where('user_id', Auth::id())
            ->orderBy('name')
            ->with('media')
            ->get(['id', 'name', 'coach', 'manager', 'score', 'side', 'game_id', 'is_registered', 'registered_team_id']);

        $tournaments = Tournament::with(['pools.teams:id,name'])
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'venue']);

        return Inertia::render('Game/Edit', [
            'game' => GameResource::make($game),
            'sportsOptions' => config('game.sports'),
            'teams' => TeamResource::collection($teams),
            'tournaments' => TournamentResource::collection($tournaments),
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
}
