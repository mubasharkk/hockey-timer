<?php

namespace Tests\Unit\Actions\Players;

use App\Actions\Players\CreatePlayerFromScannedIdAction;
use App\Actions\Players\CreatePlayerAction;
use App\Services\IdDocumentService;
use App\Services\ImageService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CreatePlayerFromScannedIdActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_player_from_scanned_id_using_services(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $idService = $this->createMock(IdDocumentService::class);
        $idService->method('extractFromDocuments')->willReturn([
            'name' => 'Test Player',
            'nic_number' => 'NIC123',
            'date_of_birth' => '2000-01-01',
        ]);

        $imageService = $this->createMock(ImageService::class);
        $imageService->method('processMultiple')->willReturn([UploadedFile::fake()->image('id.jpg')]);

        $createPlayerAction = new CreatePlayerAction();

        $action = new CreatePlayerFromScannedIdAction($idService, $imageService, $createPlayerAction);

        $files = [UploadedFile::fake()->image('id.jpg')];

        $player = $action->execute($files, 'additional', $user);

        $this->assertNotNull($player);
        $this->assertEquals('Test Player', $player->name);
        $this->assertEquals('NIC123', $player->nic_number);
    }
}
