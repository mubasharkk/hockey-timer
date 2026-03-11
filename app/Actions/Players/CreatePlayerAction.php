<?php

namespace App\Actions\Players;

use App\Models\Player;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CreatePlayerAction
{
    public function execute(array $data, $user, array $address = [], array $photos = []): Player
    {
        return DB::transaction(function () use ($data, $user, $address, $photos) {
            $player = Player::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'player_pass_number' => $this->resolvePassNumber($data['player_pass_number'] ?? null),
                'nic_number' => $data['nic_number'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'phone' => $data['phone'] ?? null,
                'blood_group' => $data['blood_group'] ?? null,
                'player_type' => $data['player_type'] ?? null,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (!empty($address) && ($address['street'] ?? null) && ($address['city'] ?? null) && ($address['post_code'] ?? null)) {
                try {
                    $country = $address['country'] ?? 'PK';
                    $player->addAddress([
                        'street' => $address['street'],
                        'street_extra' => $address['street_extra'] ?? null,
                        'city' => $address['city'],
                        'state' => $address['state'] ?? null,
                        'post_code' => $address['post_code'] ?? '----',
                        'country' => $country,
                    ]);
                } catch (\Exception $e) {

                }
            }

            foreach ($photos as $photo) {
                try {
                    $player->addMedia($photo->getRealPath())
                        ->usingName($photo->getClientOriginalName())
                        ->preservingOriginal()
                        ->toMediaCollection('photo');
                } catch (\Exception $e) {
                }
            }

            return $player;
        });
    }

    private function resolvePassNumber(?string $value): string
    {
        $candidate = $value ?: $this->generatePassNumber();
        while (Player::withInactive()->where('player_pass_number', $candidate)->exists()) {
            $candidate = $this->generatePassNumber();
        }
        return $candidate;
    }

    private function generatePassNumber(): string
    {
        return Str::upper(Str::random(6));
    }
}
