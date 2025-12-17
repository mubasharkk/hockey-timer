import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import moment from 'moment';

export default function Dashboard({ auth, games = [], now }) {
    const [tab, setTab] = useState('upcoming');
    const nowMoment = useMemo(() => (now ? moment(now) : moment()), [now]);
    const gameList = useMemo(() => (Array.isArray(games) ? games : games?.data || []), [games]);

    const upcomingGames = useMemo(() => partitionGames(gameList, nowMoment).upcoming, [gameList, nowMoment]);
    const resultGames = useMemo(() => partitionGames(gameList, nowMoment).results, [gameList, nowMoment]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Link
                            href={route('tournaments.create')}
                            className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            New Tournament
                        </Link>
                        <Link
                            href={route('teams.create')}
                            className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            Register Team
                        </Link>
                        <Link
                            href={route('games.create')}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            New Game
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6 text-gray-900">
                                    <h3 className="text-lg font-semibold text-gray-900">Games</h3>
                                    <p className="mt-1 text-sm text-gray-600">Recent games with status and scheduled start.</p>

                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex overflow-hidden rounded-md border border-gray-200 text-sm font-semibold">
                                                <button
                                                    className={`px-4 py-1.5 ${tab === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700'}`}
                                                    onClick={() => setTab('upcoming')}
                                                >
                                                    Upcoming ({upcomingGames.length})
                                                </button>
                                                <button
                                                    className={`px-4 py-1.5 ${tab === 'results' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700'}`}
                                                    onClick={() => setTab('results')}
                                                >
                                                    Results ({resultGames.length})
                                                </button>
                                            </div>
                                        </div>

                                        {tab === 'upcoming' ? (
                                            <GameList games={upcomingGames} now={nowMoment} emptyMessage="No upcoming games." />
                                        ) : (
                                            <GameList games={resultGames} now={nowMoment} emptyMessage="No finished games yet." />
                                        )}
                                    </div>
                                </div>
                            </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const GameList = ({ games, now, emptyMessage }) => {
    if (!games || games.length === 0) {
        return <p className="text-sm text-gray-600">{emptyMessage}</p>;
    }

    return (
        <div className="space-y-3">
            {games.map((game) => (
                <GameRow key={game.id} game={game} now={now} />
            ))}
        </div>
    );
};

const GameRow = ({ game, now }) => {
    const status = deriveStatus(game);
    const relative = formatRelativeStart(game.game_date, game.game_time, now, status, game.ended_at);
    return (
        <div className="flex flex-wrap items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
                <img
                    src={sportIcon(game.sport_type)}
                    alt={game.sport_type || 'sport'}
                    className="h-10 w-10 rounded-md bg-white object-contain p-1 ring-1 ring-gray-200"
                    loading="lazy"
                />
                <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">
                        {game.team_a_name} vs {game.team_b_name}
                    </div>
                    {game.tournament?.title && (
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                            {game.tournament.title}
                        </div>
                    )}
                    {game.excerpt && <div className="text-xs text-gray-700">{game.excerpt}</div>}
                    {game.code && <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Code: {game.code}</div>}
                    <div className="text-xs text-gray-600">
                        <strong>{formatDateTime(game.game_date, game.game_time)}</strong> · {game.venue}
                        {relative ? ` · ${relative}` : ''}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <StatusBadge status={status} />
                <Link
                    href={route(status === 'finished' ? 'games.report' : 'games.summary', game.id)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                    {status === 'finished' ? 'Report' : 'View'}
                </Link>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const palette = {
        draft: 'bg-gray-100 text-gray-800',
        scheduled: 'bg-blue-100 text-blue-800',
        running: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        finished: 'bg-red-100 text-red-800',
    };

    const style = palette[status] ?? 'bg-gray-100 text-gray-800';

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
            {status || 'draft'}
        </span>
    );
};

const formatDateTime = (date, time) => {
    const value = moment(`${date || ''} ${time || ''}`.trim(), 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) {
        return [date, time].filter(Boolean).join(' ') || 'TBD';
    }
    return value.format('DD.MM.YYYY · hh:mm A');
};

const formatRelativeStart = (date, time, nowIso, status, endedAt) => {
    const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const now = nowIso ? moment(nowIso) : moment();
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

const deriveStatus = (game) => {
    if (game.status === 'finished' || game.ended_at) return 'finished';
    return game.status || 'scheduled';
};

const partitionGames = (games, now) => {
    const upcoming = [];
    const results = [];

    games.forEach((game) => {
        const status = deriveStatus(game);
        const start = moment(`${game.game_date} ${game.game_time}`, 'YYYY-MM-DD HH:mm');

        const isResult = status === 'finished' || game.ended_at || (start.isValid() && start.isBefore(now));

        if (isResult) {
            results.push(game);
        } else {
            upcoming.push(game);
        }
    });

    return { upcoming, results };
};

const sportIcon = (sport) => {
    switch (sport) {
        case 'football':
            return '/icons/football.png';
        case 'field_hockey':
            return '/icons/field-hockey.png';
        case 'futsal':
            return '/icons/futsal.png';
        case 'handball':
            return '/icons/handball.png';
        case 'basketball':
            return '/icons/basketball.png';
        default:
            return '/icons/default-sport.png';
    }
};

const sportLabel = (sport) => {
    const map = {
        football: 'Football',
        field_hockey: 'Field Hockey',
        futsal: 'Futsal',
        handball: 'Handball',
        basketball: 'Basketball',
    };
    return map[sport] || 'Sport';
};
