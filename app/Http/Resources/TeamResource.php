<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'game_id' => $this->game_id,
            'registered_team_id' => $this->registered_team_id,
            'is_registered' => (bool) $this->is_registered,
            'name' => $this->name,
            'side' => $this->side,
            'score' => $this->score,
            'coach' => $this->coach,
            'manager' => $this->manager,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'description' => $this->description,
            'logo_url' => $this->logo_url ?? $this->getFirstMediaUrl('logo') ?: null,
            'players' => PlayerResource::collection($this->whenLoaded('players')),
            'contact_persons' => TeamContactPersonResource::collection($this->whenLoaded('contactPersons')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
