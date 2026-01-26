<?php

namespace App\Http\Resources;

use App\Models\Player;
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
            'name' => $this->name,
            'shirt_number' => $this->shirt_number,
            'player_pass_number' => $this->player_pass_number,
            'nic_number' => $this->nic_number,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'phone' => $this->phone,
            'blood_group' => $this->blood_group,
            'player_type' => $this->player_type,
            'player_type_label' => $this->player_type_label,
            'description' => $this->description,
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
            'contact_persons' => ContactPersonResource::collection($this->whenLoaded('contactPersons')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get blood group options for forms.
     */
    public static function bloodGroups(): array
    {
        return Player::BLOOD_GROUPS;
    }

    /**
     * Get player type options for forms.
     */
    public static function playerTypes(): array
    {
        return Player::PLAYER_TYPES;
    }
}
