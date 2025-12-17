<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        $address = $this->relationLoaded('addresses')
            ? $this->addresses->first()
            : null;

        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'registered_player_id' => $this->registered_player_id,
            'name' => $this->name,
            'shirt_number' => $this->shirt_number,
            'player_pass_number' => $this->player_pass_number,
            'nic_number' => $this->nic_number,
            'date_of_birth' => $this->date_of_birth,
            'is_active' => (bool) $this->is_active,
            'address' => $address ? [
                'street' => $address->street,
                'street_extra' => $address->street_extra,
                'city' => $address->city,
                'state' => $address->state,
                'post_code' => $address->post_code,
                'country_id' => $address->country_id,
            ] : null,
            'photo_url' => $this->getFirstMediaUrl('photo') ?: null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
