<?php

namespace App\Models\Traits;

trait HasPlayerType
{
    public const TYPE_OFFENSIVE = 'offensive';
    public const TYPE_DEFENSIVE = 'defensive';
    public const TYPE_GOALKEEPER = 'goalkeeper';
    public const TYPE_MIDFIELD = 'midfield';

    public const PLAYER_TYPES = [
        self::TYPE_OFFENSIVE => 'Offensive',
        self::TYPE_DEFENSIVE => 'Defensive',
        self::TYPE_GOALKEEPER => 'Goal Keeper',
        self::TYPE_MIDFIELD => 'Midfield',
    ];

    public function getPlayerTypeLabelAttribute(): ?string
    {
        return self::PLAYER_TYPES[$this->player_type] ?? null;
    }

    public function isOffensive(): bool
    {
        return $this->player_type === self::TYPE_OFFENSIVE;
    }

    public function isDefensive(): bool
    {
        return $this->player_type === self::TYPE_DEFENSIVE;
    }

    public function isGoalkeeper(): bool
    {
        return $this->player_type === self::TYPE_GOALKEEPER;
    }

    public function isMidfield(): bool
    {
        return $this->player_type === self::TYPE_MIDFIELD;
    }
}
