<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Http\Resources\TournamentResource;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class TournamentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $tournaments = Tournament::query()
            ->orderByDesc('start_date')
            ->get();

        return TournamentResource::collection($tournaments);
    }

    public function show(string $slug): JsonResponse
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
                        'tournamentPool',
                    ]),
            ])
            ->firstOrFail();

        $upcomingGames = $tournament->games
            ->filter(fn ($g) => $g->status !== 'finished')
            ->values();

        $gameResults = $tournament->games
            ->filter(fn ($g) => $g->status === 'finished')
            ->sortByDesc('game_date')
            ->values();

        $poolRows = DB::table('tournament_pool_results')
            ->join('teams', 'teams.id', '=', 'tournament_pool_results.team_id')
            ->where('tournament_pool_results.tournament_id', $tournament->id)
            ->orderBy('pool_id')
            ->orderByDesc('total_points')
            ->orderByDesc('goal_diff')
            ->orderBy('team_name')
            ->select('tournament_pool_results.*', 'teams.uid as team_uid')
            ->get();

        // Attach logo URLs via Spatie MediaLibrary
        $teamIds = $poolRows->pluck('team_id')->unique()->all();
        $teamLogos = Team::whereIn('id', $teamIds)
            ->with('media')
            ->get()
            ->mapWithKeys(fn ($team) => [$team->id => $team->getFirstMediaUrl('logo') ?: null]);

        $poolResults = $poolRows
            ->map(fn ($row) => array_merge((array) $row, ['logo_url' => $teamLogos[$row->team_id] ?? null]))
            ->all();

        $topScorers = DB::table('tournament_top_scorers')
            ->where('tournament_id', $tournament->id)
            ->orderByDesc('goals')
            ->orderBy('team_name')
            ->limit(10)
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return response()->json([
            'data' => [
                'tournament'    => TournamentResource::make($tournament),
                'pool_results'  => $poolResults,
                'upcoming'      => GameResource::collection($upcomingGames),
                'results'       => GameResource::collection($gameResults),
                'top_scorers'   => $topScorers,
            ],
        ]);
    }
}
