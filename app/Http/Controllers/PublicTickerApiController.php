<?php

namespace App\Http\Controllers;

use App\Http\Resources\GameResource;
use App\Http\Resources\MatchSessionResource;
use App\Models\Game;
use App\Services\Game\GameScoreCalculatorService;
use App\Services\Game\GameStateService;
use App\Services\Game\GameTimerService;
use Illuminate\Http\JsonResponse;

class PublicTickerApiController extends Controller
{
    public function __construct(
        private readonly GameScoreCalculatorService $scoreCalculator,
        private readonly GameStateService $gameStateService,
        private readonly GameTimerService $timerService,
    ) {}

    public function show(Game $game): JsonResponse
    {
        $game->load([
            'homeTeam.media',
            'awayTeam.media',
            'tournament' => fn ($q) => $q->with('media'),
        ]);

        $sessionModels = $game->sessions()->orderBy('number')->get();
        $eventModels = $game->events()->orderByDesc('occurred_at')->limit(50)->get();

        $scores = $this->scoreCalculator->calculateScores($game);
        $currentSessionNumber = $this->gameStateService->determineCurrentSession($game);
        $isRunning = $this->gameStateService->isRunning($game);
        $isBreak = $this->gameStateService->isOnBreak($game);

        $currentSession = $sessionModels->firstWhere('number', $currentSessionNumber)
            ?: $sessionModels->sortBy('number')->first();

        $elapsed = $currentSession?->actual_duration_seconds ?? 0;
        $planned = $currentSession?->planned_duration_seconds ?? ($game->session_duration_minutes * 60);
        $timerSeconds = $this->timerService->calculateTimerValue($game, $elapsed, $planned, $isRunning);

        $recentEvents = $eventModels->take(5)->values()->map(function ($event) {
            return [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'session_number' => $event->session_number,
                'timer_value_seconds' => $event->timer_value_seconds,
                'occurred_at' => $event->occurred_at,
                'team_id' => $event->team_id,
                'goal_type' => $event->goal_type,
                'card_type' => $event->card_type,
                'player_shirt_number' => $event->player_shirt_number,
                'note' => $event->note,
            ];
        });

        $gameData = GameResource::make($game)->resolve();
        $sessionCount = max($sessionModels->count(), (int) ($game->getAttribute('sessions') ?? 0));

        return response()->json(array_merge($gameData, [
            'game_id' => $game->id,
            'team_a_score' => $scores['home'] ?? 0,
            'team_b_score' => $scores['away'] ?? 0,
            'timer_seconds' => $timerSeconds,
            'current_period' => $currentSessionNumber,
            'current_session' => $currentSession ? MatchSessionResource::make($currentSession) : null,
            'session_count' => $sessionCount,
            'timer_mode' => $game->timer_mode,
            'status' => $game->status,
            'is_running' => $isRunning,
            'is_break' => $isBreak,
            'events' => $recentEvents,
        ]));
    }
}
