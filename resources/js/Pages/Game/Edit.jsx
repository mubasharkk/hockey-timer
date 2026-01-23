import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useEffect, useMemo } from 'react';

const sessionOptions = [1, 2, 4, 6, 8];

export default function Edit({ auth, game, teams = [], tournaments = [], sportsOptions = {} }) {
    const currentGame = game?.data ?? game;
    const teamList = Array.isArray(teams) ? teams : teams?.data || [];
    const tournamentList = Array.isArray(tournaments) ? tournaments : tournaments?.data || [];
    const normalizeTime = (time) => {
        if (!time) return '';
        const parsed = moment(time, ['HH:mm:ss', 'HH:mm'], true);
        return parsed.isValid() ? parsed.format('HH:mm') : time;
    };
    const { data, setData, put, processing, errors } = useForm({
        home_team_id: currentGame.home_team_id,
        away_team_id: currentGame.away_team_id,
        tournament_id: currentGame.tournament_id || '',
        venue: currentGame.venue || '',
        excerpt: currentGame.excerpt || '',
        notes: currentGame.notes || '',
        game_date: currentGame.game_date || '',
        game_time: normalizeTime(currentGame.game_time),
        sessions: currentGame.sessions || 4,
        session_duration_minutes: currentGame.session_duration_minutes || 15,
        timer_mode: currentGame.timer_mode || 'DESC',
        continue_timer_on_goal: currentGame.continue_timer_on_goal ?? false,
        sport_type: currentGame.sport_type || 'field_hockey',
        game_officials: currentGame.game_officials || '',
    });

    const selectedTournament = useMemo(
        () => tournamentList.find((t) => `${t.id}` === `${data.tournament_id}`),
        [tournamentList, data.tournament_id]
    );

    const tournamentTeamIds = useMemo(() => {
        if (!selectedTournament || !selectedTournament.pools) return [];
        const ids = selectedTournament.pools.flatMap((p) => (p.teams || []).map((team) => team.id));
        return Array.from(new Set(ids));
    }, [selectedTournament]);

    const filteredTeams = useMemo(() => {
        if (data.tournament_id) {
            return teamList.filter((team) => tournamentTeamIds.includes(team.id));
        }
        return teamList;
    }, [teamList, tournamentTeamIds, data.tournament_id]);

    useEffect(() => {
        if (selectedTournament?.venue) {
            setData('venue', selectedTournament.venue);
        }
    }, [selectedTournament, setData]);

    const submit = (e) => {
        e.preventDefault();
        put(route('games.update', currentGame.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Game" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Game</h1>
                        <p className="text-sm text-gray-600">Update timings, venue, and officials. Team rosters come from registered teams.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TeamSelect
                                label="Home Team"
                                value={data.home_team_id}
                                onChange={(val) => setData('home_team_id', val)}
                                teams={filteredTeams}
                                error={errors.home_team_id}
                                disabled
                            />
                            <TeamSelect
                                label="Away Team"
                                value={data.away_team_id}
                                onChange={(val) => setData('away_team_id', val)}
                                teams={filteredTeams}
                                error={errors.away_team_id}
                                disabled
                            />
                        </div>

                        <Field
                            label="Excerpt (public)"
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            error={errors.excerpt}
                        />

                        <SelectField
                            label="Tournament (optional)"
                            value={data.tournament_id}
                            options={[{ value: '', label: 'No tournament' }, ...tournamentList.map((t) => ({ value: t.id, label: t.title }))]}
                            onChange={(value) => setData('tournament_id', value)}
                            error={errors.tournament_id}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                                label="Venue"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                error={errors.venue}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    label="Date"
                                    type="date"
                                    value={moment(data.game_date).format('YYYY-MM-DD')}
                                    onChange={(e) => setData('game_date', e.target.value)}
                                    error={errors.game_date}
                                />
                                <Field
                                    label="Time"
                                    type="time"
                            value={data.game_time}
                            onChange={(e) => setData('game_time', e.target.value)}
                            error={errors.game_time}
                        />
                    </div>
                </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <SelectField
                                label="Sessions"
                                value={data.sessions}
                                options={sessionOptions}
                                onChange={(value) => setData('sessions', Number(value))}
                                error={errors.sessions}
                            />
                            <Field
                                label="Session Duration (min)"
                                value={data.session_duration_minutes}
                                onChange={(e) => setData('session_duration_minutes', e.target.value)}
                                error={errors.session_duration_minutes}
                            />
                            <SelectField
                                label="Timer Mode"
                                value={data.timer_mode}
                                options={['ASC', 'DESC']}
                                onChange={(value) => setData('timer_mode', value)}
                                error={errors.timer_mode}
                            />
                            <SelectField
                                label="Sport Type"
                                value={data.sport_type}
                                options={Object.entries(sportsOptions).map(([value, label]) => ({ value, label }))}
                                onChange={(value) => setData('sport_type', value)}
                                error={errors.sport_type}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="continue_timer_on_goal"
                                name="continue_timer_on_goal"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                                checked={data.continue_timer_on_goal}
                                onChange={(e) => setData('continue_timer_on_goal', e.target.checked)}
                            />
                            <label htmlFor="continue_timer_on_goal" className="text-sm text-gray-700">
                                Continue running timer when goals or penalties are recorded
                            </label>
                        </div>

                        <Field
                            label="Game Officials (optional)"
                            value={data.game_officials}
                            onChange={(e) => setData('game_officials', e.target.value)}
                            error={errors.game_officials}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes (admin only, optional)</label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const Field = ({ label, error, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const ReadOnlyField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">{value}</div>
    </div>
);

const SelectField = ({ label, value, options, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => {
                const optionValue = typeof opt === 'object' ? opt.value : opt;
                const optionLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                );
            })}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const TeamSelect = ({ label, value, onChange, teams, error, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {Boolean(value) && !teams.find((t) => `${t.id}` === `${value}`) && (
            <p className="mb-1 text-xs text-amber-600">
                Current team is not in the selected tournament’s pools.
            </p>
        )}
        <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            <option value="">Select team</option>
            {teams.map((team) => (
                <option key={team.id} value={team.id}>
                    {team.name}
                </option>
            ))}
            {Boolean(value) && !teams.find((t) => `${t.id}` === `${value}`) && (
                <option value={value}>Current team (not in pools)</option>
            )}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);
