<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTickerController extends Controller
{
    public function index(Request $request, string $code = null): Response
    {
        $gameId = $request->query('game');
        $game = null;

        if ($code) {
            $game = Game::with([
                'teams.players',
                'tournament:id,title',
                'sessions' => fn ($q) => $q->orderBy('number'),
                'events' => fn ($q) => $q->orderBy('occurred_at'),
            ])->where('code', $code)->first();
            $gameId = $game?->id;
        }

        if ($gameId) {
            $game = Game::with([
                'teams.players',
                'tournament:id,title',
                'sessions' => fn ($q) => $q->orderBy('number'),
                'events' => fn ($q) => $q->orderBy('occurred_at'),
            ])->find($gameId);
        }

        return Inertia::render('Public/Ticker', [
            'game' => $game,
            'gameId' => $gameId,
        ]);
    }
}
