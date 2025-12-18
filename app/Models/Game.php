<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Tournament;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

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
        $home = $this->homeTeam;
        $away = $this->awayTeam;

        $goalCounts = Event::query()
            ->select('team_id', DB::raw('COUNT(*) as total'))
            ->where('game_id', $this->id)
            ->where('event_type', 'goal')
            ->when($aggregate, fn ($q) => $q->where('session_number', '<=', $sessionNumber))
            ->when(! $aggregate, fn ($q) => $q->where('session_number', $sessionNumber))
            ->groupBy('team_id')
            ->pluck('total', 'team_id');

        $scores = [];
        foreach (collect([$home, $away]) as $team) {
            $scores[$team->id] = [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'side' => $team->id === $home->id ? 'home' : 'away',
                'score' => (int) ($goalCounts[$team->id] ?? 0),
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
