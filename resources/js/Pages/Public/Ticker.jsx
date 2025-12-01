import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

export default function Ticker({ game, gameId }) {
    const form = useForm({ game: gameId || '' });
    const [liveData, setLiveData] = useState(game || null);
    const [loading, setLoading] = useState(false);
    const [displaySeconds, setDisplaySeconds] = useState(game?.timer_seconds ?? game?.current_seconds ?? 0);
    const effectiveSeconds = useMemo(() => {
        if (!liveData) return displaySeconds ?? 0;
        if (liveData.is_break) return 0;
        if (liveData.status === 'finished' || liveData.status === 'game_over') return 0;
        return displaySeconds ?? liveData.timer_seconds ?? liveData.current_seconds ?? 0;
    }, [displaySeconds, liveData]);

    const events = liveData?.events || [];

    const resolveSessionNumber = () => {
        const raw = liveData?.current_session ?? liveData?.current_period;
        if (typeof raw === 'number') return raw;
        if (raw && typeof raw === 'object' && raw.number) return raw.number;
        const ended = events.filter((e) => e.event_type === 'session_end').length;
        const total = Array.isArray(liveData?.sessions)
            ? liveData.sessions.length
            : typeof liveData?.sessions === 'number'
                ? liveData.sessions
                : ended + 1;
        return Math.min(total || 1, ended + 1) || 1;
    };
    const resolveSessionTotal = () => {
        if (Array.isArray(liveData?.sessions)) return liveData.sessions.length;
        if (typeof liveData?.sessions === 'number') return liveData.sessions;
        if (typeof liveData?.session_count === 'number') return liveData.session_count;
        return null;
    };
    const currentSession = resolveSessionNumber();
    const totalSessions = resolveSessionTotal();
    const recentEvents = useMemo(
        () =>
            [...events]
                .sort((a, b) => new Date(b.occurred_at || 0) - new Date(a.occurred_at || 0))
                .slice(0, 3),
        [events]
    );

    const submit = (e) => {
        e.preventDefault();
        form.get(route('public.ticker'), { preserveScroll: true });
    };

    useEffect(() => {
        const id = liveData?.game_id || gameId || form.data.game;
        if (!id) return;
        let isMounted = true;
        const fetchTicker = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/public/ticker/${id}`);
                if (isMounted) setLiveData((prev) => ({ ...(prev || {}), ...res.data }));
            } catch (e) {
                // ignore errors; keep last good data
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchTicker();
        const interval = setInterval(fetchTicker, 4000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [gameId, form.data.game]);

    useEffect(() => {
        if (liveData?.timer_seconds !== undefined && liveData?.timer_seconds !== null) {
            setDisplaySeconds(liveData.timer_seconds);
        } else if (liveData?.current_seconds !== undefined && liveData?.current_seconds !== null) {
            setDisplaySeconds(liveData.current_seconds);
        }
    }, [liveData?.timer_seconds, liveData?.current_seconds]);

    // Keep timer display in lockstep with the authoritative value coming from the server
    // (avoid drifting when the main timer is paused or adjusted).

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
                {!liveData && (
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

                {gameId && !liveData && (
                    <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100 shadow-lg shadow-red-900/20">
                        Game not found.
                    </div>
                )}

                {liveData && (
                    <div className="mt-6 space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 shadow-2xl shadow-indigo-900/30">
                            <div className="my-5">
                                <div className="text-center">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Timer</p>
                                    <p className="text-[6rem] font-bold text-white tabular-nums">
                                        {formatSeconds(effectiveSeconds)}
                                    </p>
                                    <p className="mx-auto text-xl font-bold text-slate-300 flex items-center justify-center gap-3">
                                        <span>{totalSessions === 4 ? 'Q' : 'Session'} {currentSession}</span>
                                        <span className="text-slate-500">/</span>
                                        <span>{totalSessions ?? ''}</span>
                                        {liveData?.is_break && (
                                            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-200 border border-amber-500/40">
                                                Break
                                            </span>
                                        )}
                                        {(liveData?.status === 'finished' || liveData?.status === 'game_over') && (
                                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-100 border border-emerald-500/40">
                                                Final
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="mt-5 flex justify-between gap-6 text-sm text-slate-100 border-t border-slate-200 pt-10">
                                    <div id="score-team-a" className="flex w-1/2 flex-col items-start justify-center text-left">
                                        <span className="mb-5 text-3xl font-semibold">{liveData.team_a_name}</span>
                                        <span className="text-5xl font-bold">{liveData.team_a_score ?? (liveData.teams || []).find((t) => t.side === 'home')?.score ?? 0}</span>
                                    </div>
                                    <div id="score-team-b" className="flex w-1/2 flex-col items-end justify-center text-right">
                                        <span className="mb-5 text-3xl font-semibold">{liveData.team_b_name}</span>
                                        <span className="text-5xl font-bold">{liveData.team_b_score ?? (liveData.teams || []).find((t) => t.side === 'away')?.score ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-white">Recent Events</h3>
                                <span className="text-xs text-slate-400">{recentEvents.length} shown</span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-100 sm:grid-cols-3">
                                {recentEvents.map((e) => (
                                    <div
                                        key={e.id || e.occurred_at || Math.random()}
                                        className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-3"
                                    >
                                        <img
                                            src={eventBadge(e).icon}
                                            alt={eventBadge(e).label}
                                            className="h-8 w-8 object-contain"
                                        />
                                        <div className="flex flex-1 items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <p className="font-semibold capitalize text-white">
                                                    {eventBadge(e).label}
                                                    {e.player_shirt_number ? ` · #${e.player_shirt_number}` : ''}
                                                </p>
                                                <p className="text-xs text-slate-300">
                                                    Session {e.session_number} · {formatSeconds(e.timer_value_seconds ?? 0)}
                                                </p>
                                                {(e.note || e.goal_type || e.card_type) && (
                                                    <p className="text-xs text-slate-400">
                                                        {[e.goal_type, e.card_type, e.note].filter(Boolean).join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 whitespace-nowrap">
                                                {e.occurred_at ? moment(e.occurred_at).format('HH:mm') : ''}
                                            </p>
                                        </div>
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

const eventBadge = (event) => {
    switch (event.event_type) {
        case 'goal':
            return { icon: '/icons/goal.png', label: event.goal_type ? `${event.goal_type} Goal` : 'Goal' };
        case 'penalty_corner':
            return { icon: '/icons/foul.png', label: 'Penalty Corner' };
        case 'penalty_stroke':
            return { icon: '/icons/foul.png', label: 'Penalty Stroke' };
        case 'card':
            return { icon: cardIcon(event.card_type), label: `${event.card_type || ''} Card`.trim() || 'Card' };
        case 'session_end':
            return { icon: '/icons/half-time.png', label: 'Session End' };
        case 'game_end':
            return { icon: '/icons/full-time.png', label: 'Game End' };
        case 'foul':
            return { icon: '/icons/foul.png', label: 'Foul' };
        default:
            return { icon: '/icons/logo.png', label: event.event_type?.replace('_', ' ') || 'Event' };
    }
};

const cardIcon = (type) => {
    if (type === 'red') return '/icons/red-card.png';
    if (type === 'yellow') return '/icons/red-card.png';
    if (type === 'green') return '/icons/red-card.png';
    return '/icons/red-card.png';
};

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};
