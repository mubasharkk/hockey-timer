import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faUser, faPen, faTrash, faShirt } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Index({ auth, team, players }) {
    const currentTeam = team?.data ?? team;
    const playerList = players?.data ?? players ?? [];
    const [editingPlayer, setEditingPlayer] = useState(null);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${currentTeam.name} - Roster`} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {currentTeam.logo_url ? (
                                <img
                                    src={currentTeam.logo_url}
                                    alt={currentTeam.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 font-semibold text-green-700">
                                    {currentTeam.name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Team Roster</p>
                                <h1 className="text-2xl font-semibold text-gray-900">{currentTeam.name}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('teams.players.create', currentTeam.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                Add Player
                            </Link>
                            <Link
                                href={route('teams.show', currentTeam.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                                Back to Team
                            </Link>
                        </div>
                    </header>

                    {/* Players List */}
                    {playerList.length > 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Shirt #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Pass Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {playerList.map((player) => (
                                        <PlayerRow
                                            key={player.id}
                                            player={player}
                                            team={currentTeam}
                                            isEditing={editingPlayer === player.id}
                                            onEdit={() => setEditingPlayer(player.id)}
                                            onCancel={() => setEditingPlayer(null)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                            <FontAwesomeIcon icon={faUser} className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No players in roster</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Add existing players to this team's roster
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('teams.players.create', currentTeam.id)}
                                    className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                    Add Player
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PlayerRow({ player, team, isEditing, onEdit, onCancel }) {
    const { data, setData, put, delete: destroy, processing } = useForm({
        shirt_number: player.pivot?.shirt_number || '',
        is_active: player.pivot?.is_active ?? true,
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('teams.players.update', [team.id, player.id]), {
            onSuccess: () => onCancel(),
        });
    };

    const handleRemove = () => {
        if (confirm('Remove this player from the team?')) {
            destroy(route('teams.players.destroy', [team.id, player.id]));
        }
    };

    if (isEditing) {
        return (
            <tr className="bg-green-50">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {player.photo_url ? (
                            <img src={player.photo_url} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                                {player.name?.charAt(0)}
                            </div>
                        )}
                        <span className="font-medium text-gray-900">{player.name}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <input
                        type="number"
                        min="1"
                        max="99"
                        className="w-20 rounded border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                        value={data.shirt_number}
                        onChange={(e) => setData('shirt_number', e.target.value)}
                    />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{player.player_pass_number || '-'}</td>
                <td className="px-6 py-4">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">Active</span>
                    </label>
                </td>
                <td className="px-6 py-4 text-right">
                    <button
                        onClick={handleUpdate}
                        disabled={processing}
                        className="mr-2 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <Link href={route('players.show', player.id)} className="flex items-center gap-3 group">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                            {player.name?.charAt(0)}
                        </div>
                    )}
                    <span className="font-medium text-gray-900 group-hover:text-green-700">{player.name}</span>
                </Link>
            </td>
            <td className="px-6 py-4">
                {player.pivot?.shirt_number ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                        <FontAwesomeIcon icon={faShirt} className="h-3 w-3 text-gray-400" />
                        #{player.pivot.shirt_number}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{player.player_pass_number || '-'}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    player.pivot?.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                    {player.pivot?.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={onEdit}
                    className="mr-2 text-gray-400 hover:text-green-600"
                    title="Edit"
                >
                    <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                </button>
                <button
                    onClick={handleRemove}
                    className="text-gray-400 hover:text-red-600"
                    title="Remove from team"
                >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </button>
            </td>
        </tr>
    );
}
