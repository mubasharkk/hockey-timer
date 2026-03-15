<?php

namespace App\Observers;

use App\Models\Tournament;
use App\Services\KnockoutBracketService;

class TournamentObserver
{
    public function __construct(
        private KnockoutBracketService $bracketService
    ) {}

    /**
     * Rebuild knockout bracket when tournament is updated.
     * This ensures bracket stays in sync when teams change or tournament config changes.
     */
    public function updated(Tournament $tournament): void
    {
        // Rebuild if knockout_bracket changed or any relevant field
        if ($tournament->wasChanged('knockout_bracket') || $tournament->wasChanged('title')) {
            $this->bracketService->rebuildBracket($tournament);
        }
    }
}
