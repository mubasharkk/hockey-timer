<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Services\GameReportSnapshotService;
use Illuminate\Http\JsonResponse;

class SyncGameSnapshotController extends Controller
{
    public function __construct(private GameReportSnapshotService $snapshotService)
    {
    }

    public function store(Game $game): JsonResponse
    {
        $snapshot = $this->snapshotService->build($game);

        $game->update(['report_snapshot' => $snapshot]);

        return response()->json([
            'generated_at' => $snapshot['generated_at'],
        ]);
    }
}
