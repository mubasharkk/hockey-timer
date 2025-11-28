import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Timer({ auth, game, config = {} }) {
    if (!game) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Live Timer" />
                <div className="py-6">
                    <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">Game not found.</div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const sessions = game.sessions || [];
    const sessionCount = sessions.length || 1;
    const [sessionIndex, setSessionIndex] = useState(0);
    const plannedSeconds = useMemo(() => {
        if (sessions.length > 0) {
            const current = sessions[sessionIndex] ?? sessions[0];
            return current?.planned_duration_seconds ?? game.session_duration_minutes * 60;
        }
        return game.session_duration_minutes * 60;
    }, [sessions, sessionIndex, game.session_duration_minutes]);

    const storageKey = `game_timer_${game.id}`;
    const [status, setStatus] = useState('ready'); // ready | running | paused | finished
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [lastTick, setLastTick] = useState(null);

    // Restore persisted timer on load
    useEffect(() => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            const idx = typeof data.sessionIndex === 'number' ? data.sessionIndex : 0;
            setSessionIndex(Math.min(Math.max(idx, 0), Math.max(sessionCount - 1, 0)));

            if (data.status === 'game_over') {
                const elapsed = typeof data.elapsedSeconds === 'number' ? data.elapsedSeconds : plannedSeconds;
                setElapsedSeconds(Math.min(elapsed, plannedSeconds));
                setStatus('game_over');
                setSessionIndex(Math.min(Math.max(idx, 0), Math.max(sessionCount - 1, 0)));
                return;
            }

            if (data.status === 'running' && data.startAt) {
                const elapsed = Math.max((Date.now() - new Date(data.startAt).getTime()) / 1000, 0);
                const clamped = Math.min(elapsed, plannedSeconds);
                setElapsedSeconds(clamped);
                if (clamped >= plannedSeconds) {
                    setStatus('finished');
                    setLastTick(null);
                    localStorage.removeItem(storageKey);
                } else {
                    setStatus('running');
                    setLastTick(Date.now());
                }
            } else if (data.status === 'paused' && typeof data.elapsedSeconds === 'number') {
                setElapsedSeconds(Math.min(data.elapsedSeconds, plannedSeconds));
                setStatus('paused');
            }
        } catch (e) {
            // ignore parse errors
        }
    }, [plannedSeconds, storageKey, sessionCount]);

    useEffect(() => {
        if (status !== 'running') return;

        const tick = () => {
            setElapsedSeconds((prev) => {
                const now = Date.now();
                const delta = lastTick ? (now - lastTick) / 1000 : 0;
                const next = prev + delta;
                const reachedEnd = game.timer_mode === 'DESC' && next >= plannedSeconds;

                if (reachedEnd) {
                    setLastTick(null);
                    handleSessionEnd();
                    return plannedSeconds;
                }

                setLastTick(now);
                return next;
            });
        };

        const id = window.setInterval(tick, 250);
        return () => window.clearInterval(id);
    }, [status, lastTick, plannedSeconds, game.timer_mode, storageKey]);

    const teams = game.teams || [];
    const home = teams.find((t) => t.side === 'home');
    const away = teams.find((t) => t.side === 'away');
    const [events, setEvents] = useState(game.events || []);
    const scoreStorageKey = `game_scores_${game.id}`;
    const [scores, setScores] = useState(() => {
        const initial = {};
        try {
            const saved = localStorage.getItem(scoreStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            // ignore parse errors
        }
        if (home) initial[home.id] = home.score ?? 0;
        if (away) initial[away.id] = away.score ?? 0;
        return initial;
    });
    useEffect(() => {
        localStorage.setItem(scoreStorageKey, JSON.stringify(scores));
    }, [scores, scoreStorageKey]);

    const [confirmModal, setConfirmModal] = useState(null); // { type: 'session' | 'game' }

    const syncSessionState = async (overrides = {}) => {
        const payload = {
            number: overrides.number ?? sessionIndex + 1,
            planned_duration_seconds: overrides.planned_duration_seconds ?? plannedSeconds,
            actual_duration_seconds: Math.round(overrides.elapsed_seconds ?? elapsedSeconds),
            overrun_seconds: Math.max(Math.round((overrides.elapsed_seconds ?? elapsedSeconds) - plannedSeconds), 0),
            started_at: overrides.started_at ?? null,
            ended_at: overrides.ended_at ?? null,
        };

        try {
            await axios.post(`/api/sync/game/${game.id}/sessions`, { sessions: [payload] });
        } catch (e) {
            console.error('Failed to sync session state', e);
        }
    };

    const syncGameScores = async () => {
        const teamsPayload = [];
        if (home) {
            teamsPayload.push({
                id: home.id,
                name: home.name,
                side: 'home',
                score: scores[home.id] ?? 0,
            });
        }
        if (away) {
            teamsPayload.push({
                id: away.id,
                name: away.name,
                side: 'away',
                score: scores[away.id] ?? 0,
            });
        }

        try {
            await axios.post('/api/sync/game', {
                id: game.id,
                team_a_name: game.team_a_name,
                team_b_name: game.team_b_name,
                venue: game.venue,
                game_date: game.game_date,
                game_time: game.game_time,
                sessions: sessionCount,
                session_duration_minutes: game.session_duration_minutes,
                timer_mode: game.timer_mode,
                status: isGameOver ? 'finished' : game.status,
                teams: teamsPayload,
            });
        } catch (e) {
            console.error('Failed to sync game scores', e);
        }
    };

    const timerLockEnabled = config.timer_lock ?? true;
    const scheduledDisplay = formatDateTime(game.game_date, game.game_time);

    const displaySeconds =
        game.timer_mode === 'DESC'
            ? Math.max(Math.round(plannedSeconds - elapsedSeconds), 0)
            : Math.round(elapsedSeconds);
    const isGameOver = status === 'game_over';

    const handleStart = () => {
        if (status === 'ready' || status === 'finished') {
            setElapsedSeconds(0);
        }
        const now = Date.now();
        setLastTick(now);
        setStatus('running');
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                status: 'running',
                startAt: new Date(now).toISOString(),
                elapsedSeconds: 0,
                sessionIndex,
            })
        );
        syncSessionState({ elapsed_seconds: 0, started_at: new Date(now).toISOString() });
    };

    const handlePause = () => {
        setStatus('paused');
        setLastTick(null);
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                status: 'paused',
                elapsedSeconds,
                sessionIndex,
            })
        );
        syncSessionState();
    };

    const handleResume = () => {
        const now = Date.now();
        setLastTick(now);
        setStatus('running');
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                status: 'running',
                startAt: new Date(now - elapsedSeconds * 1000).toISOString(),
                elapsedSeconds,
                sessionIndex,
            })
        );
        syncSessionState({ elapsed_seconds: elapsedSeconds });
    };

    const handleRestart = () => {
        setElapsedSeconds(0);
        setStatus('ready');
        setLastTick(null);
        localStorage.removeItem(storageKey);
        syncSessionState({ elapsed_seconds: 0 });
    };

    const persistEvents = async (newEvents) => {
        try {
            await axios.post(`/api/sync/game/${game.id}/events`, {
                events: newEvents,
            });
        } catch (e) {
            console.error('Failed to sync events', e);
        }
    };

    const handleAddGoal = (team) => {
        if (!team || isGameOver) return;
        setScores((prev) => ({ ...prev, [team.id]: (prev[team.id] ?? 0) + 1 }));
        const newEvent = {
            id: `temp-${Date.now()}`,
            team_id: team.id,
            session_number: sessionIndex + 1,
            event_type: 'goal',
            timer_value_seconds: displaySeconds,
            occurred_at: new Date().toISOString(),
        };
        setEvents((prev) => [
            ...prev,
            newEvent,
        ]);
        persistEvents([newEvent]);
        syncSessionState();
        syncGameScores();
    };

    const handleRemoveGoal = (team) => {
        if (!team || isGameOver) return;
        setScores((prev) => ({ ...prev, [team.id]: Math.max((prev[team.id] ?? 0) - 1, 0) }));
        setEvents((prev) => {
            const idx = [...prev].reverse().findIndex((e) => e.event_type === 'goal' && e.team_id === team.id);
            if (idx === -1) return prev;
            const removeIndex = prev.length - 1 - idx;
            return [...prev.slice(0, removeIndex), ...prev.slice(removeIndex + 1)];
        });
        syncGameScores();
    };

    const handleQuickEvent = (event_type, team) => {
        if (isGameOver || !team) return;
        const id = `temp-${event_type}-${Date.now()}`;
        const newEvent = {
            id,
            session_number: sessionIndex + 1,
            event_type,
            timer_value_seconds: displaySeconds,
            occurred_at: new Date().toISOString(),
            team_id: team.id,
        };
        setEvents((prev) => [
            ...prev,
            newEvent,
        ]);
        persistEvents([newEvent]);
        syncSessionState();
        syncGameScores();
    };

    const handleSessionEnd = () => {
        const event = {
            id: `temp-session-end-${Date.now()}`,
            session_number: sessionIndex + 1,
            event_type: 'session_end',
            timer_value_seconds: displaySeconds,
            occurred_at: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, event]);
        persistEvents([event]);
        setStatus('ready');
        setLastTick(null);
        setElapsedSeconds(0);
        localStorage.removeItem(storageKey);

        if (sessionIndex + 1 < sessionCount) {
            setSessionIndex(sessionIndex + 1);
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    status: 'ready',
                    elapsedSeconds: 0,
                    sessionIndex: sessionIndex + 1,
                })
            );
        } else {
            handleGameEnd(true);
        }
        syncSessionState({ elapsed_seconds: plannedSeconds, ended_at: new Date().toISOString() });
        syncGameScores();
    };

    const handleGameEnd = (fromSessionEnd = false) => {
        setStatus('game_over');
        setLastTick(null);
        const event = {
            id: `temp-game-end-${Date.now()}`,
            session_number: sessionIndex + 1,
            event_type: 'game_end',
            timer_value_seconds: displaySeconds,
            occurred_at: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, event]);
        persistEvents([event]);
        localStorage.removeItem(storageKey);
        if (!fromSessionEnd) {
            setElapsedSeconds(plannedSeconds);
        }
        syncSessionState({ elapsed_seconds: plannedSeconds, ended_at: new Date().toISOString() });
        syncGameScores();
    };

    const confirmAnd = (action) => {
        if (action === 'session') {
            setConfirmModal({ type: 'session' });
        } else if (action === 'game') {
            setConfirmModal({ type: 'game' });
        }
    };

    const performConfirm = () => {
        if (confirmModal?.type === 'session') {
            handleSessionEnd();
        }
        if (confirmModal?.type === 'game') {
            handleGameEnd();
        }
        setConfirmModal(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Live Timer" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl space-y-4 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">{scheduledDisplay || 'Live Match'}</p>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {game.team_a_name} vs {game.team_b_name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Session length {game.session_duration_minutes} min · {sessionCount} sessions · {game.timer_mode}{' '}
                                timer
                            </p>
                        </div>
                        <Link
                            href={route('games.report', game.id)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            preserveScroll
                        >
                            View Report →
                        </Link>
                    </header>

                    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-gray-700">
                                    Session <span className="text-gray-900">{sessionIndex + 1} / {sessionCount}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">Break timer ready</span>
                                    <span className={`rounded-full px-2 py-1 text-xs ${timerLockEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {timerLockEnabled ? 'Wake Lock enabled' : 'Wake Lock disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-6">
                                <div className="text-sm uppercase tracking-wide text-gray-500">Main Timer</div>
                                <div className="text-6xl font-bold text-gray-900 tabular-nums">{formatSeconds(displaySeconds)}</div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {status !== 'running' && status !== 'finished' && (
                                        <button
                                            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
                                            onClick={handleStart}
                                            disabled={isGameOver}
                                        >
                                            Start
                                        </button>
                                    )}
                                    {status === 'running' && (
                                        <button
                                            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                                            onClick={handlePause}
                                            disabled={isGameOver}
                                        >
                                            Pause
                                        </button>
                                    )}
                                    {status === 'paused' && (
                                        <button
                                            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
                                            onClick={handleResume}
                                            disabled={isGameOver}
                                        >
                                            Resume
                                        </button>
                                    )}
                                    <button
                                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                                        onClick={handleRestart}
                                        disabled={isGameOver}
                                    >
                                        Restart
                                    </button>
                                    <button
                                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                                        onClick={() => confirmAnd('session')}
                                        disabled={isGameOver}
                                    >
                                        End Session
                                    </button>
                                    <button
                                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                                        onClick={() => confirmAnd('game')}
                                        disabled={isGameOver}
                                    >
                                        End Game
                                    </button>
                                </div>
                                {status === 'finished' && (
                                    <p className="text-xs font-semibold text-red-600">Session time reached.</p>
                                )}
                                {isGameOver && (
                                    <p className="text-xs font-semibold text-green-700">Game ended. View report.</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scoreboard</div>
                                <div className="mt-3 grid grid-cols-2 gap-4 text-center">
                                    <TeamScoreCard
                                        team={home}
                                        score={scores[home?.id] ?? 0}
                                        onAdd={() => handleAddGoal(home)}
                                        onRemove={() => handleRemoveGoal(home)}
                                        disabled={isGameOver}
                                    />
                                    <TeamScoreCard
                                        team={away}
                                        score={scores[away?.id] ?? 0}
                                        onAdd={() => handleAddGoal(away)}
                                        onRemove={() => handleRemoveGoal(away)}
                                        disabled={isGameOver}
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col gap-2">
                                        <QuickEventButton label="PC (Home)" onClick={() => handleQuickEvent('penalty_corner', home)} disabled={isGameOver || !home} />
                                        <QuickEventButton label="PS (Home)" onClick={() => handleQuickEvent('penalty_stroke', home)} disabled={isGameOver || !home} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <QuickEventButton label="PC (Away)" onClick={() => handleQuickEvent('penalty_corner', away)} disabled={isGameOver || !away} />
                                        <QuickEventButton label="PS (Away)" onClick={() => handleQuickEvent('penalty_stroke', away)} disabled={isGameOver || !away} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <aside className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">Event Timeline</p>
                                <span className="text-xs text-gray-500">{events.length} events</span>
                            </div>
                            <div className="space-y-3">
                                {events.length === 0 && <p className="text-sm text-gray-500">No events yet.</p>}
                                {events.map((event) => (
                                    <div key={event.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">
                                            Session {event.session_number} · {event.event_type}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {event.goal_type ? `${event.goal_type} · ` : ''}
                                            {event.card_type ? `${event.card_type} card · ` : ''}
                                            {event.timer_value_seconds != null ? formatSeconds(event.timer_value_seconds) : '--:--'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {event.team_id
                                                ? teams.find((t) => t.id === event.team_id)?.name || 'Team'
                                                : ''}
                                        </p>
                                        {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            <Modal show={!!confirmModal} onClose={() => setConfirmModal(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {confirmModal?.type === 'session' ? 'End Session?' : 'End Game?'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {confirmModal?.type === 'session'
                            ? 'Are you sure you want to end the current session and move to the next?'
                            : 'Are you sure you want to end the game now?'}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmModal(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={performConfirm}>Confirm</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

const TeamScoreCard = ({ team, score, onAdd, onRemove, disabled }) => {
    if (!team) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-800">Team</div>
                <div className="mt-2 text-4xl font-bold text-gray-900">0</div>
                <div className="mt-2 flex justify-center gap-2 text-sm">
                    <button className="rounded-full bg-indigo-600 px-3 py-1 text-white" disabled>
                        +
                    </button>
                    <button className="rounded-full border border-gray-300 px-3 py-1 text-gray-700" disabled>
                        -
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">{team.name}</div>
            <div className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">{score ?? 0}</div>
            <div className="mt-2 flex justify-center gap-2 text-sm">
                <button className="rounded-full bg-indigo-600 px-3 py-1 text-white disabled:bg-indigo-300" onClick={onAdd} disabled={disabled}>
                    +
                </button>
                <button className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 disabled:border-gray-200 disabled:text-gray-400" onClick={onRemove} disabled={disabled}>
                    -
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Tap + to open goal entry (FG / PG, player #).</div>
        </div>
    );
};

const QuickEventButton = ({ label, onClick, disabled }) => (
    <button
        className="rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400"
        onClick={onClick}
        type="button"
        disabled={disabled}
    >
        {label}
    </button>
);

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    const value = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) return `${date} ${time}`;
    return value.format('DD.MM.YYYY HH:mm');
};
