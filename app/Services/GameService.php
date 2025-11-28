<?php

namespace App\Services;

use App\Models\Game;
use App\Models\MatchSession;
use App\Models\Team;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class GameService
{
    /**
        * Create a game with teams, players, and planned sessions.
        */
    public function createGame(array $data, ?User $user = null): Game
    {
        $playersA = $this->parsePlayers($data['team_a_players_text'] ?? '');
        $playersB = $this->parsePlayers($data['team_b_players_text'] ?? '');

        return DB::transaction(function () use ($data, $user, $playersA, $playersB) {
            $game = Game::create([
                'user_id' => $user?->id,
                'team_a_name' => $data['team_a_name'],
                'team_b_name' => $data['team_b_name'],
                'venue' => $data['venue'],
                'game_date' => $data['game_date'],
                'game_time' => $data['game_time'],
                'sessions' => $data['sessions'],
                'session_duration_minutes' => $data['session_duration_minutes'],
                'timer_mode' => $data['timer_mode'],
                'status' => 'scheduled',
            ]);

            $home = Team::create([
                'game_id' => $game->id,
                'name' => $data['team_a_name'],
                'side' => 'home',
            ]);

            $away = Team::create([
                'game_id' => $game->id,
                'name' => $data['team_b_name'],
                'side' => 'away',
            ]);

            $home->players()->createMany($playersA);
            $away->players()->createMany($playersB);

            $this->seedSessions($game, $data['sessions'], $data['session_duration_minutes']);

            return $game;
        });
    }

    /**
     * Update game core attributes.
     */
    public function updateGame(Game $game, array $data): Game
    {
        $game->update([
            'team_a_name' => $data['team_a_name'],
            'team_b_name' => $data['team_b_name'],
            'venue' => $data['venue'],
            'game_date' => $data['game_date'],
            'game_time' => $data['game_time'],
            'sessions' => $data['sessions'],
            'session_duration_minutes' => $data['session_duration_minutes'],
            'timer_mode' => $data['timer_mode'],
        ]);

        // Keep sessions aligned with new session count/duration.
        $this->seedSessions($game, $data['sessions'], $data['session_duration_minutes']);

        return $game;
    }

    /**
     * Ensure planned sessions exist for a game.
     */
    public function seedSessions(Game $game, int $sessionCount, int $durationMinutes): void
    {
        for ($i = 1; $i <= $sessionCount; $i++) {
            MatchSession::firstOrCreate(
                ['game_id' => $game->id, 'number' => $i],
                ['planned_duration_seconds' => $durationMinutes * 60]
            );
        }
    }

    private function parsePlayers(string $block): array
    {
        $players = [];

        foreach (preg_split('/\r\n|\r|\n/', trim($block)) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            if (preg_match('/^(\\d+)\\s+(.+)$/', $line, $matches)) {
                $players[] = [
                    'shirt_number' => (int) $matches[1],
                    'name' => trim($matches[2]),
                ];
            } else {
                $players[] = [
                    'name' => $line,
                ];
            }
        }

        return $players;
    }
}
