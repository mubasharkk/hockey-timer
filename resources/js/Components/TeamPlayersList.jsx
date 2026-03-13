import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Link, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faPlus, faSearch, faShirt, faTrash, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';

export default function TeamPlayersList({ teamId, players = [], canManage = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirming, setConfirming] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const { delete: destroyPlayer, processing: deleting } = useForm();
    const editForm = useForm({ shirt_number: '', is_active: true });

    const filteredPlayers = useMemo(() => {
        if (!searchQuery) return players;
        const q = searchQuery.toLowerCase();
        return players.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.player_pass_number?.toLowerCase().includes(q) ||
            String(p.pivot?.shirt_number ?? p.shirt_number ?? '').includes(q)
        );
    }, [players, searchQuery]);

    const startEdit = (player) => {
        setEditingId(player.id);
        editForm.setData({
            shirt_number: player.pivot?.shirt_number ?? player.shirt_number ?? '',
            is_active: player.pivot?.is_active ?? true,
        });
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = (playerId) => {
        editForm.put(route('teams.players.update', [teamId, playerId]), {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleRemove = () => {
        if (!confirming) return;
        destroyPlayer(route('teams.players.destroy', [teamId, confirming.id]), {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Players
                    <span className="ml-2 text-sm font-normal text-gray-500">({players.length})</span>
                </h3>
                {canManage && (
                    <Link
                        href={route('teams.players.create', teamId)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                    >
                        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                        Add Player
                    </Link>
                )}
            </div>

            {players.length > 5 && (
                <div className="relative mb-4">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, pass number, or shirt..."
                        className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:ring-green-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {filteredPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 hidden sm:table-cell">Pass</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Player</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Team</th>
                                {canManage && <th className="px-3 py-2 text-right font-semibold text-gray-700">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPlayers.map((player) => {
                                const pivotActive = player.pivot?.is_active ?? true;
                                const shirtNumber = player.pivot?.shirt_number ?? player.shirt_number;
                                const isEditing = editingId === player.id;

                                return (
                                    <tr key={player.id} className={isEditing ? 'bg-green-50/60' : !pivotActive ? 'bg-gray-50/60' : 'hover:bg-gray-50'}>
                                        <td className="px-3 py-2 text-gray-800 w-20">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="99"
                                                    className="w-16 rounded border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-green-500"
                                                    value={editForm.data.shirt_number}
                                                    onChange={(e) => editForm.setData('shirt_number', e.target.value)}
                                                />
                                            ) : shirtNumber ? (
                                                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                                                    <FontAwesomeIcon icon={faShirt} className="h-3 w-3 text-gray-400" />
                                                    #{shirtNumber}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-gray-800">
                                            <div className="flex items-center gap-2">
                                                {player.photo_url ? (
                                                    <img src={player.photo_url} alt={player.name} className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-700">
                                                        {player.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <Link
                                                        href={route('players.show', player.id)}
                                                        className="font-medium text-green-700 hover:text-green-600 truncate block"
                                                    >
                                                        {player.name}
                                                    </Link>
                                                    <span className="text-xs text-gray-500 sm:hidden">{player.player_pass_number || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-xs text-gray-700 hidden sm:table-cell">
                                            {player.player_pass_number || '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {player.is_active ? (
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-green-700">Active</span>
                                            ) : (
                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-red-700">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            {isEditing ? (
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        checked={editForm.data.is_active}
                                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                                    />
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {editForm.data.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </label>
                                            ) : (
                                                pivotActive ? (
                                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-green-700">Active</span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-amber-700">Inactive</span>
                                                )
                                            )}
                                        </td>
                                        {canManage && (
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => saveEdit(player.id)}
                                                                disabled={editForm.processing}
                                                                className="rounded p-1.5 text-green-600 hover:bg-green-100 transition"
                                                                title="Save"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEdit}
                                                                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 transition"
                                                                title="Cancel"
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(player)}
                                                                className="rounded p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                                                                title="Edit"
                                                            >
                                                                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirming(player)}
                                                                className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                                title="Remove from team"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                    <FontAwesomeIcon icon={faUser} className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-900">
                        {searchQuery ? 'No players match your search' : 'No players yet'}
                    </p>
                    {!searchQuery && canManage && (
                        <Link
                            href={route('teams.players.create', teamId)}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                            Add the first player
                        </Link>
                    )}
                </div>
            )}

            <Modal show={!!confirming} onClose={() => setConfirming(null)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Remove player?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {confirming ? `This will remove ${confirming.name} from the team.` : ''}
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirming(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleRemove} disabled={deleting}>
                            {deleting ? 'Removing...' : 'Remove'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
