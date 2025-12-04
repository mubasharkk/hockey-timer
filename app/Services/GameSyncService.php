<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Game;
use App\Models\MatchSession;
use App\Models\Team;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GameSyncService
{
    public function syncGame(array $data): Game
    {
        return DB::transaction(function () use ($data) {
            $existing = isset($data['id']) ? Game::find($data['id']) : null;
            $code = $data['code'] ?? $existing?->code ?? $this->generateGameCode();

            $game = Game::updateOrCreate(
                ['id' => $data['id'] ?? null],
                [
                    'team_a_name' => $data['team_a_name'],
                    'team_b_name' => $data['team_b_name'],
                    'venue' => $data['venue'],
                    'code' => $code,
                    'game_date' => $data['game_date'],
                    'game_time' => $data['game_time'],
                'sessions' => $data['sessions'],
                'session_duration_minutes' => $data['session_duration_minutes'],
                'timer_mode' => $data['timer_mode'],
                'sport_type' => $data['sport_type'] ?? $existing?->sport_type ?? 'field_hockey',
                'continue_timer_on_goal' => $data['continue_timer_on_goal'] ?? false,
                'game_officials' => $data['game_officials'] ?? $existing?->game_officials,
                'status' => $data['status'] ?? 'scheduled',
            ]
        );

            if (!empty($data['teams'])) {
                collect($data['teams'])->each(function (array $team) use ($game) {
                    Team::updateOrCreate(
                        ['id' => $team['id'] ?? null],
                        [
                            'game_id' => $game->id,
                            'name' => $team['name'],
                            'side' => $team['side'],
                            'score' => $team['score'] ?? 0,
                            'coach' => $team['coach'] ?? null,
                            'manager' => $team['manager'] ?? null,
                        ]
                    );
                });
            }

            $this->ensurePlannedSessions($game);

            return $game;
        });
    }

    public function syncSessions(Game $game, array $sessions): Collection
    {
        return collect($sessions)->map(function (array $session) use ($game) {
            $attrs = [
                'planned_duration_seconds' => $session['planned_duration_seconds'],
                'actual_duration_seconds' => $session['actual_duration_seconds'] ?? null,
                'overrun_seconds' => $session['overrun_seconds'] ?? null,
                'break_duration_seconds' => $session['break_duration_seconds'] ?? null,
                'started_at' => $session['started_at'] ?? null,
                'ended_at' => $session['ended_at'] ?? null,
                'break_started_at' => $session['break_started_at'] ?? null,
                'break_ended_at' => $session['break_ended_at'] ?? null,
            ];

            if (!empty($session['id'])) {
                $record = MatchSession::where('game_id', $game->id)
                    ->where('id', $session['id'])
                    ->first();

                if ($record) {
                    $record->update($attrs);
                    return $record->id;
                }
            }

            $record = MatchSession::updateOrCreate(
                ['game_id' => $game->id, 'number' => $session['number']],
                $attrs
            );

            return $record->id;
        });
    }

    public function syncEvents(Game $game, array $events): Collection
    {
        $collection = collect($events)->map(function (array $event) use ($game) {
            $sessionModel = null;
            if (!empty($event['session_number'])) {
                $sessionModel = $game->sessions()->where('number', $event['session_number'])->first();
            }

            $occurredAt = !empty($event['occurred_at']) ? Carbon::parse($event['occurred_at']) : now();
            $timerSeconds = $event['timer_value_seconds'] ?? null;
            if ($sessionModel?->started_at instanceof Carbon) {
                $timerSeconds = max(0, $occurredAt->diffInSeconds($sessionModel->started_at));
            }

            $playerName = null;
            if (!empty($event['player_shirt_number']) && !empty($event['team_id'])) {
                $playerName = optional($game->teams()->with('players')->find($event['team_id']))
                    ?->players
                    ->firstWhere('shirt_number', $event['player_shirt_number'])
                    ?->name;
            }

            $cardMinutes = null;
            if (!empty($event['card_minutes'])) {
                $cardMinutes = (int) $event['card_minutes'];
            } elseif ($timerSeconds !== null) {
                $cardMinutes = (int) floor($timerSeconds / 60);
            }

            $note = $event['note'] ?? null;
            if ($event['event_type'] === 'card') {
                $parts = [];
                if ($playerName) $parts[] = $playerName;
                if ($cardMinutes !== null) $parts[] = "{$cardMinutes}m";
                $note = implode(' / ', array_filter($parts));
            } elseif (! $note && $playerName) {
                $note = $playerName;
            }

            $created = Event::create([
                'game_id' => $game->id,
                'team_id' => $event['team_id'] ?? null,
                'session_number' => $event['session_number'],
                'event_type' => $event['event_type'],
                'goal_type' => $event['goal_type'] ?? null,
                'card_type' => $event['card_type'] ?? null,
                'player_shirt_number' => $event['player_shirt_number'] ?? null,
                'timer_value_seconds' => $timerSeconds,
                'occurred_at' => $occurredAt,
                'note' => $note,
            ]);

            // Auto-attach player name to note for card/goal events when a shirt number is provided.
            if (
                ! $created->note
                && $created->player_shirt_number
                && in_array($created->event_type, ['goal', 'card'], true)
                && $created->team_id
            ) {
                $playerName = optional($created->team?->players)
                    ->firstWhere('shirt_number', $created->player_shirt_number)?->name;
                if ($playerName) {
                    $created->update(['note' => $playerName]);
                }
            }

            return $created;
        });

        $hasGameEnd = $collection->contains(fn (Event $e) => $e->event_type === 'game_end')
            || $game->events()->where('event_type', 'game_end')->exists();

        if ($hasGameEnd) {
            $endedAt = $collection
                ->where('event_type', 'game_end')
                ->map(fn (Event $e) => $e->occurred_at)
                ->filter()
                ->sortDesc()
                ->first() ?? now();

            $game->forceFill([
                'status' => 'finished',
                'ended_at' => $endedAt,
            ])->save();
        }

        return $collection;
    }

    private function ensurePlannedSessions(Game $game): void
    {
        for ($i = 1; $i <= $game->sessions; $i++) {
            MatchSession::firstOrCreate(
                ['game_id' => $game->id, 'number' => $i],
                ['planned_duration_seconds' => $game->session_duration_minutes * 60]
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
