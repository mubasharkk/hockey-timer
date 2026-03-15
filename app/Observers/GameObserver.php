<?php

namespace App\Observers;

use App\Models\Game;
use App\Services\KnockoutBracketService;

class GameObserver
{
    public function __construct(
        private KnockoutBracketService $bracketService
    ) {}

    public function saved(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id || !$game->knockout_round || !$game->knockout_position) {
            return;
        }

        $this->bracketService->syncBracketSlot($game);

        if ($game->isDirty('status') && $game->status === 'finished') {
            $this->bracketService->advanceWinner($game);
        }
    }

    public function updated(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id || !$game->knockout_round || !$game->knockout_position) {
            return;
        }

        $this->bracketService->syncBracketSlot($game);

        if ($game->wasChanged('status') && $game->status === 'finished') {
            $this->bracketService->advanceWinner($game);
        }
    }

    public function deleted(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id) {
            return;
        }

        $this->bracketService->removeFromBracket($game);
    }
}
