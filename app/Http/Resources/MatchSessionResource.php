<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MatchSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'number' => $this->number,
            'planned_duration_seconds' => $this->planned_duration_seconds,
            'actual_duration_seconds' => $this->actual_duration_seconds,
            'overrun_seconds' => $this->overrun_seconds,
            'break_duration_seconds' => $this->break_duration_seconds,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'break_started_at' => $this->break_started_at,
            'break_ended_at' => $this->break_ended_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
