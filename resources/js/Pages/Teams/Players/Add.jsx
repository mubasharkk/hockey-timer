import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch, faUser, faPlus, faSpinner, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

export default function Add({ auth, team }) {
    const currentTeam = team?.data ?? team;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        player_id: '',
        shirt_number: '',
    });

    const performSearch = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    route('teams.players.search', currentTeam.id) + `?q=${encodeURIComponent(query)}`
                );
                const results = await response.json();
                setSearchResults(results);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        [currentTeam.id]
    );

    useEffect(() => {
        performSearch(searchQuery);
    }, [searchQuery, performSearch]);

    const selectPlayer = (player) => {
        setSelectedPlayer(player);
        setData('player_id', player.id);
        setSearchQuery('');
        setSearchResults([]);
    };

    const clearSelection = () => {
        setSelectedPlayer(null);
        setData('player_id', '');
        reset('shirt_number');
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('teams.players.store', currentTeam.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Add Player to ${currentTeam.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    <header className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                {currentTeam.name}
                            </p>
                            <h1 className="text-2xl font-semibold text-gray-900">Add Player to Team</h1>
                        </div>
                        <Link
                            href={route('teams.show', currentTeam.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            Back
                        </Link>
                    </header>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Selected Player */}
                            {selectedPlayer ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {selectedPlayer.photo_url ? (
                                                <img
                                                    src={selectedPlayer.photo_url}
                                                    alt={selectedPlayer.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200 text-green-700 font-semibold">
                                                    {selectedPlayer.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedPlayer.name}</p>
                                                {selectedPlayer.player_pass_number && (
                                                    <p className="text-xs text-gray-500">
                                                        Pass: {selectedPlayer.player_pass_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Search Players */
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Search Player
                                    </label>
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={isSearching ? faSpinner : faSearch}
                                            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                                                isSearching ? 'animate-spin' : ''
                                            }`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search by name, pass number, or NIC..."
                                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:ring-green-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {searchResults.map((player) => (
                                                <button
                                                    key={player.id}
                                                    type="button"
                                                    onClick={() => selectPlayer(player)}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                                >
                                                    {player.photo_url ? (
                                                        <img
                                                            src={player.photo_url}
                                                            alt={player.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold">
                                                            {player.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{player.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {player.player_pass_number && `Pass: ${player.player_pass_number}`}
                                                            {player.nic_number && ` | NIC: ${player.nic_number}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            No players found. 
                                            <Link
                                                href={route('players.create')}
                                                className="ml-1 text-green-600 hover:text-green-700"
                                            >
                                                Create new player
                                            </Link>
                                        </p>
                                    )}

                                    {errors.player_id && (
                                        <p className="text-sm text-red-600">{errors.player_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Shirt Number */}
                            {selectedPlayer && (
                                <div className="space-y-2">
                                    <label htmlFor="shirt_number" className="block text-sm font-medium text-gray-700">
                                        Shirt Number (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        id="shirt_number"
                                        min="1"
                                        max="99"
                                        className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                        value={data.shirt_number}
                                        onChange={(e) => setData('shirt_number', e.target.value)}
                                        placeholder="e.g., 10"
                                    />
                                    {errors.shirt_number && (
                                        <p className="text-sm text-red-600">{errors.shirt_number}</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <Link
                                    href={route('players.scan')}
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                                    Create new player via ID scan
                                </Link>

                                <button
                                    type="submit"
                                    disabled={!selectedPlayer || processing}
                                    className="inline-flex items-center gap-2 rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                                >
                                    {processing ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                            Add to Team
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
