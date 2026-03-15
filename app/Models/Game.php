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
        'game_type',
        'tournament_pool_id',
        'knockout_round',
        'knockout_position',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    public function tournamentPool(): BelongsTo
    {
        return $this->belongsTo(TournamentPool::class);
    }

    public static function allowedTypes(): array
    {
        return config('game.types', []);
    }

    public static function allowedKnockoutRounds(): array
    {
        return config('game.knockout_rounds', []);
    }

    // Query Scopes
    public function scopeFinished($query)
    {
        return $query->where('status', 'finished')
            ->orWhereNotNull('ended_at');
    }

    public function scopeUpcoming($query)
    {
        return $query->where(function ($q) {
            $q->where('status', '!=', 'finished')
                ->orWhereNull('status');
        })->whereNull('ended_at');
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeWithRelations($query)
    {
        return $query->with(['tournament:id,title']);
    }

    /**
     * Get all goal counts in a single query. Returns [home => n, away => n].
     * Use this instead of homeFinalScore() + awayFinalScore() to avoid N+1.
     */
    public function getGoalCounts(): array
    {
        if (! $this->home_team_id && ! $this->away_team_id) {
            return ['home' => 0, 'away' => 0];
        }

        $counts = Event::query()
            ->select('team_id', DB::raw('COUNT(*) as total'))
            ->where('game_id', $this->id)
            ->where('event_type', 'goal')
            ->whereIn('team_id', [$this->home_team_id, $this->away_team_id])
            ->groupBy('team_id')
            ->pluck('total', 'team_id');

        return [
            'home' => (int) ($counts[$this->home_team_id] ?? 0),
            'away' => (int) ($counts[$this->away_team_id] ?? 0),
        ];
    }

    public function homeFinalScore(): int
    {
        return $this->getGoalCounts()['home'];
    }

    public function awayFinalScore(): int
    {
        return $this->getGoalCounts()['away'];
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
