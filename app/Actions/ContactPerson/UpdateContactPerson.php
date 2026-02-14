<?php

namespace App\Actions\ContactPerson;

use App\Services\ContactPerson\ContactPersonService;
use Illuminate\Database\Eloquent\Model;

class UpdateContactPerson
{
    public function __construct(
        private ContactPersonService $contactPersonService,
    ) {}

    /**
     * Update a contact person.
     *
     * @param Model $model
     * @param int|string $id
     * @param array $data
     * @return void
     */
    public function __invoke(Model $model, int|string $id, array $data): void
    {
        $this->contactPersonService->update($model, $id, $data);
    }
}
