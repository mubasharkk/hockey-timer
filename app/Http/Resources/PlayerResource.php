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

        // Get shirt number from pivot if loaded via team relationship
        $shirtNumber = $this->pivot?->shirt_number ?? null;

        return [
            'id' => $this->id,
            'name' => $this->name,
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
            'shirt_number' => $shirtNumber,
            'pivot' => $this->whenPivotLoaded('player_team', fn () => [
                'shirt_number' => $this->pivot->shirt_number,
                'is_active' => (bool) $this->pivot->is_active,
            ]),
            'address' => $address ? [
                'street' => $address->street,
                'street_extra' => $address->street_extra,
                'city' => $address->city,
                'state' => $address->state,
                'post_code' => $address->post_code,
                'country' => $address->country?->only('name', 'iso_3166_2'),
            ] : null,
            'addresses' => $this->whenLoaded('addresses', fn () => $this->addresses),
            'photo_url' => $this->getFirstMediaUrl('photo') ?: null,
            'id_documents' => $idDocuments,
            'contact_persons' => ContactPersonResource::collection($this->whenLoaded('contactPersons')),
            'teams' => TeamResource::collection($this->whenLoaded('teams')),
            'statistics' => [
                'total_games' => $this->total_games ?? 0,
                'total_goals' => $this->total_goals ?? 0,
                'total_green_cards' => $this->total_green_cards ?? 0,
                'total_yellow_cards' => $this->total_yellow_cards ?? 0,
                'total_red_cards' => $this->total_red_cards ?? 0,
            ],
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
