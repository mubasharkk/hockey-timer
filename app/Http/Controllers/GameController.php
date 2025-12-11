<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\GameService;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function __construct(private GameService $gameService)
    {
    }

    public function create(): Response
    {
        $registeredTeams = Team::query()
            ->where('is_registered', true)
            ->with(['players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name')])
            ->orderBy('name')
            ->get(['id', 'name', 'coach', 'manager', 'score', 'side', 'game_id', 'is_registered', 'registered_team_id']);

        $tournaments = Tournament::orderBy('title')->get(['id', 'title', 'slug']);

        return Inertia::render('Game/Create', [
            'teams' => $registeredTeams,
            'sportsOptions' => config('game.sports'),
            'tournaments' => $tournaments,
        ]);
    }

    public function store(StoreGameRequest $request): RedirectResponse
    {
        $game = $this->gameService->createGame($request->validated(), Auth::user());

        return redirect()->route('games.summary', $game);
    }

    public function showSummary(Game $game): Response
    {
        $game->load(['teams.players', 'sessions' => fn ($q) => $q->orderBy('number')]);

        return Inertia::render('Game/Summary', [
            'game' => $game,
        ]);
    }

    public function showTimer(Game $game): Response|RedirectResponse
    {
        $game->load(['teams.players', 'sessions' => fn ($q) => $q->orderBy('number'), 'events' => fn ($q) => $q->orderBy('occurred_at')]);

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
            ->get(['id', 'name']);

        $tournaments = Tournament::orderBy('title')->get(['id', 'title', 'slug']);

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
}
