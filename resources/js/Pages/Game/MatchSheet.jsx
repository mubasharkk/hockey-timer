import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import moment from 'moment';

export default function MatchSheet({ auth, game, sessionLabels = {} }) {
    const g = game?.data ?? game;

    const normalizeTeam = (team) => {
        if (!team) return null;
        const players = Array.isArray(team.players) ? team.players : team.players?.data || [];
        return { ...team, players };
    };

    const home = normalizeTeam(g?.home_team);
    const away = normalizeTeam(g?.away_team);
    const sessionCount = Object.keys(sessionLabels).length || (typeof g?.sessions === 'number' ? g.sessions : 2);
    const sessionNums = Array.from({ length: sessionCount }, (_, i) => i + 1);
    const playerRows = Math.max(home?.players?.length || 0, away?.players?.length || 0, 15);
    const eventRows = 25;
    const tournamentName = g?.tournament?.title || '';

    const sessionLabel = (n) => sessionLabels[n] || (sessionCount === 2 ? `H${n}` : sessionCount === 4 ? `Q${n}` : `S${n}`);
    const formatSport = (v) => v ? v.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—';

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Match Sheet · ${g?.code}`} />

            <style>{`
                @media print {
                    nav, header, footer, .no-print { display: none !important; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-page { box-shadow: none !important; }
                    @page { margin: 12mm 10mm; margin-bottom: 0; }
                }
                .ms-table { width: 100%; border-collapse: collapse; }
                .ms-table th, .ms-table td { border: 1px solid #d1d5db; padding: 5px 7px; font-size: 11px; }
                .ms-table th { background: #f3f4f6; font-weight: 600; color: #374151; }
                .ms-blank { height: 22px; }
                .sig-line { border-bottom: 1px solid #9ca3af; min-width: 140px; display: inline-block; }
            `}</style>

            <div className="py-6 print:py-0">
                <div className="mx-auto max-w-6xl print:max-w-full print:px-4">

                    {/* Screen-only toolbar */}
                    <div className="no-print mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Pre-Game Match Sheet</p>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {home?.name || g?.team_a_name} vs {away?.name || g?.team_b_name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('games.summary', g?.id)}
                                className="text-sm font-medium text-green-700 hover:text-green-600"
                            >
                                Back to summary
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
                            >
                                Print
                            </button>
                        </div>
                    </div>

                    <div className="print-page space-y-4 bg-white px-4 py-5 sm:px-6 print:px-0 print:py-0">

                        {/* ── Header ── */}
                        <div className="border-b-2 border-green-700 pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                        {formatSport(g?.sport_type)}{tournamentName ? ` · ${tournamentName}` : ''}
                                        {g?.tournament_pool_name ? ` · ${g.tournament_pool_name}` : ''}
                                        {g?.game_type ? ` · ${g.game_type}` : ''}
                                    </p>
                                    <h1 className="mt-0.5 text-lg font-bold uppercase text-gray-900">
                                        {home?.name || g?.team_a_name} <span className="text-green-700">vs</span> {away?.name || g?.team_b_name}
                                    </h1>
                                </div>
                                <div className="text-right text-xs text-gray-600">
                                    <p className="font-semibold text-gray-800">{g?.code}</p>
                                    <p>{formatDate(g?.game_date)} · {formatTime(g?.game_time)}</p>
                                    <p>{g?.venue || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Match Details ── */}
                        <table className="ms-table">
                            <tbody>
                                <tr>
                                    <th className="w-28">Format</th>
                                    <td colSpan={3}>{sessionCount} × {g?.session_duration_minutes ?? '—'} min · {g?.timer_mode ?? 'ASC'} timer</td>
                                </tr>
                                <tr>
                                    <th>Officials</th>
                                    <td colSpan={3}>{g?.game_officials || <span className="ms-blank block" />}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* ── Score Grid ── */}
                        <table className="ms-table">
                            <thead>
                                <tr>
                                    <th className="w-28">Team</th>
                                    {sessionNums.map((n) => (
                                        <th key={n} className="w-14 text-center">{sessionLabel(n)}</th>
                                    ))}
                                    <th className="w-14 text-center bg-green-50">Total</th>
                                    {(g?.sport_type === 'field_hockey' || g?.sport_type === 'hockey') && (
                                        <th className="w-14 text-center">SO</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: home?.name || g?.team_a_name, side: 'home' },
                                    { label: away?.name || g?.team_b_name, side: 'away' },
                                ].map((row) => (
                                    <tr key={row.side}>
                                        <td className="font-semibold">{row.label}</td>
                                        {sessionNums.map((n) => (
                                            <td key={n} className="ms-blank text-center" />
                                        ))}
                                        <td className="ms-blank bg-green-50 text-center" />
                                        {(g?.sport_type === 'field_hockey' || g?.sport_type === 'hockey') && (
                                            <td className="ms-blank text-center" />
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── Rosters ── */}
                        <table className="ms-table">
                            <thead>
                                <tr>
                                    <th colSpan={3} className="text-left">
                                        {home?.name || 'Home Team'}
                                        {home?.coach ? <span className="ml-2 font-normal text-gray-600">Coach: {home.coach}</span> : null}
                                        {home?.manager ? <span className="ml-2 font-normal text-gray-600">Manager: {home.manager}</span> : null}
                                    </th>
                                    <th colSpan={3} className="text-left">
                                        {away?.name || 'Away Team'}
                                        {away?.coach ? <span className="ml-2 font-normal text-gray-600">Coach: {away.coach}</span> : null}
                                        {away?.manager ? <span className="ml-2 font-normal text-gray-600">Manager: {away.manager}</span> : null}
                                    </th>
                                </tr>
                                <tr>
                                    <th className="w-10 text-center">#</th>
                                    <th>Player Name</th>
                                    <th className="w-10 text-center">✓</th>
                                    <th className="w-10 text-center">#</th>
                                    <th>Player Name</th>
                                    <th className="w-10 text-center">✓</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: playerRows }).map((_, idx) => {
                                    const hp = home?.players?.[idx];
                                    const ap = away?.players?.[idx];
                                    return (
                                        <tr key={idx}>
                                            <td className="text-center">{hp?.shirt_number ?? ''}</td>
                                            <td>{hp?.name ?? ''}</td>
                                            <td className="ms-blank" />
                                            <td className="text-center">{ap?.shirt_number ?? ''}</td>
                                            <td>{ap?.name ?? ''}</td>
                                            <td className="ms-blank" />
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* ── Event Log ── */}
                        <table className="ms-table">
                            <thead>
                                <tr>
                                    <th className="w-8 text-center">#</th>
                                    <th className="w-14 text-center">Session</th>
                                    <th className="w-16 text-center">Time</th>
                                    <th className="w-36">Team</th>
                                    <th className="w-10 text-center">#</th>
                                    <th>Player</th>
                                    <th className="w-28">Event Type</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: eventRows }).map((_, idx) => (
                                    <tr key={idx} className="ms-blank">
                                        <td className="text-center text-[10px] text-gray-400">{idx + 1}</td>
                                        <td /><td /><td /><td /><td /><td /><td />
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── Signatures ── */}
                        <table className="ms-table">
                            <thead>
                                <tr>
                                    <th colSpan={4} className="text-left">Signatures &amp; Confirmation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-1/4">
                                        <p className="text-[10px] text-gray-500">Home Team Captain / Manager</p>
                                        <span className="ms-blank block mt-4" />
                                    </td>
                                    <td className="w-1/4">
                                        <p className="text-[10px] text-gray-500">Away Team Captain / Manager</p>
                                        <span className="ms-blank block mt-4" />
                                    </td>
                                    <td className="w-1/4">
                                        <p className="text-[10px] text-gray-500">Umpire 1</p>
                                        <span className="ms-blank block mt-4" />
                                    </td>
                                    <td className="w-1/4">
                                        <p className="text-[10px] text-gray-500">Umpire 2</p>
                                        <span className="ms-blank block mt-4" />
                                    </td>
                                </tr>
                                <tr>
                                    <td><p className="text-[10px] text-gray-500">Name &amp; Date</p><span className="ms-blank block" /></td>
                                    <td><p className="text-[10px] text-gray-500">Name &amp; Date</p><span className="ms-blank block" /></td>
                                    <td><p className="text-[10px] text-gray-500">Name &amp; Date</p><span className="ms-blank block" /></td>
                                    <td><p className="text-[10px] text-gray-500">Name &amp; Date</p><span className="ms-blank block" /></td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const formatDate = (v) => {
    if (!v) return '—';
    const m = moment(v);
    return m.isValid() ? m.format('DD MMM YYYY') : v;
};

const formatTime = (v) => {
    if (!v) return '—';
    const m = moment(v, 'HH:mm');
    return m.isValid() ? m.format('hh:mm A') : v;
};
