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
        'sport_type',
        'continue_timer_on_goal',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'game_date' => 'date',
        'game_time' => 'datetime:H:i',
        'sport_type' => 'string',
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

    /**
     * Return per-team scores for a given session. If $aggregate is true,
     * scores include all sessions up to the requested session.
     */
    public function sessionScores(int $sessionNumber, bool $aggregate = false): array
    {
        $teams = $this->relationLoaded('teams') ? $this->teams : $this->teams()->get();
        $events = $this->relationLoaded('events')
            ? $this->events
            : $this->events()->get(['team_id', 'session_number', 'event_type']);

        $targetSessions = $aggregate
            ? fn ($evt) => $evt->session_number <= $sessionNumber
            : fn ($evt) => $evt->session_number === $sessionNumber;

        $scores = [];
        foreach ($teams as $team) {
            $scores[$team->id] = [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'side' => $team->side,
                'score' => $events
                    ->where('team_id', $team->id)
                    ->where('event_type', 'goal')
                    ->filter($targetSessions)
                    ->count(),
            ];
        }

        return array_values($scores);
    }
}
