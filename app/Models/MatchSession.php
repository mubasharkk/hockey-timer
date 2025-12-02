<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Game;

class MatchSession extends Model
{
    use HasFactory;

    protected $table = 'match_sessions';

    protected $fillable = [
        'game_id',
        'number',
        'planned_duration_seconds',
        'actual_duration_seconds',
        'overrun_seconds',
        'break_duration_seconds',
        'started_at',
        'ended_at',
        'break_started_at',
        'break_ended_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'break_started_at' => 'datetime',
        'break_ended_at' => 'datetime',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

}
