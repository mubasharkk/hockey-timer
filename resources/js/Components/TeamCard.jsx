import { Link } from '@inertiajs/react';

export default function TeamCard({ team, showMeta = false, asDiv = false, publicLink = false }) {
    const content = (
        <>
            {team.logo_url ? (
                <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-10 w-10 rounded-md border border-gray-100 object-cover"
                />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 text-green-700 font-semibold">
                    {team.name?.charAt(0) || 'T'}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 block truncate group-hover:text-green-700">
                    {team.name}
                </span>
                {team.club?.name && (
                    <span className="text-xs text-gray-500 block truncate">{team.club.name}</span>
                )}
                {showMeta && (
                    <span className="text-xs text-gray-500">
                        {team.type_label || 'Team'} • {team.players_count ?? 0} players
                    </span>
                )}
            </div>
        </>
    );

    const className = "group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-green-300 hover:bg-green-50";

    if (asDiv) {
        return <div className={className}>{content}</div>;
    }

    const href = publicLink && team.uid
        ? route('teams.public', team.uid)
        : route('teams.show', team.id);

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}
