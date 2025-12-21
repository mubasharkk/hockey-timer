<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use App\Http\Resources\GameResource;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = Carbon::now();
        $nowString = $now->format('Y-m-d H:i:s');
        
        $selectFields = [
            'id',
            'team_a_name',
            'team_b_name',
            'tournament_id',
            'venue',
            'excerpt',
            'sport_type',
            'code',
            'game_date',
            'game_time',
            'status',
            'ended_at',
        ];
        
        // Query 1: Get finished/completed games (results)
        $results = Game::query()
            ->with('tournament:id,title')
            ->select($selectFields)
            ->where(function ($query) use ($nowString) {
                // Game is finished if status is 'finished'
                $query->where('status', 'finished')
                    // Or if ended_at timestamp exists
                    ->orWhereNotNull('ended_at')
                    // Or if game datetime has passed
                    ->orWhere(function ($q) use ($nowString) {
                        $q->whereNotNull('game_date')
                            ->whereNotNull('game_time')
                            ->whereRaw("CONCAT(game_date, ' ', game_time) < ?", [$nowString]);
                    });
            })
            ->orderBy('game_date', 'desc')
            ->orderBy('game_time', 'desc')
            ->get();

        // Query 2: Get upcoming/scheduled games
        $upcoming = Game::query()
            ->with('tournament:id,title')
            ->select($selectFields)
            ->where(function ($query) use ($nowString) {
                // Game is upcoming if status is not 'finished' (or null)
                $query->where(function ($q) {
                    $q->where('status', '!=', 'finished')
                        ->orWhereNull('status');
                })
                    // And ended_at is null
                    ->whereNull('ended_at')
                    // And either datetime is missing or hasn't passed yet
                    ->where(function ($q) use ($nowString) {
                        $q->whereNull('game_date')
                            ->orWhereNull('game_time')
                            ->orWhereRaw("CONCAT(game_date, ' ', game_time) >= ?", [$nowString]);
                    });
            })
            ->orderBy('game_date', 'asc')
            ->orderBy('game_time', 'asc')
            ->get();

        return Inertia::render('Dashboard', [
            'upcoming' => GameResource::collection($upcoming),
            'results' => GameResource::collection($results),
            'now' => $now->toIso8601String(),
        ]);
    }
}
