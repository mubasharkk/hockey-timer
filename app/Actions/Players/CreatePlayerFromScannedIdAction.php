<?php

namespace App\Actions\Players;

use App\Models\Player;
use App\Services\IdDocumentService;
use App\Services\ImageService;
use Illuminate\Http\UploadedFile;

class CreatePlayerFromScannedIdAction
{
    public function __construct(
        private IdDocumentService $idDocumentService,
        private ImageService $imageService,
        private CreatePlayerAction $createPlayerAction,
    ) {}

    public function execute(array $files, ?string $additionalInfo, $user): Player
    {
        $processed = $this->imageService->processMultiple($files);
        $extracted = $this->idDocumentService->extractFromDocuments($processed, $additionalInfo);

        $nic = $extracted['nic_number'] ?? null;
        if ($nic) {
            $existing = Player::where('nic_number', $nic)->first();
            if ($existing) {
                return $existing;
            }
        }

        $payload = [
            'name' => $extracted['name'] ?? 'New Player',
            'player_pass_number' => $extracted['player_pass_number'] ?? null,
            'nic_number' => $extracted['nic_number'] ?? null,
            'date_of_birth' => $extracted['date_of_birth'] ?? null,
            'gender' => $extracted['gender'] ?? null,
            'phone' => $extracted['phone'] ?? null,
            'blood_group' => $extracted['blood_group'] ?? null,
            'player_type' => $extracted['player_type'] ?? null,
            'description' => $additionalInfo,
            'is_active' => true,
        ];

        $address = $extracted['address'] ?? [];

        return $this->createPlayerAction->execute($payload, $user, $address, $processed);
    }
}
