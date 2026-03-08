<?php

namespace App\Http\Controllers;

use App\Http\Resources\TournamentResource;
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
            ->join('teams', 'teams.id', '=', 'tournament_pool_results.team_id')
            ->where('tournament_pool_results.tournament_id', $tournament->id)
            ->orderBy('pool_id')
            ->orderByDesc('total_points')
            ->orderBy('team_name')
            ->select('tournament_pool_results.*', 'teams.uid as team_uid')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        $topScorers = DB::table('tournament_top_scorers')
            ->where('tournament_id', $tournament->id)
            ->orderByDesc('goals')
            ->orderBy('team_name')
            ->limit(10)
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return Inertia::render('Public/Tournament', [
            'tournament' => TournamentResource::make($tournament),
            'poolResults' => $poolResults,
            'topScorers' => $topScorers,
        ]);
    }
}
