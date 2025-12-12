<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'venue' => $this->venue,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'win_points' => $this->win_points,
            'draw_points' => $this->draw_points,
            'loss_points' => $this->loss_points,
            'logo_url' => $this->getFirstMediaUrl('logo') ?: null,
            'sponsor_logo_urls' => $this->getMedia('sponsor_logos')->map->getUrl()->all(),
            'pools' => $this->whenLoaded('pools', function () {
                return $this->pools->map(function ($pool) {
                    return [
                        'id' => $pool->id,
                        'name' => $pool->name,
                        'order' => $pool->order,
                        'teams' => $pool->relationLoaded('teams')
                            ? $pool->teams->map(fn ($team) => [
                                'id' => $team->id,
                                'name' => $team->name,
                            ])->values()->all()
                            : [],
                    ];
                })->values()->all();
            }),
            'games' => $this->whenLoaded('games', function () {
                return $this->games->map(function ($game) {
                    return [
                        'id' => $game->id,
                        'team_a_name' => $game->team_a_name,
                        'team_b_name' => $game->team_b_name,
                        'home_team' => $game->homeTeam ? [
                            'id' => $game->homeTeam->id,
                            'name' => $game->homeTeam->name,
                            'logo_url' => $game->homeTeam->getFirstMediaUrl('logo') ?: null,
                        ] : null,
                        'away_team' => $game->awayTeam ? [
                            'id' => $game->awayTeam->id,
                            'name' => $game->awayTeam->name,
                            'logo_url' => $game->awayTeam->getFirstMediaUrl('logo') ?: null,
                        ] : null,
                        'game_date' => $game->game_date,
                        'game_time' => $game->game_time,
                        'venue' => $game->venue,
                        'status' => $game->status,
                        'excerpt' => $game->excerpt,
                    ];
                })->values()->all();
            }),
        ];
    }
}
