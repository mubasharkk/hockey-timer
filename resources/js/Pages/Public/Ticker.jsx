import { Head, Link, useForm } from '@inertiajs/react';
import moment from 'moment';

export default function Ticker({ game, gameId }) {
    const form = useForm({ game: gameId || '' });
    const events = game?.events || [];
    const resolveSessionNumber = () => {
        const raw = game?.current_session;
        if (typeof raw === 'number') return raw;
        if (raw && typeof raw === 'object' && raw.number) return raw.number;
        const ended = events.filter((e) => e.event_type === 'session_end').length;
        const total = Array.isArray(game?.sessions)
            ? game.sessions.length
            : typeof game?.sessions === 'number'
                ? game.sessions
                : ended + 1;
        return Math.min(total, ended + 1) || 1;
    };
    const resolveSessionTotal = () => {
        if (Array.isArray(game?.sessions)) return game.sessions.length;
        if (typeof game?.sessions === 'number') return game.sessions;
        return null;
    };
    const currentSession = resolveSessionNumber();
    const totalSessions = resolveSessionTotal();
    const recentEvents = [...events]
        .sort((a, b) => new Date(b.occurred_at || 0) - new Date(a.occurred_at || 0))
        .slice(0, 3);

    const submit = (e) => {
        e.preventDefault();
        form.get(route('public.ticker'), { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Live Ticker" />
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Public Ticker</p>
                        <h1 className="text-xl font-semibold text-gray-900">Hockey Match</h1>
                    </div>
                    <Link href={route('dashboard')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                        Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Enter Game ID</label>
                            <input
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                value={form.data.game}
                                onChange={(e) => form.setData('game', e.target.value)}
                                placeholder="e.g., 5"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Load
                        </button>
                    </form>
                </div>

                {gameId && !game && (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Game not found.</div>
                )}

                {game && (
                    <div className="mt-6 space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Live Scoreboard</p>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {game.team_a_name} vs {game.team_b_name}
                                    </h2>
                                    <p className="text-xs text-gray-600">
                                        {game.venue} · {game.game_date} {game.game_time} · Code {game.code || '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-3xl font-bold text-gray-900">
                                    <span>{(game.teams || []).find((t) => t.side === 'home')?.score ?? 0}</span>
                                    <span className="text-base font-semibold text-gray-500">–</span>
                                    <span>{(game.teams || []).find((t) => t.side === 'away')?.score ?? 0}</span>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
                                <div className="col-span-2">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Timer</p>
                                    <p className="text-4xl font-bold text-gray-900 tabular-nums">
                                        {formatSeconds(game.current_seconds ?? 0)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Session {currentSession}
                                        {totalSessions ? ` of ${totalSessions}` : ''} · {game.timer_mode} mode
                                    </p>
                                </div>
                                <div className="flex flex-col justify-center gap-2 text-sm text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{game.team_a_name}</span>
                                        <span className="text-lg font-bold">{(game.teams || []).find((t) => t.side === 'home')?.score ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{game.team_b_name}</span>
                                        <span className="text-lg font-bold">{(game.teams || []).find((t) => t.side === 'away')?.score ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900">Recent Events</h3>
                                <span className="text-xs text-gray-500">{recentEvents.length} shown</span>
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-gray-800">
                                {recentEvents.map((e) => (
                                    <div key={e.id || e.occurred_at || Math.random()} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                                        <div>
                                            <p className="font-semibold capitalize">{e.event_type.replace('_', ' ')}</p>
                                            <p className="text-xs text-gray-600">
                                                Session {e.session_number} · {formatSeconds(e.timer_value_seconds ?? 0)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">{e.occurred_at ? moment(e.occurred_at).format('HH:mm') : ''}</p>
                                    </div>
                                ))}
                                {recentEvents.length === 0 && <p className="text-xs text-gray-500">No events yet.</p>}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};
