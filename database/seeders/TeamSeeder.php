<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstWhere('email', 'm.khokhar@social-gizmo.com');

        if (! $user) {
            $this->command?->warn('Seed skipped: user m.khokhar@social-gizmo.com not found.');
            return;
        }

        $faker = Faker::create();
        $existingPasses = Player::pluck('player_pass_number')->filter()->all();

        for ($i = 1; $i <= 8; $i++) {
            $team = Team::create([
                'user_id' => $user->id,
                'name' => "Team " . Str::upper(Str::random(4)),
                'is_registered' => true,
                'coach' => $faker->name(),
                'manager' => $faker->name(),
            ]);

            $playerCount = rand(12, 15);
            $shirtNumbers = Arr::shuffle(range(1, 30));
            $players = [];

            for ($p = 0; $p < $playerCount; $p++) {
                $players[] = [
                    'registered_player_id' => null,
                    'name' => $faker->name(),
                    'shirt_number' => $shirtNumbers[$p],
                    'player_pass_number' => $this->uniquePass($existingPasses),
                    'nic_number' => $faker->numerify('#############'),
                    'date_of_birth' => $faker->dateTimeBetween('-30 years', '-16 years')->format('Y-m-d'),
                    'is_active' => (bool) rand(0, 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                    'team_id' => $team->id,
                ];
            }

            $team->players()->insert($players);
        }
    }

    private function uniquePass(array &$existing): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (in_array($code, $existing, true) || Player::where('player_pass_number', $code)->exists());

        $existing[] = $code;

        return $code;
    }
}
