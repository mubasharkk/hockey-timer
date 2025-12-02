import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import EventTimeline from '@/Components/EventTimeline';
import moment from 'moment';

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
    const cardEventsByTeamAndNumber = (() => {
        const map = {};
        (events || [])
            .filter((e) => e.event_type === 'card' && e.player_shirt_number != null)
            .forEach((e) => {
                const key = `${e.team_id}-${e.player_shirt_number}`;
                map[key] = e.card_type || 'card';
            });
        return map;
    })();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Match Report" />

            <div className="py-8 print:bg-white">
                <style>
                    {`
                        @media print {
                            .no-print { display: none !important; }
                            body { background: white; }
                            .print-container { max-width: 210mm; margin: 0 auto; }
                            .print-section { page-break-inside: avoid; }
                        }
                    `}
                </style>
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8 print:mx-auto print:max-w-[210mm] print:px-0 print:py-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:flex-row print:items-center print:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Match Report</p>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {game.team_a_name} vs {game.team_b_name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {game.venue} · {formatLocalDate(game.game_date)} {game.game_time}
                            </p>
                            <p className="text-xs text-gray-500">Code: {game.code || game.id}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end print:hidden">
                            {game.status !== 'finished' && (
                                <Link href={route('games.timer', game.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Back to Timer
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
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

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
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
                                            <dd>{session.break_duration_seconds ? formatSeconds(session.break_duration_seconds) : '—'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
                        <h3 className="text-base font-semibold text-gray-900">Game Timeline</h3>
                        <div className="mt-4 bg-gradient-to-r from-red-600/10 via-red-600/10 to-transparent sm:bg-none" id="timeline-events">
                            <EventTimeline events={events} teams={game.teams || []} sessionCount={game.sessions?.length || game.sessions || null} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
                        <h3 className="text-base font-semibold text-gray-900">Teams & Players</h3>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[home, away].map((team, idx) => (
                                <div key={team?.id || idx} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                                    <p className="text-sm font-semibold text-gray-800">{team?.name || (idx === 0 ? 'Team A' : 'Team B')}</p>
                                    <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                        {(team?.players || []).map((player) => {
                                            const card = cardEventsByTeamAndNumber[`${team?.id}-${player.shirt_number}`];
                                            return (
                                                <li key={player.id || `${player.name}-${player.shirt_number || 'n'}`} className="flex items-center gap-2">
                                                    {player.shirt_number ? `#${player.shirt_number} ` : ''}
                                                    {player.name}
                                                    {card && (
                                                        <img
                                                            src={cardIcon(card)}
                                                            alt={`${card} card`}
                                                            className="h-5 w-5 object-contain"
                                                        />
                                                    )}
                                                </li>
                                            );
                                        })}
                                        {(team?.players || []).length === 0 && (
                                            <li className="text-xs text-gray-500">No players listed.</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const formatSeconds = (seconds) => {
    if (seconds == null) return '--:--';
    const dur = moment.duration(seconds, 'seconds');
    const mins = String(Math.floor(dur.asMinutes())).padStart(2, '0');
    const secs = String(dur.seconds()).padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatLocalDate = (date) => {
    if (!date) return '';
    const m = moment(date);
    return m.isValid() ? m.format('YYYY-MM-DD') : `${date}`;
};

const cardIcon = (type) => {
    if (type === 'red') return '/icons/red-card.png';
    if (type === 'yellow') return '/icons/yellow-card.png';
    if (type === 'green') return '/icons/green-card.png';
    return '/icons/red-card.png';
};
