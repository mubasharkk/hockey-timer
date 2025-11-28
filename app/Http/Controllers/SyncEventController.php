<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncEventsRequest;
use App\Models\Game;
use App\Services\GameSyncService;
use Illuminate\Http\JsonResponse;

class SyncEventController extends Controller
{
    public function __construct(private GameSyncService $syncService)
    {
    }

    public function store(SyncEventsRequest $request, Game $game): JsonResponse
    {
        $created = $this->syncService->syncEvents($game, $request->validated('events'));

        return response()->json([
            'count' => $created->count(),
            'event_ids' => $created->pluck('id'),
        ]);
    }
}
