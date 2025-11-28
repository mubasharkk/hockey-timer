<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncSessionsRequest;
use App\Models\Game;
use App\Services\GameSyncService;
use Illuminate\Http\JsonResponse;

class SyncSessionController extends Controller
{
    public function __construct(private GameSyncService $syncService)
    {
    }

    public function store(SyncSessionsRequest $request, Game $game): JsonResponse
    {
        $sessions = $this->syncService->syncSessions($game, $request->validated('sessions'));

        return response()->json([
            'session_ids' => $sessions,
        ]);
    }
}
