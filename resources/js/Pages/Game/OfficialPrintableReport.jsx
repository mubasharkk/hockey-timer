import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import moment from 'moment';

export default function OfficialPrintableReport({ auth, game, sessionScores = [], events = [], sessionLabels = {} }) {
    const home = (game?.teams || []).find((t) => t.side === 'home');
    const away = (game?.teams || []).find((t) => t.side === 'away');
    const sessionTotal =
        sessionScores?.length ||
        (Array.isArray(game?.sessions) ? game.sessions.length : Number(game?.sessions || 0));

    const sessionLabel = (number) => {
        if (!number) return '';
        if (sessionLabels && sessionLabels[number]) return sessionLabels[number];
        const prefix = sessionTotal === 2 ? 'H' : sessionTotal === 4 ? 'Q' : 'S';
        return `${prefix}${number}`;
    };

    const sessionRows = (sessionScores || []).map((row) => {
        const homeScore = (row.scores || []).find((s) => s.side === 'home')?.score ?? 0;
        const awayScore = (row.scores || []).find((s) => s.side === 'away')?.score ?? 0;
        return {
            label: row.label || sessionLabel(row.session_number),
            session_number: row.session_number,
            homeScore,
            awayScore,
        };
    });
    const sessionScoreMap = sessionRows.reduce((acc, row) => {
        if (row.session_number) {
            acc[row.session_number] = row;
        }
        return acc;
    }, {});

    const finalScore = sessionRows.length
        ? sessionRows[sessionRows.length - 1]
        : {
              homeScore: home?.score ?? 0,
              awayScore: away?.score ?? 0,
              label: 'Final',
          };

    const playerRows = Math.max(home?.players?.length || 0, away?.players?.length || 0);
    const orderedEvents = [...(events || [])]
        .filter((e) => e.team_id)
        .sort((a, b) => new Date(a?.occurred_at || 0) - new Date(b?.occurred_at || 0));

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Official Printable Report" />
            <div className="py-6 print:py-0">
                <style>
                    {`
                        @media print {
                            nav, header, .no-print { display: none !important; }
                            body { background: white; }
                            .print-page { box-shadow: none !important; border-color: #d1d5db !important; }
                            .print-table { width: 100% !important; border-collapse: collapse !important; }
                            .print-table th, .print-table td { border: 1px solid #d1d5db !important; padding: 6px 8px !important; }
                            .print-table th { background: #f9fafb !important; }
                            .page, .page-break { break-after: page; }
                        }
                        /* Screen defaults so what you see matches print */
                        .print-table { width: 100%; border-collapse: collapse; }
                        .print-table th, .print-table td { border: 1px solid #e5e7eb; padding: 6px 8px; }
                        .print-table th { background: #f9fafb; font-weight: 600; color: #374151; }
                    `}
                </style>
                <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8 print:max-w-full print:px-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Official Printable Report</p>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {game?.team_a_name} vs {game?.team_b_name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {formatDate(game?.game_date)} · {game?.game_time} · {game?.venue}
                            </p>
                            <p className="text-xs text-gray-500">Code: {game?.code || game?.id}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={route('games.report', game?.id)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Back to report
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Print
                            </button>
                        </div>
                    </div>

                    <div className="print-page space-y-6 bg-white px-4 py-5 sm:px-6 sm:py-6 print:px-0 print:py-0">
                        <section className="space-y-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Match Details</p>
                                    <p className="text-xs text-gray-600">Formatted for print-ready export.</p>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {finalScore.homeScore} – {finalScore.awayScore}
                                </div>
                            </div>
                            <table className="print-table w-full table-fixed text-sm text-gray-800">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <th className="w-32 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Code</th>
                                        <td className="px-3 py-2">{game?.code || game?.id}</td>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                                        <td className="px-3 py-2">{formatDate(game?.game_date)}</td>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Time</th>
                                        <td className="px-3 py-2">{game?.game_time || '—'}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Venue</th>
                                        <td colSpan={3} className="px-3 py-2">{game?.venue || '—'}</td>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Sessions</th>
                                        <td className="px-3 py-2">{sessionTotal || '—'} × {game?.session_duration_minutes ?? '—'} min</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Officials</th>
                                        <td colSpan={5}  className="px-3 py-2">{game?.game_officials || '—'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <section className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900">Sessions Detail</p>
                            <table className="print-table w-full text-sm text-gray-800">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Session</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                                            {home?.name || 'Team A'}
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                                            {away?.name || 'Team B'}
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Planned</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Actual</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Break</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Started</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Ended</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(game?.sessions || []).map((session) => (
                                        <tr key={session.id || session.number} className="border-t border-gray-200">
                                            <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                                {sessionLabel(session.number)}
                                            </td>
                                            <td className="px-3 py-2">
                                                {sessionScoreMap[session.number]?.homeScore ?? '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {sessionScoreMap[session.number]?.awayScore ?? '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {formatSeconds(session.planned_duration_seconds)}
                                            </td>
                                            <td className="px-3 py-2">
                                                {session.actual_duration_seconds
                                                    ? formatSeconds(session.actual_duration_seconds)
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {session.break_duration_seconds
                                                    ? formatSeconds(session.break_duration_seconds)
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {formatDateTime(session.started_at)}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">{formatDateTime(session.ended_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        <section className="space-y-2 print:page-break-after-always">
                            <p className="text-sm font-semibold text-gray-900">Teams &amp; Players</p>
                            <table className="print-table w-full text-sm text-gray-800">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700" colSpan={2}>
                                            <div className="flex flex-col">
                                                <span>{home?.name || 'Team A'}</span>
                                                {home?.coach && <span className="text-xs font-normal">Coach: {home.coach}</span>}
                                                {home?.manager && (
                                                    <span className="text-xs font-normal">Manager: {home.manager}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700" colSpan={2}>
                                            <div className="flex flex-col">
                                                <span>{away?.name || 'Team B'}</span>
                                                {away?.coach && <span className="text-xs font-normal">Coach: {away.coach}</span>}
                                                {away?.manager && (
                                                    <span className="text-xs font-normal">Manager: {away.manager}</span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="w-16 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Player</th>
                                        <th className="w-16 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Player</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: playerRows || 1 }).map((_, idx) => {
                                        const homePlayer = home?.players?.[idx];
                                        const awayPlayer = away?.players?.[idx];
                                        return (
                                            <tr key={idx} className="border-t border-gray-200">
                                                <td className="bg-gray-50 px-3 py-2">{homePlayer?.shirt_number ?? ''}</td>
                                                <td className="px-3 py-2">{homePlayer?.name || ''}</td>
                                                <td className="bg-gray-50 px-3 py-2">{awayPlayer?.shirt_number ?? ''}</td>
                                                <td className="px-3 py-2">{awayPlayer?.name || ''}</td>
                                            </tr>
                                        );
                                    })}
                                    {playerRows === 0 && (
                                        <tr className="border-t border-gray-200">
                                            <td className="px-3 py-2 text-sm text-gray-500" colSpan={4}>
                                                No players listed.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        <div className={'page-break'}></div>
                        <section className="space-y-2 page-break">
                            <p className="text-sm font-semibold text-gray-900">Event Log</p>
                            <table className="print-table w-full text-sm text-gray-800">
                                <thead>
                                    <tr>
                                        <th className="w-10 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                        <th className="w-20 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                                            Session
                                        </th>
                                        <th className="w-20 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                                            Clock
                                        </th>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Team</th>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Event</th>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                                            Player / Note
                                        </th>
                                        <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                                            Occurred At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderedEvents.length === 0 && (
                                        <tr className="border-t border-gray-200">
                                            <td className="px-3 py-2 text-sm text-gray-500" colSpan={7}>
                                                No events recorded.
                                            </td>
                                        </tr>
                                    )}
                                    {orderedEvents.map((event, idx) => (
                                        <tr key={event.id || idx} className="border-t border-gray-200">
                                            <td className="bg-gray-50 px-3 py-2">{idx + 1}</td>
                                            <td className="px-3 py-2">{sessionLabel(event.session_number)}</td>
                                            <td className="px-3 py-2">
                                                {event.timer_value_seconds != null
                                                    ? formatSeconds(event.timer_value_seconds)
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {event.team_id ? teamName(event.team_id, game?.teams) : '—'}
                                            </td>
                                            <td className="px-3 py-2">{eventLabel(event)}</td>
                                            <td className="px-3 py-2">{playerNote(event)}</td>
                                            <td className="px-3 py-2 text-gray-700">{formatDateTime(event.occurred_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const formatSeconds = (seconds) => {
    if (seconds == null) return '—';
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatDate = (value) => {
    if (!value) return '';
    const m = moment(value);
    return m.isValid() ? m.format('YYYY-MM-DD') : value;
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const m = moment(value);
    return m.isValid() ? m.format('YYYY-MM-DD HH:mm') : value;
};

const eventLabel = (event) => {
    switch (event.event_type) {
        case 'goal':
            return event.goal_type ? `${event.goal_type} goal` : 'Goal';
        case 'penalty_corner':
            return 'Penalty Corner';
        case 'penalty_stroke':
            return 'Penalty Stroke';
        case 'card':
            return `${event.card_type || ''} card`.trim() || 'Card';
        case 'session_end':
            return 'Session End';
        case 'session_start':
            return 'Session Start';
        case 'game_end':
            return 'Game End';
        case 'highlight':
        default:
            return event.note || 'Event';
    }
};

const playerNote = (event) => {
    const numberPart = event.player_shirt_number != null ? `#${event.player_shirt_number}` : '';
    if (numberPart && event.note) {
        return `${numberPart} · ${event.note}`;
    }
    if (numberPart) return numberPart;
    return event.note || '—';
};

const teamName = (teamId, teams = []) => teams?.find((t) => t.id === teamId)?.name || '—';

const formatSport = (value) => {
    if (!value) return '—';
    const pretty = value.replace(/_/g, ' ');
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
};
