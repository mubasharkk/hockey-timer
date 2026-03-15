<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        $homeRelation = $this->relationLoaded('homeTeam') ? $this->homeTeam : null;
        $awayRelation = $this->relationLoaded('awayTeam') ? $this->awayTeam : null;
        $homeScore = $homeRelation?->score;
        $awayScore = $awayRelation?->score;
        $tournamentRelation = $this->relationLoaded('tournament') ? $this->tournament : null;
        $tournamentResource = $tournamentRelation && ! $tournamentRelation->relationLoaded('games')
            ? TournamentResource::make($tournamentRelation)
            : null;
        $sessionRelation = $this->relationLoaded('sessions') ? $this->getRelation('sessions') : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'tournament_id' => $this->tournament_id,
            'game_type' => $this->game_type,
            'tournament_pool_id' => $this->tournament_pool_id,
            'tournament_pool_name' => $this->whenLoaded('tournamentPool', fn () => $this->tournamentPool?->name),
            'knockout_round' => $this->knockout_round,
            'knockout_position' => $this->knockout_position,
            'home_team_id' => $this->home_team_id,
            'away_team_id' => $this->away_team_id,
            'team_a_name' => $homeRelation->name ?? $this->team_a_name,
            'team_b_name' => $awayRelation->name ?? $this->team_b_name,
            'venue' => $this->venue,
            'excerpt' => $this->excerpt,
            'notes' => $this->notes,
            'code' => $this->code,
            'game_date' => $this->game_date,
            'game_time' => $this->game_time,
            'sessions' => $sessionRelation
                ? MatchSessionResource::collection($sessionRelation)
                : $this->sessions,
            'session_duration_minutes' => $this->session_duration_minutes,
            'timer_mode' => $this->timer_mode,
            'sport_type' => $this->sport_type,
            'continue_timer_on_goal' => (bool) $this->continue_timer_on_goal,
            'game_officials' => $this->game_officials,
            'status' => $this->status,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'home_score' => $homeScore,
            'away_score' => $awayScore,
            'team_a_score' => $homeScore,
            'team_b_score' => $awayScore,
            'home_final_score' => $this->homeFinalScore(),
            'away_final_score' => $this->awayFinalScore(),
            'home_team' => TeamResource::make($this->whenLoaded('homeTeam')),
            'away_team' => TeamResource::make($this->whenLoaded('awayTeam')),
            'tournament' => $this->when($tournamentResource !== null, $tournamentResource),
            'events' => EventResource::collection($this->whenLoaded('events')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
