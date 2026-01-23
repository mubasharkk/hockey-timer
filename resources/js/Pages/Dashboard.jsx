import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import moment from 'moment';
import GameRow from '@/Components/GameRow';

export default function Dashboard({ auth, upcoming = [], results = [], now }) {
    const [tab, setTab] = useState('upcoming');
    const nowMoment = useMemo(() => (now ? moment(now) : moment()), [now]);
    const upcomingGames = useMemo(() => (Array.isArray(upcoming) ? upcoming : upcoming?.data || []), [upcoming]);
    const resultGames = useMemo(() => (Array.isArray(results) ? results : results?.data || []), [results]);

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
                            className="inline-flex items-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
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

    return (
        <div className="space-y-3">
            {games.map((game) => (
                <GameRow key={game.id} game={game} now={now} />
            ))}
        </div>
    );
};



