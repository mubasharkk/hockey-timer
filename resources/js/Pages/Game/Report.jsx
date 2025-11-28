import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Report({ auth, game }) {
    if (!game) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Match Report" />
                <div className="py-8">
                    <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">Game not found.</div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const home = (game.teams || []).find((t) => t.side === 'home');
    const away = (game.teams || []).find((t) => t.side === 'away');
    const sessions = game.sessions || [];
    const events = game.events || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Match Report" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Match Report</p>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {game.team_a_name} vs {game.team_b_name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {game.venue} · {game.game_date} {game.game_time}
                            </p>
                        </div>
                        <Link href={route('games.timer', game.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Back to Timer
                        </Link>
                    </div>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Final Score</h2>
                            <div className="text-3xl font-bold text-gray-900">
                                {(home?.score ?? 0)} – {(away?.score ?? 0)}
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Scores update automatically as goals sync in; manual edits can be done via the timer screen.
                        </p>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900">Sessions</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {sessions.map((session) => (
                                <div key={session.id ?? session.number} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                                    <p className="text-sm font-semibold text-gray-800">Session {session.number}</p>
                                    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div>
                                            <dt className="font-semibold text-gray-700">Planned</dt>
                                            <dd>{formatSeconds(session.planned_duration_seconds)} planned</dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-gray-700">Actual</dt>
                                            <dd>
                                                {session.actual_duration_seconds
                                                    ? `${formatSeconds(session.actual_duration_seconds)}`
                                                    : 'n/a'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-gray-700">Overrun</dt>
                                            <dd>{session.overrun_seconds ? `${session.overrun_seconds}s` : '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-gray-700">Break</dt>
                                            <dd>{session.break_duration_seconds ? `${session.break_duration_seconds}s` : '—'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900">Event Timeline</h3>
                        <div className="mt-4 space-y-3">
                            {events.length === 0 && <p className="text-sm text-gray-600">No events recorded.</p>}
                            {events.map((event) => (
                                <div key={event.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Session {event.session_number} · {event.event_type}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
                                        {event.goal_type && <Badge>{event.goal_type}</Badge>}
                                        {event.card_type && <Badge>{event.card_type} card</Badge>}
                                        {event.timer_value_seconds != null && <Badge>{formatSeconds(event.timer_value_seconds)}</Badge>}
                                        {event.player_shirt_number && <Badge>#{event.player_shirt_number}</Badge>}
                                        {event.note && <span className="text-gray-700">{event.note}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const Badge = ({ children }) => (
    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">{children}</span>
);

const formatSeconds = (seconds) => {
    if (seconds == null) return '--:--';
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};
