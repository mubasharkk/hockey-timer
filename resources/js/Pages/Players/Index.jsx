import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faIdCard, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import PlayerCard from '@/Components/PlayerCard';

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
                    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
                            <p className="text-sm text-gray-600">Manage all players in the system</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href={route('players.scan')}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 sm:px-4 sm:py-2"
                                title="Scan ID"
                            >
                                <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                                <span className="hidden sm:inline">Scan ID</span>
                            </Link>
                            <Link
                                href={route('players.create')}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 sm:px-4 sm:py-2"
                                title="Add Player"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Player</span>
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
                                <PlayerCard key={player.id} player={player} />
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
