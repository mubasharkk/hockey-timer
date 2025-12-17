import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function GameTeamSquad({ team, fallbackLabel }) {
    if (!team) {
        return (
            <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                <p className="font-semibold text-gray-700">{fallbackLabel}</p>
                <p>No players listed.</p>
            </div>
        );
    }

    const players = Array.isArray(team.players) ? team.players : team.players?.data || [];

    if (players.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                <p className="font-semibold text-gray-700">{team.name || fallbackLabel}</p>
                <p>No players listed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <p className="font-semibold text-gray-800">{team.name || fallbackLabel}</p>
            <ul className="space-y-1 text-sm text-gray-700">
                {players.map((player) => (
                    <li key={player.id || `${player.name}-${player.shirt_number || 'n'}`} className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                            {player.shirt_number ?? <FontAwesomeIcon icon={faUser} className="h-3 w-3" />}
                        </span>
                        <span>{player.name}</span>
                        {!player.is_active && (
                            <span className="text-[11px] font-semibold uppercase text-amber-600">Inactive</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
