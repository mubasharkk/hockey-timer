<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncSessionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sessions' => ['required', 'array', 'max:20'],
            'sessions.*.id' => ['nullable', 'integer'],
            'sessions.*.number' => ['required', 'integer', 'min:1'],
            'sessions.*.planned_duration_seconds' => ['required', 'integer', 'min:0'],
            'sessions.*.actual_duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sessions.*.overrun_seconds' => ['nullable', 'integer', 'min:0'],
            'sessions.*.break_duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sessions.*.started_at' => ['nullable', 'date'],
            'sessions.*.ended_at' => ['nullable', 'date'],
            'sessions.*.break_started_at' => ['nullable', 'date'],
            'sessions.*.break_ended_at' => ['nullable', 'date'],
            'sessions.*.aggregate_previous' => ['nullable', 'boolean'],
            'sessions.*.home_score' => ['nullable', 'integer', 'min:0'],
            'sessions.*.away_score' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
