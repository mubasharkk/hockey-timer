<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $games = Game::query()
            ->with('tournament:id,title')
            ->orderBy('game_date')
            ->orderBy('game_time')
            ->take(10)
            ->get([
                'id',
                'team_a_name',
                'team_b_name',
                'tournament_id',
                'venue',
                'sport_type',
                'code',
                'game_date',
                'game_time',
                'status',
                'ended_at',
            ]);

        return Inertia::render('Dashboard', [
            'games' => $games,
            'now' => Carbon::now()->toIso8601String(),
        ]);
    }
}
