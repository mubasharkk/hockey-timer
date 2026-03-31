import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import moment from 'moment';
import GameRow from '@/Components/GameRow';
import DashboardStats from '@/Components/DashboardStats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faUsers, faFutbol } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard({ auth, upcoming = [], results = [], now }) {
    const [tab, setTab] = useState('upcoming');
    const nowMoment = useMemo(() => (now ? moment(now) : moment()), [now]);
    const upcomingGames = useMemo(() => (Array.isArray(upcoming) ? upcoming : upcoming?.data || []), [upcoming]);
    const resultGames = useMemo(() => (Array.isArray(results) ? results : results?.data || []), [results]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 sm:gap-3">
                        <Link
                            href={route('tournaments.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 sm:px-3"
                            title="New Tournament"
                        >
                            <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">New Tournament</span>
                        </Link>
                        <Link
                            href={route('teams.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 sm:px-3"
                            title="Register Team"
                        >
                            <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Register Team</span>
                        </Link>
                        <Link
                            href={route('games.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-green-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 sm:px-3"
                            title="New Game"
                        >
                            <FontAwesomeIcon icon={faFutbol} className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">New Game</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Statistics Block */}
                    <DashboardStats />

                    {/* Games Block */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold text-gray-900">Games</h3>
                                    <p className="mt-1 text-sm text-gray-600">Recent games with status and scheduled start.</p>

                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex overflow-hidden rounded-md border border-gray-200 text-sm font-semibold">
                                                <button
                                                    className={`px-4 py-1.5 ${tab === 'upcoming' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700'}`}
                                                    onClick={() => setTab('upcoming')}
                                                >
                                                    Upcoming ({upcomingGames.length})
                                                </button>
                                                <button
                                                    className={`px-4 py-1.5 ${tab === 'results' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700'}`}
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

    const grouped = useMemo(() => {
        const map = {};
        [...games]
            .sort((a, b) => {
                const da = `${a.game_date || ''} ${a.game_time || ''}`.trim();
                const db = `${b.game_date || ''} ${b.game_time || ''}`.trim();
                return da.localeCompare(db);
            })
            .forEach((game) => {
                const key = game.game_date || 'TBD';
                if (!map[key]) map[key] = [];
                map[key].push(game);
            });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [games]);

    return (
        <div className="space-y-6">
            {grouped.map(([date, dateGames]) => (
                <div key={date}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {date !== 'TBD' ? moment(date, 'YYYY-MM-DD').format('dddd, DD MMM YYYY') : 'Date TBD'}
                    </div>
                    <div className="space-y-3">
                        {dateGames.map((game) => (
                            <GameRow key={game.id} game={game} now={now} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};



