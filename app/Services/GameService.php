<?php

namespace App\Services;

use App\Models\Game;
use App\Models\MatchSession;
use App\Models\Team;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class GameService
{
    /**
        * Create a game with teams, players, and planned sessions.
        */
    public function createGame(array $data, ?User $user = null): Game
    {
        $homeTemplate = Team::with('players')->findOrFail($data['home_team_id']);
        $awayTemplate = Team::with('players')->findOrFail($data['away_team_id']);

        if (! $homeTemplate->is_registered || ! $awayTemplate->is_registered) {
            throw new \InvalidArgumentException('Teams must be registered before creating a game.');
        }

        return DB::transaction(function () use ($data, $user, $homeTemplate, $awayTemplate) {
            $game = Game::create([
                'user_id' => $user?->id,
                'tournament_id' => $data['tournament_id'] ?? null,
                'team_a_name' => $homeTemplate->name,
                'team_b_name' => $awayTemplate->name,
                'home_team_id' => $homeTemplate->id,
                'away_team_id' => $awayTemplate->id,
                'venue' => $data['venue'],
                'excerpt' => $data['excerpt'] ?? null,
                'notes' => $data['notes'] ?? null,
                'code' => $this->generateGameCode(),
                'game_date' => $data['game_date'],
                'game_time' => $data['game_time'],
                'sessions' => $data['sessions'],
                'session_duration_minutes' => $data['session_duration_minutes'],
                'timer_mode' => $data['timer_mode'],
                'sport_type' => $data['sport_type'] ?? 'field_hockey',
                'continue_timer_on_goal' => $data['continue_timer_on_goal'] ?? false,
                'game_officials' => $data['game_officials'] ?? null,
                'status' => 'scheduled',
            ]);

            $this->seedSessions($game, $data['sessions'], $data['session_duration_minutes']);

            return $game->setRelation('teams', collect([$homeTemplate, $awayTemplate]));
        });
    }

    /**
     * Update game core attributes.
     */
    public function updateGame(Game $game, array $data): Game
    {
        return DB::transaction(function () use ($game, $data) {
            $game->update([
                'tournament_id' => $data['tournament_id'] ?? $game->tournament_id,
                'venue' => $data['venue'],
                'excerpt' => $data['excerpt'] ?? $game->excerpt,
                'notes' => $data['notes'] ?? $game->notes,
                'game_date' => $data['game_date'],
                'game_time' => $data['game_time'],
                'sessions' => $data['sessions'],
                'session_duration_minutes' => $data['session_duration_minutes'],
                'timer_mode' => $data['timer_mode'],
                'sport_type' => $data['sport_type'] ?? $game->sport_type ?? 'field_hockey',
                'continue_timer_on_goal' => $data['continue_timer_on_goal'] ?? false,
                'game_officials' => $data['game_officials'] ?? $game->game_officials,
            ]);

            // Keep sessions aligned with new session count/duration.
            $this->seedSessions($game, $data['sessions'], $data['session_duration_minutes']);

            return $game;
        });
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

    private function generateGameCode(): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (Game::where('code', $code)->exists());

        return $code;
    }
}
