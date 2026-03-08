<?php

namespace App\Http\Resources;

use App\Models\Team;
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
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'club_id' => $this->club_id,
            'name' => $this->name,
            'type' => $this->type,
            'type_label' => $this->type_label,
            'side' => $this->side,
            'score' => $this->score,
            'coach' => $this->coach,
            'manager' => $this->manager,
            'email' => $this->email,
            'phone' => $this->phone,
            'description' => $this->description,
            'logo_url' => $this->logo_url ?? $this->getFirstMediaUrl('logo') ?: null,
            'club' => new ClubResource($this->whenLoaded('club')),
            'players' => PlayerResource::collection($this->whenLoaded('players')),
            'players_count' => $this->when(isset($this->players_count), $this->players_count),
            'contact_persons' => ContactPersonResource::collection($this->whenLoaded('contactPersons')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public static function teamTypes(): array
    {
        return Team::TYPES;
    }
}
