<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTickerController extends Controller
{
    public function index(Request $request): Response
    {
        $gameId = $request->query('game');
        $game = null;

        if ($gameId) {
            $game = Game::with([
                'teams.players',
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
