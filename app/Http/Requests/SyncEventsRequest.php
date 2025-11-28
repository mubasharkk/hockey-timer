<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $game = $this->route('game');

        return [
            'events' => ['required', 'array', 'max:200'],
            'events.*.team_id' => [
                'nullable',
                'integer',
                Rule::exists('teams', 'id')->where(fn ($q) => $q->where('game_id', $game?->id)),
            ],
            'events.*.session_number' => ['required', 'integer', 'min:1'],
            'events.*.event_type' => ['required', Rule::in(['goal', 'card', 'penalty_corner', 'penalty_stroke', 'highlight', 'session_end', 'game_end'])],
            'events.*.goal_type' => ['nullable', Rule::in(['FG', 'PG'])],
            'events.*.card_type' => ['nullable', Rule::in(['green', 'yellow', 'red'])],
            'events.*.player_shirt_number' => ['nullable', 'integer'],
            'events.*.timer_value_seconds' => ['nullable', 'integer', 'min:0'],
            'events.*.occurred_at' => ['nullable', 'date'],
            'events.*.note' => ['nullable', 'string'],
        ];
    }
}
