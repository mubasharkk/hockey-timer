<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Game;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'game_id',
        'registered_team_id',
        'is_registered',
        'name',
        'side',
        'score',
        'coach',
        'manager',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function pools(): BelongsToMany
    {
        return $this->belongsToMany(TournamentPool::class, 'tournament_pool_team')->withTimestamps();
    }
}
