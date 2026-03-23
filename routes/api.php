<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SyncEventController;
use App\Http\Controllers\SyncGameController;
use App\Http\Controllers\SyncSessionController;
use App\Http\Controllers\PublicTickerApiController;
use App\Http\Controllers\Api\DashboardStatsController;
use App\Http\Controllers\Api\TournamentController as ApiTournamentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and assigned to the
| "api" middleware group.
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/sync/game', [SyncGameController::class, 'store']);
Route::post('/sync/game/{game}/sessions', [SyncSessionController::class, 'store']);
Route::post('/sync/game/{game}/events', [SyncEventController::class, 'store']);
Route::get('/public/ticker/{game}', [PublicTickerApiController::class, 'show']);

Route::get('/countries', function () {
    return \Illuminate\Support\Facades\DB::table(config('countries.table_name', 'countries'))
        ->select('iso_3166_2 as code', 'name')
        ->orderByRaw("CASE WHEN iso_3166_2 = 'PK' THEN 0 ELSE 1 END")
        ->orderBy('name')
        ->get();
});

Route::get('/dashboard/stats', DashboardStatsController::class);

// Public tournament API
Route::get('/tournaments', [ApiTournamentController::class, 'index']);
Route::get('/tournaments/{slug}', [ApiTournamentController::class, 'show']);
