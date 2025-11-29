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
            ->latest('game_date')
            ->latest('game_time')
            ->take(10)
            ->get([
                'id',
                'team_a_name',
                'team_b_name',
                'venue',
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
