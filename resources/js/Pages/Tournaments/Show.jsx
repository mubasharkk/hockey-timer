import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faClock, faPen, faPlus, faTrash, faTrophy, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import moment from 'moment';
import GameMatchup from '@/Components/GameMatchup';
import PoolResults from '@/Components/PoolResults';

export default function Show({ auth, tournament, poolResults = [] }) {
    const [confirming, setConfirming] = useState(false);
    const [tab, setTab] = useState('upcoming');
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(route('tournaments.destroy', tournament.id), {
            onSuccess: () => setConfirming(false),
        });
    };

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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Tournament</p>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">{tournament.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('tournaments.edit', tournament.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                            Edit
                        </Link>
                        <Link
                            href={route('games.create', { tournament_id: tournament.id })}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            New Game
                        </Link>
                        <Link
                            href={route('tournaments.pools.teams.edit', tournament.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                            Assign Teams
                        </Link>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
                            onClick={() => setConfirming(true)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            Delete
                        </button>
                        <Link
                            href={route('tournaments.index')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            Back
                        </Link>
                        <Link
                            href={route('public.tournaments.show', tournament.slug)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-indigo-200 transition hover:bg-indigo-50"
                        >
                            Public view
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={tournament.title} />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    {tournament.logo_url && (
                        <div className="flex justify-center">
                            <img
                                src={tournament.logo_url}
                                alt={`${tournament.title} logo`}
                                className="h-28 w-28 rounded-lg object-contain ring-1 ring-gray-200 bg-white"
                            />
                        </div>
                    )}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Info label="Venue" value={tournament.venue} />
                            <Info
                                label="Dates"
                                value={`${formatDate(tournament.start_date)}${tournament.end_date ? ` → ${formatDate(tournament.end_date)}` : ''}`}
                            />
                            <Info label="Points (W/D/L)" value={`${tournament.win_points}/${tournament.draw_points}/${tournament.loss_points}`} />
                        </div>
                        {tournament.pools && tournament.pools.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">Pools</h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {tournament.pools.map((pool) => (
                                        <div key={pool.id} className="rounded-md border border-gray-100 bg-gray-50 p-3 shadow-sm">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-800">Pool {pool.name}</span>
                                                <span className="text-xs text-gray-500">{(pool.teams || []).length} team(s)</span>
                                            </div>
                                            {(pool.teams || []).length > 0 ? (
                                                <ul className="space-y-1 text-sm text-gray-800">
                                                    {pool.teams.map((team) => (
                                                        <li key={team.id} className="rounded bg-white px-2 py-1">
                                                            {team.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-500">No teams assigned.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {tournament.sponsor_logo_urls && tournament.sponsor_logo_urls.length > 0 && (
                            <div className="mt-6 rounded-md border border-gray-100 bg-gray-50 p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-900">Sponsors</h3>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {tournament.sponsor_logo_urls.map((url, idx) => (
                                        <div key={idx} className="flex h-16 w-24 items-center justify-center rounded-md bg-white ring-1 ring-gray-200">
                                            <img src={url} alt={`Sponsor ${idx + 1}`} className="max-h-14 max-w-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-gray-900">Pool Standings</h3>
                        </div>
                        <PoolResults results={poolResults} />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-indigo-600" />
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

            <Modal show={confirming} onClose={() => setConfirming(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete tournament?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This will delete {tournament.title}. Games linked to it will remain but without a tournament reference.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirming(false)}>Cancel</SecondaryButton>
                        <DangerButton disabled={processing} onClick={handleDelete}>
                            {processing ? 'Deleting...' : 'Delete'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

const Info = ({ label, value }) => (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-900">{value || '—'}</p>
    </div>
);

const formatDate = (date) => {
    if (!date) return '—';
    const d = moment(date);
    return d.isValid() ? d.format('DD.MM.YYYY') : date;
};

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
