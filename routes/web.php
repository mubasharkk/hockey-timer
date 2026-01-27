<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamPlayerController;
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
    // Clubs
    Route::get('/clubs', [ClubController::class, 'index'])->name('clubs.index');
    Route::get('/clubs/create', [ClubController::class, 'create'])->name('clubs.create');
    Route::post('/clubs', [ClubController::class, 'store'])->name('clubs.store');
    Route::get('/clubs/{club}', [ClubController::class, 'show'])->name('clubs.show');
    Route::get('/clubs/{club}/edit', [ClubController::class, 'edit'])->name('clubs.edit');
    Route::put('/clubs/{club}', [ClubController::class, 'update'])->name('clubs.update');
    Route::delete('/clubs/{club}', [ClubController::class, 'destroy'])->name('clubs.destroy');

    // Club Teams (create team within a club)
    Route::get('/clubs/{club}/teams/create', [TeamController::class, 'createForClub'])->name('clubs.teams.create');
    Route::post('/clubs/{club}/teams', [TeamController::class, 'storeForClub'])->name('clubs.teams.store');

    // Teams
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

    // Team Players (roster management)
    Route::get('/teams/{team}/players', [TeamPlayerController::class, 'index'])->name('teams.players.index');
    Route::get('/teams/{team}/players/add', [TeamPlayerController::class, 'create'])->name('teams.players.create');
    Route::get('/teams/{team}/players/search', [TeamPlayerController::class, 'search'])->name('teams.players.search');
    Route::post('/teams/{team}/players', [TeamPlayerController::class, 'store'])->name('teams.players.store');
    Route::put('/teams/{team}/players/{player}', [TeamPlayerController::class, 'update'])->name('teams.players.update');
    Route::delete('/teams/{team}/players/{player}', [TeamPlayerController::class, 'destroy'])->name('teams.players.destroy');

    // Players (standalone)
    Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
    Route::get('/players/scan', [PlayerController::class, 'scan'])->name('players.scan');
    Route::post('/players/scan', [PlayerController::class, 'processScan'])->name('players.scan.process');
    Route::get('/players/create', [PlayerController::class, 'create'])->name('players.create');
    Route::post('/players', [PlayerController::class, 'store'])->name('players.store');
    Route::get('/players/search', [PlayerController::class, 'search'])->name('players.search');
    Route::get('/players/{player}', [PlayerController::class, 'show'])->name('players.show');
    Route::get('/players/{player}/edit', [PlayerController::class, 'edit'])->name('players.edit');
    Route::put('/players/{player}', [PlayerController::class, 'update'])->name('players.update');
    Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->name('players.destroy');

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

// Public routes (no auth required)
Route::get('/ticker', [PublicTickerController::class, 'index'])->name('public.ticker');
Route::get('/ticker/{code}', [PublicTickerController::class, 'index'])->name('public.ticker.code');
Route::get('/public/tournaments/{slug}', [PublicTournamentController::class, 'show'])->name('public.tournaments.show');
Route::get('/player/{identifier}', [PlayerController::class, 'publicProfile'])->name('players.public');

// Static pages
Route::get('/page/{slug}', [PageController::class, 'show'])->name('pages.show');

require __DIR__.'/auth.php';
