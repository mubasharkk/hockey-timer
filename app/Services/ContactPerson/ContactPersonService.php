<?php

namespace App\Services\ContactPerson;

use Illuminate\Database\Eloquent\Model;

class ContactPersonService
{
    /**
     * Sync contact persons for a model.
     * Creates new, updates existing, and deletes missing ones.
     *
     * @param Model $model The model to sync contact persons for (Player, Team, Club, etc)
     * @param array $contactPersonsData Array of contact person data with optional 'id' field
     * @return void
     */
    public function sync(Model $model, array $contactPersonsData = []): void
    {
        $submittedIds = [];

        foreach ($contactPersonsData as $contactPersonData) {
            $id = $contactPersonData['id'] ?? null;

            if ($id) {
                $this->update($model, $id, $contactPersonData);
                $submittedIds[] = $id;
            } else {
                $newContact = $this->create($model, $contactPersonData);
                $submittedIds[] = $newContact->id;
            }
        }

        // Delete contact persons not in the submitted list
        $model->contactPersons()->whereNotIn('id', $submittedIds)->delete();
    }

    /**
     * Create a new contact person.
     *
     * @param Model $model
     * @param array $data
     * @return Model
     */
    public function create(Model $model, array $data): Model
    {
        return $model->contactPersons()->create($this->formatData($data));
    }

    /**
     * Update an existing contact person.
     *
     * @param Model $model
     * @param int|string $id
     * @param array $data
     * @return void
     */
    public function update(Model $model, int|string $id, array $data): void
    {
        $model->contactPersons()
            ->where('id', $id)
            ->update($this->formatData($data));
    }

    /**
     * Delete a contact person.
     *
     * @param Model $model
     * @param int|string $id
     * @return void
     */
    public function delete(Model $model, int|string $id): void
    {
        $model->contactPersons()->where('id', $id)->delete();
    }

    /**
     * Format contact person data for storage.
     *
     * @param array $data
     * @return array
     */
    private function formatData(array $data): array
    {
        return [
            'name' => $data['name'],
            'role' => $data['role'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
        ];
    }
}
