<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\JsonResponse;

class DashboardStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'clubs' => Club::count(),
            'teams' => Team::count(),
            'players' => Player::withInactive()->count(),
            'active_players' => Player::count(),
        ]);
    }
}
