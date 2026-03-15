<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        $game = $this->relationLoaded('game') ? $this->game : null;
        $team = $this->relationLoaded('team') ? $this->team : null;

        // Determine opponent team name
        $opponentTeam = null;
        if ($game) {
            $playerTeamId = $this->team_id;
            if ($game->home_team_id == $playerTeamId) {
                $opponentTeam = $game->team_b_name;
            } elseif ($game->away_team_id == $playerTeamId) {
                $opponentTeam = $game->team_a_name;
            } else {
                // Fallback: if team IDs don't match, use the other team name
                $opponentTeam = $game->team_a_name === ($team?->name ?? '') ? $game->team_b_name : $game->team_a_name;
            }
        }

        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'team_id' => $this->team_id,
            'session_number' => $this->session_number,
            'event_type' => $this->event_type,
            'goal_type' => $this->goal_type,
            'card_type' => $this->card_type,
            'player_shirt_number' => $this->player_shirt_number,
            'timer_value_seconds' => $this->timer_value_seconds,
            'occurred_at' => $this->occurred_at,
            'note' => $this->note,
            'game' => $game ? [
                'id' => $game->id,
                'team_a_name' => $game->team_a_name,
                'team_b_name' => $game->team_b_name,
                'game_date' => $game->game_date,
                'game_time' => $game->game_time,
                'code' => $game->code,
                'tournament_name' => $game->relationLoaded('tournament') ? $game->tournament?->title : null,
            ] : null,
            'team' => $team ? [
                'id' => $team->id,
                'name' => $team->name,
            ] : null,
            'opponent_team' => $opponentTeam,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
