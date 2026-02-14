<?php

namespace App\Services\Game;

use App\Models\Game;

class GameStateService
{
    /**
     * Determine the current session number based on events
     *
     * @param Game $game
     * @return int
     */
    public function determineCurrentSession(Game $game): int
    {
        $sessionModels = $game->sessions()->orderBy('number')->get();
        $eventModels = $game->events()->orderByDesc('occurred_at')->limit(50)->get();

        $sessionCount = max($sessionModels->count(), (int) ($game->getAttribute('sessions') ?? 0));
        $endedSessions = $eventModels->where('event_type', 'session_end')->count();

        return max(1, min($sessionCount ?: 1, $endedSessions + 1));
    }

    /**
     * Check if game is currently running
     *
     * @param Game $game
     * @return bool
     */
    public function isRunning(Game $game): bool
    {
        $lastStartEvent = $game->events()
            ->where(function ($q) {
                $q->where('event_type', 'session_start')
                    ->orWhere(function ($q2) {
                        $q2->where('event_type', 'highlight')
                            ->where('note', 'like', '%session%start%');
                    });
            })
            ->latest('occurred_at')
            ->first();

        $lastEndEvent = $game->events()
            ->whereIn('event_type', ['session_end', 'game_end'])
            ->latest('occurred_at')
            ->first();

        $lastStartAt = $lastStartEvent?->occurred_at;
        $lastEndAt = $lastEndEvent?->occurred_at;

        return $game->status !== 'finished'
            && $lastStartAt
            && (! $lastEndAt || $lastStartAt > $lastEndAt);
    }

    /**
     * Check if game is in break
     *
     * @param Game $game
     * @return bool
     */
    public function isOnBreak(Game $game): bool
    {
        $isRunning = $this->isRunning($game);

        if ($isRunning) {
            return false;
        }

        $currentSessionNumber = $this->determineCurrentSession($game);
        $eventModels = $game->events()->orderByDesc('occurred_at')->limit(50)->get();
        $endedSessions = $eventModels->where('event_type', 'session_end')->count();
        $sessionModels = $game->sessions()->orderBy('number')->get();
        $currentSession = $sessionModels->firstWhere('number', $currentSessionNumber);

        $lastEndEvent = $game->events()
            ->whereIn('event_type', ['session_end', 'game_end'])
            ->latest('occurred_at')
            ->first();

        $lastStartEvent = $game->events()
            ->where(function ($q) {
                $q->where('event_type', 'session_start')
                    ->orWhere(function ($q2) {
                        $q2->where('event_type', 'highlight')
                            ->where('note', 'like', '%session%start%');
                    });
            })
            ->latest('occurred_at')
            ->first();

        $lastEndAt = $lastEndEvent?->occurred_at;
        $lastStartAt = $lastStartEvent?->occurred_at;

        return $endedSessions >= ($currentSessionNumber - 1)
            && (! $currentSession?->started_at || ($lastEndAt && (! $lastStartAt || $lastEndAt >= $lastStartAt)));
    }
}
