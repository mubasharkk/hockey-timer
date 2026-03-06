import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import ApplicationLogo from "@/Components/ApplicationLogo.jsx";
import PublicLayout from '@/Layouts/PublicLayout';

export default function Ticker({ game, gameId }) {
    const form = useForm({ game: gameId || '' });
    const [liveData, setLiveData] = useState(game || null);
    const [loading, setLoading] = useState(false);
    // Trust server timer_seconds as the single source of truth
    const isFinished = useMemo(
        () => liveData?.status === 'finished',
        [liveData?.status]
    );
    const venue = liveData?.venue ?? game?.venue ?? '';
    const excerpt = liveData?.excerpt ?? game?.excerpt ?? '';
    const tournament = liveData?.tournament ?? game?.tournament ?? null;
    const teams = liveData?.teams ?? game?.teams ?? [];
    const homeTeam = teams.find((t) => t.side === 'home') || { name: liveData?.team_a_name ?? game?.team_a_name };
    const awayTeam = teams.find((t) => t.side === 'away') || { name: liveData?.team_b_name ?? game?.team_b_name };

    const effectiveSeconds = useMemo(() => {
        // Trust server timer_seconds as the single source of truth
        if (liveData?.timer_seconds !== undefined && liveData?.timer_seconds !== null) {
            return liveData.timer_seconds;
        }
        return 0;
    }, [liveData?.timer_seconds]);

    const events = liveData?.events || [];

    // Use server-provided session data directly
    const currentSession = liveData?.current_period ?? 1;
    const totalSessions = liveData?.session_count ?? null;
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
            } catch (e)
            {
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

    return (
        <PublicLayout fullWidth>
            <Head title="Live Ticker" />
            <div className="min-h-screen px-[calc(50vw-50%)] py-6">
                {!liveData && (
                    <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl">
                        <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700">Enter Game ID</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-inner focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                                    value={form.data.game}
                                    onChange={(e) => form.setData('game', e.target.value)}
                                    placeholder="e.g., 5"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-green-600"
                            >
                                Load
                            </button>
                        </form>
                    </div>
                )}

                {gameId && !liveData && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-lg">
                        Game not found.
                    </div>
                )}

                {liveData && (
                    <div className="mt-6 space-y-6">
                        {(tournament?.logo_url || tournament?.title) && (
                            <div className="flex flex-col items-center justify-center gap-3 text-center">
                                {tournament?.logo_url ? (
                                    <img
                                        src={tournament.logo_url}
                                        alt={tournament.title || 'Tournament logo'}
                                        className="h-auto max-h-24 w-full max-w-xs object-contain"
                                    />
                                ) : (
                                    <div className="flex h-24 w-full max-w-xs items-center justify-center rounded-lg border border-gray-200 bg-white/60 px-4 text-sm font-semibold text-gray-700">
                                        {tournament?.title}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                            <div className="my-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="w-48 flex justify-start">
                                        <TeamLogo team={homeTeam} align="start" bare />
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Timer</p>
                                        <p className="text-[6rem] font-bold text-gray-900 tabular-nums">
                                            {formatSeconds(effectiveSeconds)}
                                        </p>
                                        <p className="mx-auto text-xl font-bold text-gray-600 flex items-center justify-center gap-3">
                                            <span>{totalSessions === 4 ? 'Q' : 'Session'} {currentSession}</span>
                                            <span className="text-gray-400">/</span>
                                            <span>{totalSessions ?? ''}</span>
                                            {liveData?.is_break && !isFinished && (
                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 border border-amber-300">
                                                    Break
                                                </span>
                                            )}
                                            {isFinished && (
                                                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 border border-red-300">
                                                    Ended
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="w-48 flex justify-end">
                                        <TeamLogo team={awayTeam} align="end" bare />
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-between gap-6 text-sm text-gray-700 border-t border-gray-200 pt-10">
                                    <div id="score-team-a" className="flex w-1/2 flex-col items-start justify-center text-left">
                                        <span className="mb-3 mt-3 text-3xl font-semibold">{homeTeam?.name || liveData.team_a_name}</span>
                                        <span className="text-5xl font-bold">{liveData.team_a_score ?? (liveData.teams || []).find((t) => t.side === 'home')?.score ?? 0}</span>
                                    </div>
                                    <div id="score-team-b" className="flex w-1/2 flex-col items-end justify-center text-right">
                                        <span className="mb-3 mt-3 text-3xl font-semibold">{awayTeam?.name || liveData.team_b_name}</span>
                                        <span className="text-5xl font-bold">{liveData.team_b_score ?? (liveData.teams || []).find((t) => t.side === 'away')?.score ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                            {excerpt && <p className="text-center text-sm text-gray-600">{excerpt}</p>}
                            <div className="text-center text-sm text-gray-500">
                                {venue}
                            </div>
                        </div>

                        {/* Recent Events */}
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900">Recent Events</h3>
                                <span className="text-xs text-gray-500">{recentEvents.length} shown</span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700">
                                {recentEvents.map((e) => (
                                    <div
                                        key={e.id || e.occurred_at || Math.random()}
                                        className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3"
                                    >
                                        <img
                                            src={eventBadge(e).icon}
                                            alt={eventBadge(e).label}
                                            className="h-8 w-8 object-contain"
                                        />
                                        <div className="flex flex-1 items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <p className="font-semibold capitalize text-gray-900">
                                                    {eventBadge(e).label}
                                                    {e.player_shirt_number ? ` · #${e.player_shirt_number}` : ''}
                                                </p>
                                                <p className="text-xs font-semibold text-gray-600">
                                                    {teamName(e.team_id, liveData?.teams)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Session {e.session_number} · {formatSeconds(e.timer_value_seconds ?? 0)}
                                                </p>
                                                {(e.note || e.goal_type || e.card_type) && (
                                                    <p className="text-xs text-gray-500">
                                                        {[e.goal_type, e.card_type, e.note].filter(Boolean).join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 whitespace-nowrap">
                                                {e.occurred_at ? moment(e.occurred_at).format('hh:mm A') : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {recentEvents.length === 0 && <p className="text-xs text-gray-500">No events yet.</p>}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

const TeamLogo = ({ team, align = 'center', bare = false }) => {
    const justify = align === 'end' ? 'justify-end' : align === 'start' ? 'justify-start' : 'justify-center';

    return (
        <div className={`flex w-full ${justify}`}>
            {team?.logo_url && (
                <img
                    src={team.logo_url}
                    alt={`${team.name || 'Team'} logo`}
                    className={`w-36 rounded-lg object-cover ${bare ? '' : 'ring-1 ring-gray-200 bg-white/60'}`}
                />
            )}
        </div>
    );
};

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
    if (type === 'yellow') return '/icons/yellow-card.png';
    if (type === 'green') return '/icons/green-card.png';
    return '/icons/red-card.png';
};

const teamName = (id, teams = []) => teams?.find((t) => t.id === id)?.name || '—';

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};
