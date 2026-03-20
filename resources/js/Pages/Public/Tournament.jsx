import PublicLayout from '@/Layouts/PublicLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TeamLogo from '@/Components/TeamLogo';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import moment from 'moment';
import GameMatchup from '@/Components/GameMatchup';
import PoolResults from '@/Components/PoolResults';
import TopScorers from '@/Components/TopScorers';
import KnockoutBracket from '@/Components/KnockoutBracket';

export default function Tournament({ tournament, poolResults = [], topScorers = [] }) {
    const currentTournament = tournament?.data ?? tournament;
    const [tab, setTab] = useState('upcoming');
    const [poolsOpen, setPoolsOpen] = useState(false);

    const upcomingGames = useMemo(() => {
        return (currentTournament.games || []).filter((g) => {
            if (!g.game_date) return false;
            const date = moment(g.game_date).startOf('day');
            return date.isSameOrAfter(moment().startOf('day'));
        });
    }, [currentTournament.games]);

    const resultGames = useMemo(() => {
        return (currentTournament.games || []).filter((g) => {
            if (!g.game_date) return true;
            const date = moment(g.game_date).startOf('day');
            return g.status === 'finished' || date.isBefore(moment().startOf('day'));
        });
    }, [currentTournament.games]);

    return (
        <PublicLayout fullWidth>
            <Head>
                <title>{currentTournament.title}</title>
                <meta name="description" content={currentTournament.venue || `Tournament: ${currentTournament.title}`} />
                <meta property="og:title" content={currentTournament.title} />
                <meta property="og:description" content={currentTournament.venue || `Tournament: ${currentTournament.title}`} />
                {currentTournament.logo_url ? (
                    <meta property="og:image" content={currentTournament.logo_url} />
                ) : (
                    <meta property="og:image" content="/icons/logo.png" />
                )}
            </Head>
            <div className="px-0 sm:px-[calc(50vw-50%)]">
                <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
                    {/* Logos - App and Tournament side by side */}
                    <div className="grid grid-cols-2 items-center justify-center gap-8">
                        {/* App Logo - Left */}
                        <div className="flex justify-end">
                            <Link href="/" className="flex items-center gap-2">
                                <ApplicationLogo className="h-48 fill-current text-green-700" />
                            </Link>
                        </div>
                        {/* Tournament Logo - Right */}
                        <div className="flex justify-start">
                            <TeamLogo
                                src={currentTournament.logo_url}
                                alt={`${currentTournament.title} logo`}
                                height="h-48"
                                width="w-auto"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Tournament</p>
                                <h1 className="text-2xl font-semibold text-gray-900">{currentTournament.title}</h1>
                                <p className="text-sm text-gray-600">{currentTournament.venue}</p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(currentTournament.start_date)}
                                    {currentTournament.end_date ? ` → ${formatDate(currentTournament.end_date)}` : ''}
                                </p>
                            </div>
                        </div>
                        {currentTournament.sponsor_logo_urls && currentTournament.sponsor_logo_urls.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900">Sponsors</h3>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {currentTournament.sponsor_logo_urls.map((url, idx) => (
                                        <div key={idx} className="flex h-14 w-20 items-center justify-center rounded-md bg-white ring-1 ring-gray-200">
                                            <img src={url} alt={`Sponsor ${idx + 1}`} className="max-h-12 max-w-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-6 py-4 text-left"
                            onClick={() => setPoolsOpen((v) => !v)}
                        >
                            <h3 className="text-md font-semibold text-gray-900">Pool Standings</h3>
                            <FontAwesomeIcon icon={poolsOpen ? faChevronUp : faChevronDown} className="h-4 w-4 text-gray-400" />
                        </button>
                        {poolsOpen && (
                            <div className="px-6 pb-6">
                                <PoolResults results={poolResults} />
                            </div>
                        )}
                    </div>

                    {currentTournament.knockout_bracket?.rounds?.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">Knockout Bracket</h3>
                            <KnockoutBracket bracket={currentTournament.knockout_bracket} />
                        </div>
                    )}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-gray-900">Games</h3>
                            </div>
                            <div className="flex overflow-hidden rounded-md border border-gray-200 text-sm font-semibold">
                                <button
                                    className={`px-4 py-1.5 ${tab === 'upcoming' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700'}`}
                                    onClick={() => setTab('upcoming')}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className={`px-4 py-1.5 ${tab === 'results' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700'}`}
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

                    <TopScorers scorers={topScorers} />

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
