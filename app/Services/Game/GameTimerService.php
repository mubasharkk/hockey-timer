<?php

namespace App\Services\Game;

use App\Models\Game;

class GameTimerService
{
    /**
     * Calculate timer value based on game state and mode
     *
     * @param Game $game
     * @param int $elapsedSeconds
     * @param int|null $plannedSeconds
     * @param bool $isRunning
     * @return int
     */
    public function calculateTimerValue(
        Game $game,
        int $elapsedSeconds,
        ?int $plannedSeconds = null,
        bool $isRunning = false
    ): int {
        if (! $isRunning) {
            return 0;
        }

        $plannedSeconds = $plannedSeconds ?? ($game->session_duration_minutes * 60);

        if ($game->timer_mode === 'DESC') {
            return max($plannedSeconds - $elapsedSeconds, 0);
        }

        return max($elapsedSeconds, 0);
    }
}
