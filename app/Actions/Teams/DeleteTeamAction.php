<?php

namespace App\Actions\Teams;

use App\Models\Team;

class DeleteTeamAction
{
    /**
     * Delete a team.
     *
     * @param Team $team
     * @return void
     */
    public function execute(Team $team): void
    {
        $team->delete();
    }
}
