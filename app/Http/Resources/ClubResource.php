<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClubResource extends JsonResource
{
    public function toArray($request): array
    {
        $address = $this->relationLoaded('addresses')
            ? $this->addresses->first()
            : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'description' => $this->description,
            'logo_url' => $this->logo_url ?? $this->getFirstMediaUrl('logo') ?: null,
            'address' => $address ? [
                'street' => $address->street,
                'city' => $address->city,
                'state' => $address->state,
                'post_code' => $address->post_code,
                'country_id' => $address->country_id,
            ] : null,
            'teams' => TeamResource::collection($this->whenLoaded('teams')),
            'teams_count' => $this->when(isset($this->teams_count), $this->teams_count),
            'contact_persons' => ContactPersonResource::collection($this->whenLoaded('contactPersons')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
