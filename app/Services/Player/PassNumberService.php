<?php

namespace App\Services\Player;

use Illuminate\Support\Str;
use App\Models\Player;

class PassNumberService
{
    /**
     * Resolve pass number - generate if null, validate if provided
     *
     * @param string|null $value
     * @param Player|null $currentPlayer Exclude this player from uniqueness check
     * @return string
     */
    public function resolve(?string $value, ?Player $currentPlayer = null): string
    {
        $candidate = $value ?: $this->generate();

        while ($this->exists($candidate, $currentPlayer)) {
            $candidate = $this->generate();
        }

        return $candidate;
    }

    /**
     * Generate a random pass number
     *
     * @return string
     */
    public function generate(): string
    {
        return Str::upper(Str::random(6));
    }

    /**
     * Check if pass number already exists
     *
     * @param string $passNumber
     * @param Player|null $exclude
     * @return bool
     */
    private function exists(string $passNumber, ?Player $exclude = null): bool
    {
        return Player::where('player_pass_number', $passNumber)
            ->when($exclude?->id, fn ($q) => $q->where('id', '!=', $exclude->id))
            ->exists();
    }
}
