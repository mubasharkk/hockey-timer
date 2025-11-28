import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

const sessionOptions = [2, 4, 6, 8];
const durationOptions = [15, 20, 30, 45];

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        team_a_name: '',
        team_b_name: '',
        venue: '',
        game_date: '',
        game_time: '',
        sessions: 4,
        session_duration_minutes: 15,
        timer_mode: 'DESC',
        team_a_players_text: '',
        team_b_players_text: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('games.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Match" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">New Match</h1>
                        <p className="text-sm text-gray-600">Capture match details, sessions, and optional player lists.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team A Name</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_a_name}
                                    onChange={(e) => setData('team_a_name', e.target.value)}
                                    required
                                />
                                {errors.team_a_name && <p className="mt-1 text-xs text-red-600">{errors.team_a_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team B Name</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_b_name}
                                    onChange={(e) => setData('team_b_name', e.target.value)}
                                    required
                                />
                                {errors.team_b_name && <p className="mt-1 text-xs text-red-600">{errors.team_b_name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Venue</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    required
                                />
                                {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Match Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.game_date}
                                        onChange={(e) => setData('game_date', e.target.value)}
                                        required
                                    />
                                    {errors.game_date && <p className="mt-1 text-xs text-red-600">{errors.game_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Match Time</label>
                                    <input
                                        type="time"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.game_time}
                                        onChange={(e) => setData('game_time', e.target.value)}
                                        required
                                    />
                                    {errors.game_time && <p className="mt-1 text-xs text-red-600">{errors.game_time}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sessions</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.sessions}
                                    onChange={(e) => setData('sessions', Number(e.target.value))}
                                >
                                    {sessionOptions.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.sessions && <p className="mt-1 text-xs text-red-600">{errors.sessions}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Session Duration (min)</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.session_duration_minutes}
                                    onChange={(e) => setData('session_duration_minutes', Number(e.target.value))}
                                >
                                    {durationOptions.map((value) => (
                                        <option key={value} value={value}>
                                            {value} minutes
                                        </option>
                                    ))}
                                </select>
                                {errors.session_duration_minutes && (
                                    <p className="mt-1 text-xs text-red-600">{errors.session_duration_minutes}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Timer Mode</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.timer_mode}
                                    onChange={(e) => setData('timer_mode', e.target.value)}
                                >
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                                {errors.timer_mode && <p className="mt-1 text-xs text-red-600">{errors.timer_mode}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team A Players (optional)</label>
                                    <span className="text-xs text-gray-500">One per line. Prefix number to capture shirt #.</span>
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
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team B Players (optional)</label>
                                    <span className="text-xs text-gray-500">Example: “12 Alex Smith”.</span>
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

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                            Matches can only start when browser time matches the scheduled time (enforced on the summary screen).
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                {processing ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
