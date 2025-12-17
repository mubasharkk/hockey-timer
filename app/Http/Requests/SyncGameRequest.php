<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['nullable', 'integer', 'exists:games,id'],
            'team_a_name' => ['required', 'string', 'max:255'],
            'team_b_name' => ['required', 'string', 'max:255'],
            'venue' => ['required', 'string', 'max:255'],
            'game_date' => ['required', 'date'],
            'game_time' => ['required', 'date_format:h:i:s'],
            'sessions' => ['required', 'integer', 'in:2,4,6,8'],
            'session_duration_minutes' => ['required', 'integer', 'min:1'],
            'timer_mode' => ['required', 'in:ASC,DESC'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'continue_timer_on_goal' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:50'],
            'teams' => ['nullable', 'array'],
            'teams.*.id' => ['nullable', 'integer'],
            'teams.*.name' => ['required_with:teams', 'string', 'max:255'],
            'teams.*.side' => ['required_with:teams', 'in:home,away'],
            'teams.*.score' => ['nullable', 'integer', 'min:0'],
            'teams.*.coach' => ['nullable', 'string', 'max:255'],
            'teams.*.manager' => ['nullable', 'string', 'max:255'],
            'game_officials' => ['nullable', 'string', 'max:500'],
        ];
    }
}
