<?php

namespace App\Observers;

use App\Models\Event;
use App\Models\Player;

class EventObserver
{
    public function created(Event $event): void
    {
        $this->updatePlayerStats($event);
    }

    public function updated(Event $event): void
    {
        // If player_id changed, update both old and new player
        if ($event->isDirty('player_id')) {
            $oldPlayerId = $event->getOriginal('player_id');
            if ($oldPlayerId) {
                $this->recalculatePlayerStats($oldPlayerId);
            }
        }

        $this->updatePlayerStats($event);
    }

    public function deleted(Event $event): void
    {
        if ($event->player_id) {
            $this->recalculatePlayerStats($event->player_id);
        }
    }

    private function updatePlayerStats(Event $event): void
    {
        if (!$event->player_id) {
            return;
        }

        $this->recalculatePlayerStats($event->player_id);
    }

    private function recalculatePlayerStats(int $playerId): void
    {
        $player = Player::find($playerId);
        if (!$player) {
            return;
        }

        $events = Event::where('player_id', $playerId)->get();

        $player->update([
            'total_games' => $events->pluck('game_id')->unique()->count(),
            'total_goals' => $events->where('event_type', 'goal')->count(),
            'total_green_cards' => $events->where('event_type', 'card')->where('card_type', 'green')->count(),
            'total_yellow_cards' => $events->where('event_type', 'card')->where('card_type', 'yellow')->count(),
            'total_red_cards' => $events->where('event_type', 'card')->where('card_type', 'red')->count(),
            'total_penalty_corners' => $events->where('event_type', 'penalty_corner')->count(),
            'total_penalty_strokes' => $events->where('event_type', 'penalty_stroke')->count(),
        ]);
    }
}
