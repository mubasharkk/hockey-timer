<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SyncEventController;
use App\Http\Controllers\SyncGameController;
use App\Http\Controllers\SyncSessionController;

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
