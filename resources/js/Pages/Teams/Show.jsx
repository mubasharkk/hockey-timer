import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Show({ auth, team }) {
    const currentTeam = team?.data ?? team;
    const [confirming, setConfirming] = useState(null);
    const [confirmingTeamDelete, setConfirmingTeamDelete] = useState(false);
    const { delete: deletePlayer, processing: deletingPlayer } = useForm();
    const { delete: deleteTeam, processing: deletingTeam } = useForm();
    const players = Array.isArray(currentTeam?.players) ? currentTeam.players : currentTeam?.players?.data || [];

    const canManage = currentTeam?.user_id === auth?.user?.id;

    const confirmRemove = (player) => setConfirming(player);
    const closeModal = () => setConfirming(null);
    const handleDelete = () => {
        if (!confirming) return;
        deletePlayer(route('teams.players.destroy', [currentTeam.id, confirming.id]), {
            onFinish: closeModal,
        });
    };

    const handleTeamDelete = () => {
        deleteTeam(route('teams.destroy', currentTeam.id), {
            onFinish: () => setConfirmingTeamDelete(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {currentTeam?.logo_url && (
                            <img
                                src={currentTeam.logo_url}
                                alt={`${currentTeam.name} logo`}
                                className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                            />
                        )}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Team</p>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{currentTeam.name}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {canManage && (
                            <Link
                                href={route('teams.players.create', currentTeam.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                Add Player
                            </Link>
                        )}
                        {canManage && (
                            <Link
                                href={route('teams.edit', currentTeam.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                            >
                                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                                Edit Team
                            </Link>
                        )}
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setConfirmingTeamDelete(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                Delete
                            </button>
                        )}
                        <Link
                            href={route('teams.index')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={currentTeam.name} />

            <div className="py-10">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Info label="Coach" value={currentTeam.coach || '—'} />
                            <Info label="Manager" value={currentTeam.manager || '—'} />
                            <Info label="Players" value={`${players.length}`} />
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Players</h3>
                                    {canManage && (
                                        <Link
                                            href={route('teams.players.create', currentTeam.id)}
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                                    Add Player
                                </Link>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Pass</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                        {canManage && <th className="px-3 py-2 text-right font-semibold text-gray-700">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {players.map((player) => (
                                        <tr key={player.id}>
                                            <td className="px-3 py-2 text-gray-800">{player.shirt_number ?? '—'}</td>
                                            <td className="px-3 py-2 text-gray-800">{player.name}</td>
                                            <td className="px-3 py-2 font-mono text-xs text-gray-700">{player.player_pass_number}</td>
                                            <td className="px-3 py-2">
                                                {player.is_active ? (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold uppercase text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase text-amber-700">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            {canManage && (
                                                <td className="px-3 py-2 text-right text-sm font-semibold">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('teams.players.edit', [currentTeam.id, player.id])}
                                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-500"
                                                            onClick={() => confirmRemove(player)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {players.length === 0 && (
                                        <tr>
                                            <td className="px-3 py-3 text-sm text-gray-500" colSpan={canManage ? 5 : 4}>
                                                No players yet. Add the first player.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={!!confirming} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Remove player?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {confirming ? `This will remove ${confirming.name} from ${currentTeam.name}.` : ''}
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={deletingPlayer}>
                            {deletingPlayer ? 'Removing...' : 'Remove'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
            <Modal show={confirmingTeamDelete} onClose={() => setConfirmingTeamDelete(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete this team?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This removes the team and its players. Games and tournaments referencing it will keep their own
                        records but the registered team will be gone.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingTeamDelete(false)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleTeamDelete} disabled={deletingTeam}>
                            {deletingTeam ? 'Deleting...' : 'Delete team'}
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
        <p className="mt-1 text-sm text-gray-900">{value}</p>
    </div>
);
