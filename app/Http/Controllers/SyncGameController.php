<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncGameRequest;
use App\Models\Game;
use App\Services\GameSyncService;
use Illuminate\Http\JsonResponse;

class SyncGameController extends Controller
{
    public function __construct(private GameSyncService $syncService)
    {
    }

    public function store(SyncGameRequest $request): JsonResponse
    {
        $game = $this->syncService->syncGame($request->validated());

        return response()->json([
            'id' => $game->id,
        ]);
    }
}
