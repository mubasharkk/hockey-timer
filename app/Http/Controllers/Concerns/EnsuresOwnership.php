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
        abort_unless($this->hasAccess($model, $ownerField), 403);
    }

    /**
     * Check if the authenticated user owns the given model or is an admin.
     *
     * @param Model $model The model to check ownership of
     * @param string $ownerField The field name that contains the owner's user ID
     */
    protected function hasAccess(Model $model, string $ownerField = 'user_id'): bool
    {
        if (backpack_user()?->is_admin) {
            return true;
        }

        return $model->{$ownerField} === Auth::id();
    }
}
