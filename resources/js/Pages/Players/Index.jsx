import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faIdCard, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Index({ auth, players }) {
    const playerList = players?.data ?? [];
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPlayers = playerList.filter(player => {
        const query = searchQuery.toLowerCase();
        return (
            player.name?.toLowerCase().includes(query) ||
            player.player_pass_number?.toLowerCase().includes(query) ||
            player.nic_number?.toLowerCase().includes(query)
        );
    });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Players" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
                            <p className="text-sm text-gray-600">Manage all players in the system</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('players.scan')}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                            >
                                <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                                Scan ID
                            </Link>
                            <Link
                                href={route('players.create')}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                Add Player
                            </Link>
                        </div>
                    </header>

                    {/* Search */}
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by name, pass number, or NIC..."
                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:ring-green-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Players Grid */}
                    {filteredPlayers.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPlayers.map((player) => (
                                <Link
                                    key={player.id}
                                    href={route('players.show', player.id)}
                                    className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        {player.photo_url ? (
                                            <img
                                                src={player.photo_url}
                                                alt={player.name}
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 text-lg font-semibold">
                                                {player.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-green-700">
                                                {player.name}
                                            </p>
                                            {player.player_pass_number && (
                                                <p className="text-xs text-gray-500">
                                                    Pass: {player.player_pass_number}
                                                </p>
                                            )}
                                            {player.nic_number && (
                                                <p className="text-xs text-gray-500">
                                                    NIC: {player.nic_number}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            player.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {player.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                            <FontAwesomeIcon icon={faUser} className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No players found</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {searchQuery
                                    ? 'Try a different search term'
                                    : 'Get started by adding your first player'}
                            </p>
                            {!searchQuery && (
                                <div className="mt-6 flex justify-center gap-3">
                                    <Link
                                        href={route('players.scan')}
                                        className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                                        Scan ID
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {players?.links && players.links.length > 3 && (
                        <div className="flex justify-center gap-2">
                            {players.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-green-700 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
