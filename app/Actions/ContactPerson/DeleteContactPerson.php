<?php

namespace App\Actions\ContactPerson;

use App\Services\ContactPerson\ContactPersonService;
use Illuminate\Database\Eloquent\Model;

class DeleteContactPerson
{
    public function __construct(
        private ContactPersonService $contactPersonService,
    ) {}

    /**
     * Delete a contact person.
     *
     * @param Model $model
     * @param int|string $id
     * @return void
     */
    public function __invoke(Model $model, int|string $id): void
    {
        $this->contactPersonService->delete($model, $id);
    }
}
