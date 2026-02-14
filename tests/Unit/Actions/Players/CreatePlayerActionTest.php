<?php

namespace Tests\Unit\Actions\Players;

use App\Actions\Players\CreatePlayerAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CreatePlayerActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_player_and_attaches_media(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $payload = [
            'name' => 'Player Name',
            'nic_number' => 'NIC999',
        ];

        $photos = [UploadedFile::fake()->image('photo.jpg')];

        $action = new CreatePlayerAction();

        $player = $action->execute($payload, $user, [], $photos);

        $this->assertNotNull($player);
        $this->assertDatabaseHas('players', ['id' => $player->id, 'name' => 'Player Name']);
        $this->assertGreaterThan(0, $player->getMedia('photo')->count());
    }
}
