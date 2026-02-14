<?php

namespace App\Actions\ContactPerson;

use App\Services\ContactPerson\ContactPersonService;
use Illuminate\Database\Eloquent\Model;

class CreateContactPerson
{
    public function __construct(
        private ContactPersonService $contactPersonService,
    ) {}

    /**
     * Create a single contact person.
     *
     * @param Model $model
     * @param array $data
     * @return Model
     */
    public function __invoke(Model $model, array $data): Model
    {
        return $this->contactPersonService->create($model, $data);
    }
}
