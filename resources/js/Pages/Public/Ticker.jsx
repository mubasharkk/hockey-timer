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
        return Math.min(total || 1, ended + 1) || 1;
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
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Head title="Live Ticker" />
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Public Ticker</p>
                        <h1 className="text-xl font-semibold text-white">Hockey Match</h1>
                    </div>
                    <Link href={route('dashboard')} className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                        Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                {!game && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-indigo-900/20">
                        <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-200">Enter Game ID</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    value={form.data.game}
                                    onChange={(e) => form.setData('game', e.target.value)}
                                    placeholder="e.g., 5"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
                            >
                                Load
                            </button>
                        </form>
                    </div>
                )}

                {gameId && !game && (
                    <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100 shadow-lg shadow-red-900/20">
                        Game not found.
                    </div>
                )}

                {game && (
                    <div className="mt-6 space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 shadow-2xl shadow-indigo-900/30">
                            <div className="my-5">
                                <div className="text-center">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Timer</p>
                                    <p className="text-[6rem] font-bold text-white tabular-nums">
                                        {formatSeconds(game.current_seconds ?? 0)}
                                    </p>
                                    <p className="mx-auto text-xl font-bold text-slate-300">
                                        <span>{totalSessions === 4 ? 'Q' : 'Sessions'} {currentSession}</span>
                                        <span className={'mx-3'}>of</span>
                                        <span>{totalSessions ?? ''}</span>
                                        {/*{game.timer_mode} mode*/}
                                    </p>
                                </div>
                                <div className="mt-5 flex justify-center gap-3p-3 text-sm text-slate-100 border-t border-slate-200 pt-10">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-3xl mb-5 font-semibold">{game.team_a_name}</span>
                                        <span className="text-5xl font-bold">{(game.teams || []).find((t) => t.side === 'home')?.score ?? 0}</span>
                                    </div>
                                    <div className={'flex-full'}>X</div>
                                    <div className="flex flex-col items-center justify-between">
                                        <span className="text-3xl mb-5 font-semibold">{game.team_b_name}</span>
                                        <span className="text-5xl font-bold">{(game.teams || []).find((t) => t.side === 'away')?.score ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-white">Recent Events</h3>
                                <span className="text-xs text-slate-400">{recentEvents.length} shown</span>
                            </div>
                            <div className="grid grid-cols-3 mt-3 space-y-2 text-sm text-slate-100">
                                {recentEvents.map((e) => (
                                    <div
                                        key={e.id || e.occurred_at || Math.random()}
                                        className="m-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2"
                                    >
                                        <div>
                                            <p className="font-semibold capitalize text-white">{e.event_type.replace('_', ' ')}</p>
                                            <p className="text-xs text-slate-300">
                                                Session {e.session_number} · {formatSeconds(e.timer_value_seconds ?? 0)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400">{e.occurred_at ? moment(e.occurred_at).format('HH:mm') : ''}</p>
                                    </div>
                                ))}
                                {recentEvents.length === 0 && <p className="text-xs text-slate-400">No events yet.</p>}
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
