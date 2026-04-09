import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function SquadManager({ team, onSaved }) {
    const [rows, setRows]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState(null);
    const [adding, setAdding]     = useState(false);

    // Add mode: 'create' | 'existing'
    const [addMode, setAddMode]   = useState('create');

    // Create new
    const [newName, setNewName]   = useState('');
    const [newShirt, setNewShirt] = useState('');

    // Add existing
    const [searchQ, setSearchQ]         = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching]     = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [existingShirt, setExistingShirt]   = useState('');
    const searchTimer = useRef(null);

    useEffect(() => {
        if (!team?.id) return;
        setLoading(true);
        setError(null);
        axios.get(route('teams.squad', team.id))
            .then((res) => setRows(res.data.players))
            .catch(() => setError('Failed to load squad.'))
            .finally(() => setLoading(false));
    }, [team?.id]);

    const toggle = (id) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, is_active: !r.is_active, shirt_number: r.is_active ? null : r.shirt_number }
                    : r,
            ),
        );
    };

    const setShirt = (id, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, shirt_number: value === '' ? null : parseInt(value, 10) || null } : r,
            ),
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await axios.put(route('teams.squad.update', team.id), {
                players: rows.map((r) => ({
                    player_id:    r.id,
                    shirt_number: r.shirt_number ?? null,
                    is_active:    r.is_active,
                })),
            });
            onSaved?.();
        } catch {
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNew = async () => {
        if (!newName.trim()) return;
        setAdding(true);
        setError(null);
        try {
            const res = await axios.post(route('teams.squad.player.store', team.id), {
                name:         newName.trim(),
                shirt_number: newShirt ? parseInt(newShirt, 10) || null : null,
            });
            setRows((prev) => [...prev, res.data]);
            setNewName('');
            setNewShirt('');
        } catch {
            setError('Failed to add player.');
        } finally {
            setAdding(false);
        }
    };

    const handleSearch = (q) => {
        setSearchQ(q);
        setSelectedPlayer(null);
        clearTimeout(searchTimer.current);
        if (q.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        searchTimer.current = setTimeout(async () => {
            try {
                const res = await axios.get(route('teams.players.search', team.id), { params: { q } });
                setSearchResults(res.data?.data ?? res.data ?? []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleAttachExisting = async () => {
        if (!selectedPlayer) return;
        setAdding(true);
        setError(null);
        try {
            const res = await axios.post(route('teams.squad.player.attach', team.id), {
                player_id:    selectedPlayer.id,
                shirt_number: existingShirt ? parseInt(existingShirt, 10) || null : null,
            });
            setRows((prev) => [...prev, res.data]);
            setSearchQ('');
            setSearchResults([]);
            setSelectedPlayer(null);
            setExistingShirt('');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to add player.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return <p className="py-6 text-center text-sm text-gray-500">Loading squad…</p>;
    }

    const active   = rows.filter((r) => r.is_active);
    const inactive = rows.filter((r) => !r.is_active);

    return (
        <div className="space-y-4">
            {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                            <th className="w-10 px-3 py-2 text-center">Active</th>
                            <th className="w-16 px-3 py-2 text-center">#</th>
                            <th className="px-3 py-2 text-left">Player</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[...active, ...inactive].map((row) => (
                            <tr
                                key={row.id}
                                className={row.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}
                            >
                                <td className="px-3 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={row.is_active}
                                        onChange={() => toggle(row.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={row.shirt_number ?? ''}
                                        onChange={(e) => setShirt(row.id, e.target.value)}
                                        disabled={!row.is_active}
                                        placeholder="—"
                                        className="w-14 rounded border border-gray-300 px-1.5 py-1 text-center text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                </td>
                                <td className="px-3 py-2 text-gray-800">{row.name}</td>
                            </tr>
                        ))}

                        {/* Add player row */}
                        <tr className="bg-green-50">
                            <td colSpan={3} className="px-3 py-2">
                                {/* Mode toggle */}
                                <div className="mb-2 flex overflow-hidden rounded border border-gray-200 text-xs font-semibold w-fit">
                                    <button
                                        className={`px-3 py-1 ${addMode === 'create' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        onClick={() => setAddMode('create')}
                                    >
                                        Create new
                                    </button>
                                    <button
                                        className={`px-3 py-1 ${addMode === 'existing' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        onClick={() => setAddMode('existing')}
                                    >
                                        Add existing
                                    </button>
                                </div>

                                {addMode === 'create' ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1" max="999"
                                            value={newShirt}
                                            onChange={(e) => setNewShirt(e.target.value)}
                                            placeholder="#"
                                            className="w-14 rounded border border-gray-300 px-1.5 py-1 text-center text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                                            placeholder="Player name"
                                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        />
                                        <button
                                            onClick={handleAddNew}
                                            disabled={adding || !newName.trim()}
                                            className="rounded bg-green-700 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {adding ? '…' : 'Add'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={selectedPlayer ? selectedPlayer.name : searchQ}
                                                onChange={(e) => { setSelectedPlayer(null); handleSearch(e.target.value); }}
                                                placeholder="Search by name or pass number…"
                                                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            />
                                            {searching && (
                                                <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">searching…</span>
                                            )}
                                            {searchResults.length > 0 && !selectedPlayer && (
                                                <ul className="absolute z-10 mt-0.5 w-full rounded border border-gray-200 bg-white shadow-lg">
                                                    {searchResults.map((p) => (
                                                        <li
                                                            key={p.id}
                                                            className="cursor-pointer px-3 py-1.5 text-xs hover:bg-green-50"
                                                            onClick={() => { setSelectedPlayer(p); setSearchResults([]); }}
                                                        >
                                                            <span className="font-semibold">{p.name}</span>
                                                            {p.player_pass_number && <span className="ml-1 text-gray-400">· {p.player_pass_number}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {selectedPlayer && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-600 flex-1">
                                                    Selected: <span className="font-semibold text-gray-900">{selectedPlayer.name}</span>
                                                </span>
                                                <input
                                                    type="number"
                                                    min="1" max="999"
                                                    value={existingShirt}
                                                    onChange={(e) => setExistingShirt(e.target.value)}
                                                    placeholder="#"
                                                    className="w-14 rounded border border-gray-300 px-1.5 py-1 text-center text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                />
                                                <button
                                                    onClick={handleAttachExisting}
                                                    disabled={adding}
                                                    className="rounded bg-green-700 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                                                >
                                                    {adding ? '…' : 'Add'}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedPlayer(null); setSearchQ(''); }}
                                                    className="text-xs text-gray-400 hover:text-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{active.length} active · {inactive.length} inactive</span>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-50"
                >
                    {saving ? 'Saving…' : 'Save Squad'}
                </button>
            </div>
        </div>
    );
}
