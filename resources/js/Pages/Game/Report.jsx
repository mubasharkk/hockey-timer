import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import EventTimeline from '@/Components/EventTimeline';
import moment from 'moment';
import GameTeamSquad from '@/Components/GameTeamSquad';

export default function Report({ auth, game }) {
    const currentGame = game?.data ?? game;
    if (!currentGame) {
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

    const normalizeTeam = (team) => {
        if (!team) return null;
        const players = Array.isArray(team.players) ? team.players : team.players?.data || [];
        return { ...team, players: players || [] };
    };

    const home = normalizeTeam((currentGame.teams || []).find((t) => t.side === 'home'));
    const away = normalizeTeam((currentGame.teams || []).find((t) => t.side === 'away'));
    const teamsNormalized = (currentGame.teams || []).map(normalizeTeam);
    const sessions = currentGame.sessions || [];
    const events = currentGame.events || [];
    const scoreByTeam = calculateScoresFromEvents(events);
    const homeScore = scoreByTeam[home?.id] ?? home?.score ?? 0;
    const awayScore = scoreByTeam[away?.id] ?? away?.score ?? 0;
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
                                {currentGame.team_a_name} vs {currentGame.team_b_name}
                            </h1>
                            {currentGame.excerpt && <p className="text-sm text-gray-700">{currentGame.excerpt}</p>}
                            <p className="text-sm text-gray-600">
                                {currentGame.venue} · {formatLocalDate(currentGame.game_date)} {formatTime(currentGame.game_time)}
                            </p>
                            <p className="text-xs text-gray-500">Code: {currentGame.code || currentGame.id}</p>
                            {currentGame.game_officials && (
                                <p className="text-xs text-gray-600">Game Officials: {currentGame.game_officials}</p>
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end print:hidden">
                            {currentGame.status !== 'finished' && (
                                <Link href={route('games.timer', currentGame.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Back to Timer
                                </Link>
                            )}
                            <Link
                                href={route('games.official_report', currentGame.id)}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                                target="_blank"
                                rel="noopener noreferrer">
                                Official Report
                            </Link>
                        </div>
                    </div>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Final Score</h2>
                            <div className="text-3xl font-bold text-gray-900">
                                {homeScore} – {awayScore}
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
                            <EventTimeline
                                events={events}
                                teams={teamsNormalized}
                                sessionCount={sessions?.length || currentGame.sessions || null}
                                sessions={sessions}
                            />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border print:shadow-none print-section">
                        <h3 className="text-base font-semibold text-gray-900">Teams & Players</h3>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <GameTeamSquad team={home} fallbackLabel="Team A" />
                            <GameTeamSquad team={away} fallbackLabel="Team B" />
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

const formatTime = (time) => {
    if (!time) return '';
    const m = moment(time, 'HH:mm');
    return m.isValid() ? m.format('hh:mm A') : time;
};

const cardIcon = (type) => {
    if (type === 'red') return '/icons/red-card.png';
    if (type === 'yellow') return '/icons/yellow-card.png';
    if (type === 'green') return '/icons/green-card.png';
    return '/icons/red-card.png';
};

const calculateScoresFromEvents = (events = []) => {
    return (events || []).reduce((acc, event) => {
        if (event.event_type === 'goal' && event.team_id) {
            acc[event.team_id] = (acc[event.team_id] ?? 0) + 1;
        }
        return acc;
    }, {});
};
