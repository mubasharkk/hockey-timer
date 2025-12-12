import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import moment from 'moment';
import GameMatchup from '@/Components/GameMatchup';
import PoolResults from '@/Components/PoolResults';

export default function Tournament({ tournament, poolResults = [] }) {
    const [tab, setTab] = useState('upcoming');

    const upcomingGames = useMemo(() => {
        return (tournament.games || []).filter((g) => {
            if (!g.game_date) return false;
            const date = moment(g.game_date).startOf('day');
            return date.isSameOrAfter(moment().startOf('day'));
        });
    }, [tournament.games]);

    const resultGames = useMemo(() => {
        return (tournament.games || []).filter((g) => {
            if (!g.game_date) return true;
            const date = moment(g.game_date).startOf('day');
            return g.status === 'finished' || date.isBefore(moment().startOf('day'));
        });
    }, [tournament.games]);

    return (
        <PublicLayout fullWidth>
            <Head title={tournament.title} />
            <div className="bg-gray-50 px-[calc(50vw-50%)] py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-0">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Tournament</p>
                                <h1 className="text-2xl font-semibold text-gray-900">{tournament.title}</h1>
                                <p className="text-sm text-gray-600">{tournament.venue}</p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(tournament.start_date)}
                                    {tournament.end_date ? ` → ${formatDate(tournament.end_date)}` : ''}
                                </p>
                            </div>
                            {tournament.logo_url && (
                                <img
                                    src={tournament.logo_url}
                                    alt={`${tournament.title} logo`}
                                    className="h-20 w-20 rounded-lg object-contain ring-1 ring-gray-200 bg-white"
                                />
                            )}
                        </div>
                        {tournament.sponsor_logo_urls && tournament.sponsor_logo_urls.length > 0 && (
                            <div className="mt-6 rounded-md border border-gray-100 bg-gray-50 p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-900">Sponsors</h3>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {tournament.sponsor_logo_urls.map((url, idx) => (
                                        <div key={idx} className="flex h-14 w-20 items-center justify-center rounded-md bg-white ring-1 ring-gray-200">
                                            <img src={url} alt={`Sponsor ${idx + 1}`} className="max-h-12 max-w-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <h3 className="text-sm font-semibold text-gray-900">Pool Standings</h3>
                        </div>
                        <PoolResults results={poolResults} />
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-gray-900">Games</h3>
                            </div>
                            <div className="flex overflow-hidden rounded-md border border-gray-200 text-sm font-semibold">
                                <button
                                    className={`px-4 py-1.5 ${tab === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700'}`}
                                    onClick={() => setTab('upcoming')}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className={`px-4 py-1.5 ${tab === 'results' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700'}`}
                                    onClick={() => setTab('results')}
                                >
                                    Results
                                </button>
                            </div>
                        </div>

                        {tab === 'upcoming' ? (
                            <GameList games={upcomingGames} emptyMessage="No upcoming games." />
                        ) : (
                            <GameList games={resultGames} emptyMessage="No finished games yet." />
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

const GameList = ({ games, emptyMessage }) => {
    if (!games || games.length === 0) {
        return <p className="text-sm text-gray-500">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {games.map((game) => (
                <GameMatchup key={game.id} game={game} />
            ))}
        </div>
    );
};

const formatDate = (date) => {
    if (!date) return '—';
    const d = moment(date);
    return d.isValid() ? d.format('DD.MM.YYYY') : date;
};
