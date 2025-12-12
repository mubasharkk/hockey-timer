<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TournamentPoolTeamController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicTickerController;
use App\Http\Controllers\PublicTournamentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::get('/teams/{team}/players/create', [PlayerController::class, 'create'])->name('teams.players.create');
    Route::post('/teams/{team}/players', [PlayerController::class, 'store'])->name('teams.players.store');
    Route::get('/teams/{team}/players/{player}/edit', [PlayerController::class, 'edit'])->name('teams.players.edit');
    Route::put('/teams/{team}/players/{player}', [PlayerController::class, 'update'])->name('teams.players.update');
    Route::delete('/teams/{team}/players/{player}', [PlayerController::class, 'destroy'])->name('teams.players.destroy');

    Route::get('/tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
    Route::get('/tournaments/create', [TournamentController::class, 'create'])->name('tournaments.create');
    Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::get('/tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
    Route::get('/tournaments/{tournament}/edit', [TournamentController::class, 'edit'])->name('tournaments.edit');
    Route::put('/tournaments/{tournament}', [TournamentController::class, 'update'])->name('tournaments.update');
    Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');
    Route::get('/tournaments/{tournament}/pools/teams', [TournamentPoolTeamController::class, 'edit'])->name('tournaments.pools.teams.edit');
    Route::post('/tournaments/{tournament}/pools/teams', [TournamentPoolTeamController::class, 'update'])->name('tournaments.pools.teams.update');

    Route::get('/games/create', [GameController::class, 'create'])->name('games.create');
    Route::post('/games', [GameController::class, 'store'])->name('games.store');
    Route::get('/games/{game}/summary', [GameController::class, 'showSummary'])->name('games.summary');
    Route::get('/games/{game}/timer', [GameController::class, 'showTimer'])->name('games.timer');
    Route::get('/games/{game}/report', [GameController::class, 'showReport'])->name('games.report');
    Route::get('/games/{game}/official-report', [GameController::class, 'showOfficialHtml'])->name('games.official_report');
    Route::get('/games/{game}/edit', [GameController::class, 'edit'])->name('games.edit');
    Route::put('/games/{game}', [GameController::class, 'update'])->name('games.update');
    Route::delete('/games/{game}', [GameController::class, 'destroy'])->name('games.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public ticker view (no auth required)
Route::get('/ticker', [PublicTickerController::class, 'index'])->name('public.ticker');
Route::get('/ticker/{code}', [PublicTickerController::class, 'index'])->name('public.ticker.code');
Route::get('/public/tournaments/{slug}', [PublicTournamentController::class, 'show'])->name('public.tournaments.show');

require __DIR__.'/auth.php';
