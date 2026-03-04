<?php

namespace App\Actions\Teams;

use App\Models\Club;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GetClubsForTeamSelectAction
{
    /**
     * Get clubs for team selection dropdown.
     * Admins see all clubs, regular users see only their own.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function execute(): \Illuminate\Database\Eloquent\Collection
    {
        $query = Club::query()->orderBy('name');

        if (!request()->user()->is_admin) {
            $query->where('user_id', Auth::id());
        }

        return $query->get(['id', 'name']);
    }
}
