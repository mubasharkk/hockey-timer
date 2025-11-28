import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import moment from 'moment';

export default function Summary({ auth, game }) {
    if (!game) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Match Summary" />
                <div className="py-8">
                    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">Game not found.</div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const scheduledAt = game.game_date && game.game_time ? new Date(`${game.game_date}T${game.game_time}`) : null;
    const isFinished = game.status === 'finished' || !!game.ended_at;
    const scheduledDisplay = formatDateTime(game.game_date, game.game_time);
    const relativeStart = formatRelativeStart(game.game_date, game.game_time, game.status, game.ended_at);
    const sessions = game.sessions || [];
    const sessionCount = sessions.length;
    const now = new Date();
    const canStart = !isFinished && (scheduledAt ? now >= scheduledAt : false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { delete: destroy, processing } = useForm({});

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Match Summary" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Summary</p>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {game.team_a_name} vs {game.team_b_name}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {game.venue} · {scheduledDisplay || `${game.game_date} ${game.game_time}`} ({game.timer_mode} timer)
                        </p>
                        {relativeStart && <p className="text-xs text-gray-500">{relativeStart}</p>}
                    </header>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Sessions</dt>
                                <dd className="text-lg font-semibold text-gray-900">
                                    {sessionCount} × {game.session_duration_minutes} min
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Timer Mode</dt>
                                <dd className="text-lg font-semibold text-gray-900">{game.timer_mode}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Home Players</dt>
                                <dd className="text-sm text-gray-900">
                                    {(game.teams || [])
                                        .find((t) => t.side === 'home')
                                        ?.players?.map((p) => (p.shirt_number ? `#${p.shirt_number} ${p.name}` : p.name))
                                        ?.join(', ') || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Away Players</dt>
                                <dd className="text-sm text-gray-900">
                                    {(game.teams || [])
                                        .find((t) => t.side === 'away')
                                        ?.players?.map((p) => (p.shirt_number ? `#${p.shirt_number} ${p.name}` : p.name))
                                        ?.join(', ') || '—'}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-6 flex items-center justify-between rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                            <span>{isFinished ? 'Game has ended. View the report for details.' : 'Match can start when browser time reaches the scheduled start.'}</span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isFinished ? 'bg-indigo-100 text-indigo-800' : canStart ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {isFinished ? 'Finished' : canStart ? 'Ready' : 'Waiting for start time'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Link
                            href={route('games.edit', game.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400"
                        >
                            Edit
                        </Link>

                        <div className="flex items-center gap-2">
                            {isFinished ? (
                                <Link
                                    href={route('games.report', game.id)}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                                    preserveScroll
                                >
                                    View Report
                                </Link>
                            ) : (
                                <Link
                                    href={route('games.timer', game.id)}
                                    className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition ${
                                        canStart
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
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
                                destroy(route('games.destroy', game.id), {
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

const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    const value = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) return `${date} ${time}`;
    return value.format('DD.MM.YYYY HH:mm');
};

const formatRelativeStart = (date, time, status, endedAt) => {
    const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const now = moment();
    if (!start.isValid()) return '';
    if (status === 'finished' || endedAt) return 'Finished';

    const diffMinutes = start.diff(now, 'minutes', true);
    if (diffMinutes > 1) {
        return `${Math.round(diffMinutes)} mins to start`;
    }
    if (diffMinutes > 0) {
        return 'Starting soon';
    }

    const minsAgo = now.diff(start, 'minutes', true);
    if (minsAgo < 60) {
        return `${Math.round(minsAgo)} mins since start`;
    }
    return `${Math.round(minsAgo / 60)} hrs since start`;
};
