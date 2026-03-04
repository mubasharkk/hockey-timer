<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait AuthorizesOwnership
{
    /**
     * Check if the authenticated user owns the given model or is an admin.
     *
     * @param Model $model The model to check ownership of
     * @param string $ownerField The field name that contains the owner's user ID
     */
    protected function userOwnsOrAdmin(Model $model, string $ownerField = 'user_id'): bool
    {
        if (Auth::user()?->is_admin) {
            return true;
        }

        return $model->{$ownerField} === Auth::id();
    }
}
