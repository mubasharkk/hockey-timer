<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Game;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'name',
        'side',
        'score',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }
}
