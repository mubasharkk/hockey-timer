<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicTournamentController extends Controller
{
    public function show(string $slug): Response
    {
        $tournament = Tournament::query()
            ->where('slug', $slug)
            ->with([
                'games' => fn ($q) => $q
                    ->orderBy('game_date')
                    ->orderBy('game_time')
                    ->with([
                        'homeTeam.media',
                        'awayTeam.media',
                    ]),
            ])
            ->firstOrFail();

        $poolResults = DB::table('tournament_pool_results')
            ->where('tournament_id', $tournament->id)
            ->orderBy('pool_id')
            ->orderByDesc('total_points')
            ->orderBy('team_name')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return Inertia::render('Public/Tournament', [
            'tournament' => [
                'id' => $tournament->id,
                'title' => $tournament->title,
                'slug' => $tournament->slug,
                'venue' => $tournament->venue,
                'start_date' => $tournament->start_date,
                'end_date' => $tournament->end_date,
                'logo_url' => $tournament->getFirstMediaUrl('logo') ?: null,
                'sponsor_logo_urls' => $tournament->getMedia('sponsor_logos')->map->getUrl()->all(),
                'games' => $tournament->games->map(function ($game) {
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
                })->values()->all(),
            ],
            'poolResults' => $poolResults,
        ]);
    }
}
