<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Game;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'team_id',
        'session_number',
        'event_type',
        'goal_type',
        'card_type',
        'player_shirt_number',
        'timer_value_seconds',
        'occurred_at',
        'note',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
