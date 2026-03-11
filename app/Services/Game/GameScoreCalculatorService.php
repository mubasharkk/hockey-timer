<?php

namespace App\Services\Game;

use App\Models\Game;

class GameScoreCalculatorService
{
    /**
     * Calculate scores by aggregating goal events for each team
     *
     * @param Game $game
     * @return array With 'home' and 'away' keys
     */
    public function calculateScores(Game $game): array
    {
        $goalCounts = $game->events()
            ->selectRaw('team_id, COUNT(*) as total')
            ->where('event_type', 'goal')
            ->groupBy('team_id')
            ->pluck('total', 'team_id');


        $home = $game->homeTeam;
        $away = $game->awayTeam;
        return [
            'home' => $home ? ($goalCounts[$home->id] ?? $home->score ?? 0) : 0,
            'away' => $away ? ($goalCounts[$away->id] ?? $away->score ?? 0) : 0,
        ];
    }
}
