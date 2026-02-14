<?php

namespace App\Services\Player;

use App\Models\Player;
use App\Models\Event;
use App\Http\Resources\GameResource;

class PlayerEventQueryService
{
    /**
     * Get player's recent games
     *
     * @param Player $player
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public function getRecentGames(Player $player, int $limit = 10): \Illuminate\Support\Collection
    {
        $gameIds = Event::where('player_id', $player->id)
            ->pluck('game_id')
            ->unique();

        if ($gameIds->isEmpty()) {
            return collect();
        }

        return \App\Models\Game::whereIn('id', $gameIds)
            ->with('tournament:id,title')
            ->orderBy('game_date', 'desc')
            ->orderBy('game_time', 'desc')
            ->limit($limit)
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
    }

    /**
     * Get player's game events
     *
     * @param Player $player
     * @param int $limit
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function getPlayerEvents(Player $player, int $limit = 50): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $events = Event::where('player_id', $player->id)
            ->with(['game:id,team_a_name,team_b_name,home_team_id,away_team_id,game_date,game_time,code', 'team:id,name'])
            ->orderBy('occurred_at', 'desc')
            ->limit($limit)
            ->get();

        return \App\Http\Resources\EventResource::collection($events);
    }
}
