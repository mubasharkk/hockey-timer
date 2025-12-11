<?php

namespace App\Http\Requests;

use App\Models\Tournament;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Arr;

class AssignTournamentTeamsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'randomize' => ['sometimes', 'boolean'],
            'team_ids' => ['required_if:randomize,true', 'array'],
            'team_ids.*' => [
                'integer',
                Rule::exists('teams', 'id')->where(fn ($q) => $q->where('is_registered', true)),
            ],
            'pools' => ['required_unless:randomize,true', 'array'],
            'pools.*' => ['array'],
            'pools.*.*' => [
                'integer',
                Rule::exists('teams', 'id')->where(fn ($q) => $q->where('is_registered', true)),
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            /** @var Tournament $tournament */
            $tournament = $this->route('tournament');
            $poolCount = $tournament?->pools()->count() ?? 0;

            if ($poolCount < 1) {
                $validator->errors()->add('pools', 'Create at least one pool before assigning teams.');
                return;
            }

            $teamIds = $this->boolean('randomize')
                ? Arr::wrap($this->input('team_ids', []))
                : collect($this->input('pools', []))->flatten()->all();

            $teamIds = array_values(array_unique(array_filter($teamIds)));
            $total = count($teamIds);

            if ($total < 4) {
                $validator->errors()->add('teams', 'At least 4 teams are required to assign pools.');
                return;
            }

            if ($total % $poolCount !== 0) {
                $validator->errors()->add('teams', 'Teams must be evenly divisible across all pools.');
                return;
            }

            if (! $this->boolean('randomize')) {
                $pools = $this->input('pools', []);
                $expectedPerPool = $total / $poolCount;
                foreach ($pools as $poolId => $ids) {
                    $count = count(array_unique(array_filter($ids ?? [])));
                    if ($count !== $expectedPerPool) {
                        $validator->errors()->add('pools', 'Each pool must have the same number of teams.');
                        break;
                    }
                }
            }
        });
    }
}
