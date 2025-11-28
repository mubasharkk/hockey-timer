<?php

namespace App\Http\Controllers;

use App\Models\Game;
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
        return Inertia::render('Game/Create');
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

    public function showTimer(Game $game): Response
    {
        $game->load(['teams.players', 'sessions' => fn ($q) => $q->orderBy('number'), 'events' => fn ($q) => $q->orderBy('occurred_at')]);

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
