<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicTickerController;
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
    Route::get('/games/create', [GameController::class, 'create'])->name('games.create');
    Route::post('/games', [GameController::class, 'store'])->name('games.store');
    Route::get('/games/{game}/summary', [GameController::class, 'showSummary'])->name('games.summary');
    Route::get('/games/{game}/timer', [GameController::class, 'showTimer'])->name('games.timer');
    Route::get('/games/{game}/report', [GameController::class, 'showReport'])->name('games.report');
    Route::get('/games/{game}/official-report', [GameController::class, 'showOfficialHtml'])->name('games.official_report');
    Route::get('/games/{game}/official-pdf', [GameController::class, 'downloadOfficialPdf'])->name('games.official_pdf');
    Route::post('/games/{game}/official-pdf', [GameController::class, 'queueOfficialPdf'])->name('games.official_pdf.queue');
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

require __DIR__.'/auth.php';
