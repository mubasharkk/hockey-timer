<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use App\Http\Resources\GameResource;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    private const CACHE_TTL = 300; // 5 minutes

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

        // Query 1: Get finished/completed games (results) - cached
        $results = Game::query()
                ->with('tournament:id,title')
                ->select($selectFields)
                ->where(function ($query) use ($nowString) {
                    $query->where('status', 'finished')
                        ->orWhereNotNull('ended_at')
                        ->orWhere(function ($q) use ($nowString) {
                            $q->whereNotNull('game_date')
                                ->whereNotNull('game_time')
                                ->whereRaw("CONCAT(game_date, ' ', game_time) < ?", [$nowString]);
                        });
                })
                ->orderBy('game_date', 'desc')
                ->orderBy('game_time', 'desc')
                ->limit(20)
                ->get();

        // Query 2: Get upcoming/scheduled games - not cached for real-time updates
        $upcoming = Game::query()
                ->with('tournament:id,title')
                ->select($selectFields)
                ->where(function ($query) use ($nowString) {
                    $query->where(function ($q) {
                        $q->where('status', '!=', 'finished')
                            ->orWhereNull('status');
                    })
                        ->whereNull('ended_at')
                        ->where(function ($q) use ($nowString) {
                            $q->whereNull('game_date')
                                ->orWhereNull('game_time')
                                ->orWhereRaw("CONCAT(game_date, ' ', game_time) >= ?", [$nowString]);
                        });
                })
                ->orderBy('game_date', 'asc')
                ->orderBy('game_time', 'asc')
                ->limit(20)
                ->get();

        return Inertia::render('Dashboard', [
            'upcoming' => GameResource::collection($upcoming),
            'results' => GameResource::collection($results),
            'now' => $now->toIso8601String(),
        ]);
    }
}
