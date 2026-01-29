<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait EnsuresOwnership
{
    /**
     * Ensure the authenticated user owns the given model.
     *
     * @param Model $model The model to check ownership of
     * @param string $ownerField The field name that contains the owner's user ID
     */
    protected function ensureAccess(Model $model, string $ownerField = 'user_id'): void
    {
        abort_unless($model->{$ownerField} === Auth::id(), 403);
    }

    /**
     * Check if the authenticated user owns the given model.
     *
     * @param Model $model The model to check ownership of
     * @param string $ownerField The field name that contains the owner's user ID
     */
    protected function hasAccess(Model $model, string $ownerField = 'user_id'): bool
    {
        return $model->{$ownerField} === Auth::id();
    }
}
