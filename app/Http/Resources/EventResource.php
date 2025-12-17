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
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
