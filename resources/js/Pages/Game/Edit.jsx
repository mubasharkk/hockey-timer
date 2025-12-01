import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import moment from "moment";

export default function Edit({ auth, game }) {
    const playersToText = (players = []) =>
        (players || [])
            .map((p) => `${p.shirt_number ? `${p.shirt_number} ` : ''}${(p.name ?? '').replace(/^#\s*/, '')}`.trim())
            .filter(Boolean)
            .join('\n');

    const { data, setData, put, processing, errors } = useForm({
        team_a_name: game.team_a_name || '',
        team_b_name: game.team_b_name || '',
        venue: game.venue || '',
        game_date: game.game_date || '',
        game_time: game.game_time || '',
        sessions: game.sessions || 4,
        session_duration_minutes: game.session_duration_minutes || 15,
        timer_mode: game.timer_mode || 'DESC',
        team_a_players_text:
            game.team_a_players_text ||
            playersToText((game.teams || []).find((t) => t.side === 'home')?.players || []),
        team_b_players_text:
            game.team_b_players_text ||
            playersToText((game.teams || []).find((t) => t.side === 'away')?.players || []),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('games.update', game.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Game" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Game</h1>
                        <p className="text-sm text-gray-600">Update core game details. Sessions list will re-seed to match counts.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                                label="Team A Name"
                                value={data.team_a_name}
                                onChange={(e) => setData('team_a_name', e.target.value)}
                                error={errors.team_a_name}
                            />
                            <Field
                                label="Team B Name"
                                value={data.team_b_name}
                                onChange={(e) => setData('team_b_name', e.target.value)}
                                error={errors.team_b_name}
                            />
                        </div>

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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <SelectField
                                label="Sessions"
                                value={data.sessions}
                                options={[2, 4, 6, 8]}
                                onChange={(value) => setData('sessions', Number(value))}
                                error={errors.sessions}
                            />
                            <SelectField
                                label="Session Duration (min)"
                                value={data.session_duration_minutes}
                                options={[15, 20, 30, 45]}
                                onChange={(value) => setData('session_duration_minutes', Number(value))}
                                error={errors.session_duration_minutes}
                            />
                            <SelectField
                                label="Timer Mode"
                                value={data.timer_mode}
                                options={['ASC', 'DESC']}
                                onChange={(value) => setData('timer_mode', value)}
                                error={errors.timer_mode}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <div className="items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team A Players</label>
                                    <span className="text-xs text-gray-500">One per line. Optionally prefix shirt #.</span>
                                </div>
                                <textarea
                                    rows={6}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_a_players_text}
                                    onChange={(e) => setData('team_a_players_text', e.target.value)}
                                />
                                {errors.team_a_players_text && (
                                    <p className="mt-1 text-xs text-red-600">{errors.team_a_players_text}</p>
                                )}
                            </div>
                            <div>
                                <div className="items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team B Players</label>
                                    <span className="text-xs text-gray-500">One per line. Optionally prefix shirt #.</span>
                                </div>
                                <textarea
                                    rows={6}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_b_players_text}
                                    onChange={(e) => setData('team_b_players_text', e.target.value)}
                                />
                                {errors.team_b_players_text && (
                                    <p className="mt-1 text-xs text-red-600">{errors.team_b_players_text}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const SelectField = ({ label, value, options, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);
