<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Team;
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
        $teamSuggestions = Team::with('players')
            ->orderByDesc('id')
            ->get()
            ->unique('name')
            ->take(20)
            ->map(function (Team $team) {
                $playersText = $team->players
                    ->map(fn ($p) => ($p->shirt_number ? "{$p->shirt_number} " : '') . $p->name)
                    ->implode("\n");

                return [
                    'name' => $team->name,
                    'players_text' => $playersText,
                ];
            })
            ->values();

        return Inertia::render('Game/Create', [
            'teamSuggestions' => $teamSuggestions,
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

    public function edit(Game $game): Response
    {
        $game->load(['teams.players']);

        $home = $game->teams->firstWhere('side', 'home');
        $away = $game->teams->firstWhere('side', 'away');

        $game->setAttribute('team_a_players_text', $home?->players
            ->map(fn ($p) => trim(($p->shirt_number ? "{$p->shirt_number} " : '') . ($p->name ?? '')))
            ->filter()
            ->implode("\n"));

        $game->setAttribute('team_b_players_text', $away?->players
            ->map(fn ($p) => trim(($p->shirt_number ? "{$p->shirt_number} " : '') . ($p->name ?? '')))
            ->filter()
            ->implode("\n"));

        return Inertia::render('Game/Edit', [
            'game' => $game,
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
}
