<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncGameCommentsController extends Controller
{
    public function update(Request $request, Game $game): JsonResponse
    {
        $request->validate([
            'comments' => ['nullable', 'string', 'max:5000'],
        ]);

        $game->update(['comments' => $request->input('comments')]);

        return response()->json(['id' => $game->id]);
    }
}
