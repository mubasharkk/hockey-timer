import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import moment from 'moment';

export default function Show({ auth, tournament }) {
    const [confirming, setConfirming] = useState(false);
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(route('tournaments.destroy', tournament.id), {
            onSuccess: () => setConfirming(false),
        });
    };

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
                    </div>
                </div>
            }
        >
            <Head title={tournament.title} />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Info label="Slug" value={tournament.slug} />
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
