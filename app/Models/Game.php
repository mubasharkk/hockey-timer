<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use HasFactory;

    protected $table = 'games';

    protected $fillable = [
        'user_id',
        'team_a_name',
        'team_b_name',
        'venue',
        'code',
        'game_date',
        'game_time',
        'sessions',
        'session_duration_minutes',
        'timer_mode',
        'continue_timer_on_goal',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'game_date' => 'date',
        'game_time' => 'datetime:H:i',
        'continue_timer_on_goal' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class, 'game_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(MatchSession::class, 'game_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'game_id');
    }
}
