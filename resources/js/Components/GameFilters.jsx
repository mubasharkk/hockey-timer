/**
 * GameFilters — reusable filter bar for tournament / sport type / game type.
 *
 * Props:
 *   filters        { tournament_id, sport_type, game_type }
 *   onFilterChange (key, value) => void
 *   onClear        () => void
 *   tournaments    [{ id, title }]
 *   sportTypes     { key: label }
 *   gameTypes      { key: label }
 *   showTournament boolean (default true) — hide on tournament-scoped pages
 */
export default function GameFilters({
    filters = {},
    onFilterChange,
    onClear,
    tournaments = [],
    sportTypes = {},
    gameTypes = {},
    showTournament = true,
}) {
    const hasActive = Object.values(filters).some(Boolean);

    const selectClass =
        'rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500';

    return (
        <div className="flex flex-wrap items-center gap-2">
            {showTournament && tournaments.length > 0 && (
                <select
                    value={filters.tournament_id ?? ''}
                    onChange={(e) => onFilterChange('tournament_id', e.target.value)}
                    className={selectClass}
                >
                    <option value="">All Tournaments</option>
                    {tournaments.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                            {t.title}
                        </option>
                    ))}
                </select>
            )}

            {Object.keys(sportTypes).length > 0 && (
                <select
                    value={filters.sport_type ?? ''}
                    onChange={(e) => onFilterChange('sport_type', e.target.value)}
                    className={selectClass}
                >
                    <option value="">All Sports</option>
                    {Object.entries(sportTypes).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            )}

            {Object.keys(gameTypes).length > 0 && (
                <select
                    value={filters.game_type ?? ''}
                    onChange={(e) => onFilterChange('game_type', e.target.value)}
                    className={selectClass}
                >
                    <option value="">All Types</option>
                    {Object.entries(gameTypes).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            )}

            {hasActive && (
                <button
                    onClick={onClear}
                    className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
                >
                    Clear
                </button>
            )}
        </div>
    );
}
