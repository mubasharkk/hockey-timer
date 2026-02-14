<?php

namespace App\Actions\ContactPerson;

use App\Services\ContactPerson\ContactPersonService;
use Illuminate\Database\Eloquent\Model;

class SyncContactPersons
{
    public function __construct(
        private ContactPersonService $contactPersonService,
    ) {}

    /**
     * Sync contact persons for a model.
     *
     * @param Model $model
     * @param array $contactPersonsData
     * @return void
     */
    public function __invoke(Model $model, array $contactPersonsData = []): void
    {
        $this->contactPersonService->sync($model, $contactPersonsData);
    }
}
