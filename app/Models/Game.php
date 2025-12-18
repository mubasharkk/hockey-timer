<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Tournament;

class Game extends Model
{
    use CrudTrait;
    use HasFactory;

    protected $table = 'games';

    protected $fillable = [
        'user_id',
        'team_a_name',
        'team_b_name',
        'home_team_id',
        'away_team_id',
        'tournament_id',
        'venue',
        'excerpt',
        'notes',
        'code',
        'game_date',
        'game_time',
        'sessions',
        'session_duration_minutes',
        'timer_mode',
        'sport_type',
        'continue_timer_on_goal',
        'game_officials',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'game_date' => 'date',
        'sport_type' => 'string',
        'continue_timer_on_goal' => 'boolean',
        'game_officials' => 'string',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class, 'game_id');
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(MatchSession::class, 'game_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'game_id');
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /**
     * Return per-team scores for a given session. If $aggregate is true,
     * scores include all sessions up to the requested session.
     */
    public function sessionScores(int $sessionNumber, bool $aggregate = false): array
    {
        $teams = $this->relationLoaded('teams') ? $this->teams : $this->teams()->get(['id', 'name', 'side']);

        $eventsQuery = $this->events()->where('event_type', 'goal');
        if ($aggregate) {
            $eventsQuery->where('session_number', '<=', $sessionNumber);
        } else {
            $eventsQuery->where('session_number', $sessionNumber);
        }

        $events = $this->relationLoaded('events')
            ? $this->events->where('event_type', 'goal')->filter(function ($evt) use ($sessionNumber, $aggregate) {
                return $aggregate
                    ? $evt->session_number <= $sessionNumber
                    : $evt->session_number === $sessionNumber;
            })
            : $eventsQuery->get(['team_id', 'session_number']);

        $scores = [];
        foreach ($teams as $team) {
            $scores[$team->id] = [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'side' => $team->side,
                'score' => $events->where('team_id', $team->id)->count(),
            ];
        }

        return array_values($scores);
    }

    public function getGameReportName()
    {
        $dt = date('YmdHis');
        return "Game-Report-{$this->code}-{$dt}.pdf";
    }
}
