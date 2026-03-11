<?php

namespace App\Http\Controllers;

use App\Http\Resources\GameResource;
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

        $eagerLoad = [
            'homeTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'homeTeam.media',
            'awayTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'awayTeam.media',
            'tournament',
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderBy('occurred_at'),
        ];

        if ($code) {
            $game = Game::with($eagerLoad)->where('code', $code)->first();
            $gameId = $game?->id;
        }

        if ($gameId && !$game) {
            $game = Game::with($eagerLoad)->find($gameId);
        }

        return Inertia::render('Public/Ticker', [
            'game' => $game ? GameResource::make($game) : null,
            'gameId' => $gameId,
        ]);
    }
}
