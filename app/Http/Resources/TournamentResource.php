<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'venue' => $this->venue,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'win_points' => $this->win_points,
            'draw_points' => $this->draw_points,
            'loss_points' => $this->loss_points,
            'logo_url' => $this->getFirstMediaUrl('logo') ?: null,
            'sponsor_logo_urls' => $this->getMedia('sponsor_logos')->map->getUrl()->all(),
            'pools' => TournamentPoolResource::collection($this->whenLoaded('pools')),
            'games' => GameResource::collection($this->whenLoaded('games')),
            'contact_persons' => ContactPersonResource::collection($this->whenLoaded('contactPersons')),
        ];
    }
}
