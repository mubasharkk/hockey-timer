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

        // Get ID document URLs
        $idDocuments = $this->getMedia('id_document')->map(fn($media) => [
            'id' => $media->id,
            'url' => $media->getUrl(),
            'name' => $media->file_name,
        ])->toArray();

        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'registered_player_id' => $this->registered_player_id,
            'name' => $this->name,
            'shirt_number' => $this->shirt_number,
            'player_pass_number' => $this->player_pass_number,
            'nic_number' => $this->nic_number,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
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
            'id_documents' => $idDocuments,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
