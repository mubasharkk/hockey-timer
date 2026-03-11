import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import moment from 'moment';
import GameTeamSquad from '@/Components/GameTeamSquad';

export default function Summary({ auth, game }) {
    const currentGame = game?.data ?? game;

    if (!currentGame) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Match Summary" />
                <div className="py-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">Game not found.</div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const scheduledAt = currentGame.game_date && currentGame.game_time ? new Date(`${currentGame.game_date}T${currentGame.game_time}`) : null;
    const isFinished = currentGame.status === 'finished' || !!currentGame.ended_at;
    const scheduledDisplay = formatDateTime(currentGame.game_date, currentGame.game_time);
    const relativeStart = formatRelativeStart(currentGame.game_date, currentGame.game_time, currentGame.status, currentGame.ended_at);
    const gameCode = currentGame.code;
    const sessions = currentGame.sessions || [];
    const sessionCount = sessions.length;
    const now = new Date();
    const canStart = !isFinished && (scheduledAt ? now >= scheduledAt : false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { delete: destroy, processing } = useForm({});

    const resolveTeam = (team, fallbackName) => {
        if (team) {
            return {
                ...team,
                name: team.name || fallbackName,
                players: team.players || [],
            };
        }
        return { name: fallbackName, players: [] };
    };

    const homeTeamResolved = resolveTeam(currentGame.home_team, currentGame.team_a_name);
    const awayTeamResolved = resolveTeam(currentGame.away_team, currentGame.team_b_name);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Match Summary" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <header className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Summary</p>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {homeTeamResolved.name} vs {awayTeamResolved.name}
                        </h1>
                        {currentGame.excerpt && <p className="text-sm text-gray-700">{currentGame.excerpt}</p>}
                        {gameCode && <p className="text-xs font-semibold text-gray-500">Code: {gameCode}</p>}
                        <p className="text-sm text-gray-600">
                            {currentGame.venue} · {scheduledDisplay || `${currentGame.game_date} ${currentGame.game_time}`} ({currentGame.timer_mode} timer)
                        </p>
                        {relativeStart && <p className="text-xs text-gray-500">{relativeStart}</p>}
                    </header>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Sessions</dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                    {sessionCount} × {currentGame.session_duration_minutes} min
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Timer Mode</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{currentGame.timer_mode}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Game Officials</dt>
                                        <dd className="text-sm text-gray-900">{currentGame.game_officials || '—'}</dd>
                                    </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Home Squad</dt>
                                <dd className="text-sm text-gray-900">
                                    <GameTeamSquad team={homeTeamResolved} fallbackLabel="Home Team" />
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Away Squad</dt>
                                <dd className="text-sm text-gray-900">
                                    <GameTeamSquad team={awayTeamResolved} fallbackLabel="Away Team" />
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-6 flex items-center justify-between rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                            <span>{isFinished ? 'Game has ended. View the report for details.' : 'Match can start when browser time reaches the scheduled start.'}</span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isFinished ? 'bg-green-100 text-green-800' : canStart ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {isFinished ? 'Finished' : canStart ? 'Ready' : 'Waiting for start time'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Link
                            href={route('games.edit', currentGame.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400"
                        >
                            Edit
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route('public.ticker.code', currentGame.code)}
                                className="inline-flex items-center rounded-md border border-green-300 px-3 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:border-green-400"
                                preserveScroll
                            >
                                Public Ticker
                            </Link>
                            {isFinished ? (
                                <Link
                                    href={route('games.report', currentGame.id)}
                                    className="inline-flex items-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                                    preserveScroll
                                >
                                    View Report
                                </Link>
                            ) : (
                                <Link
                                    href={route('games.timer', currentGame.id)}
                                    className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition ${
                                        canStart
                                            ? 'bg-green-700 text-white hover:bg-green-600'
                                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    }`}
                                    preserveScroll
                                >
                                    Start Match
                                </Link>
                            )}
                            <DangerButton onClick={() => setConfirmDelete(true)} disabled={processing}>
                                Delete
                            </DangerButton>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Delete Game?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This will remove the game and its records. This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmDelete(false)}>Cancel</SecondaryButton>
                        <DangerButton
                            onClick={() => {
                                destroy(route('games.destroy', currentGame.id), {
                                    preserveScroll: true,
                                    onFinish: () => setConfirmDelete(false),
                                });
                            }}
                            disabled={processing}
                        >
                            Confirm Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

const TeamSquad = ({ team, fallbackLabel }) => {
    if (!team) {
        return (
            <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                <p className="font-semibold text-gray-700">{fallbackLabel}</p>
                <p>No squad provided.</p>
            </div>
        );
    }

    const players = Array.isArray(team.players) ? team.players : team.players?.data || [];
    const hasPlayers = players.length > 0;

    return (
        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">{team.name || fallbackLabel}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold uppercase text-green-700">
                    {players.length} players
                </span>
            </div>
            {hasPlayers ? (
                <ul className="space-y-1 text-sm text-gray-700">
                    {players.map((p) => (
                        <li
                            key={p.id || `${p.name}-${p.shirt_number || 'n'}`}
                            className="flex items-center justify-between rounded bg-white px-2 py-1"
                        >
                            <span className="flex items-center gap-2">
                                <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                    {p.shirt_number ?? '—'}
                                </span>
                                <span>{p.name}</span>
                            </span>
                            {p.is_active === false && (
                                <span className="text-[11px] font-semibold uppercase text-amber-600">Inactive</span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No players listed for this team.</p>
            )}
            {team.coach && <p className="mt-3 text-xs text-gray-600">Coach: {team.coach}</p>}
        </div>
    );
};

const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    const value = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) return `${date} ${time}`;
    return value.format('DD.MM.YYYY hh:mm A');
};

const formatRelativeStart = (date, time, status, endedAt) => {
    const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const now = moment();
    if (!start.isValid()) return '';
    if (status === 'finished' || endedAt) return 'Finished';

    const diffMinutes = start.diff(now, 'minutes', true);
    if (Math.abs(diffMinutes) < 1) return 'Starting now';

    return formatMinutesHuman(diffMinutes, 'to start', 'since start');
};

const formatMinutesHuman = (minutes, futureSuffix = '', pastSuffix = '') => {
    const total = Math.abs(Math.round(minutes));
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);
    const mins = total % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins || parts.length === 0) parts.push(`${mins}m`);

    const suffix = minutes >= 0 ? futureSuffix : pastSuffix;
    return `${parts.join(' ')} ${suffix}`.trim();
};
