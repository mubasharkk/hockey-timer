import { Link } from '@inertiajs/react';

export default function BracketTeamRow({
    teamId,
    teamName,
    teamUid,
    teamLogo,
    label,
    score,
    showScore,
    resolved,
    isWinner,
    isLoser,
}) {
    const displayName = teamName || label || 'TBD';

    const bgClass = isWinner
        ? 'bg-green-50'
        : isLoser
            ? 'bg-gray-50'
            : 'bg-white';

    const textClass = isWinner
        ? 'font-bold text-green-800'
        : isLoser
            ? 'text-gray-400'
            : resolved
                ? 'font-semibold text-gray-900'
                : 'italic text-gray-400';

    const content = (
        <div className={`flex items-center justify-between gap-2 px-3 py-2 ${bgClass}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {isWinner && <span className="text-[10px] text-green-600 flex-shrink-0">&#9654;</span>}
                <TeamLogo src={teamLogo} alt={displayName} size="sm" />
                <span className={`truncate text-sm ${textClass}`}>{displayName}</span>
            </div>
            {showScore && score !== null && <span className={`text-sm font-semibold flex-shrink-0 ${textClass}`}>{score}</span>}
        </div>
    );

    if (resolved && teamUid) {
        return (
            <Link target="_blank" href={route('teams.public', teamUid)} className="block hover:bg-gray-50 transition">
                {content}
            </Link>
        );
    }

    return content;
}

function TeamLogo({ src, alt, size = 'md' }) {
    const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';

    if (src) {
        return <img src={src} alt={alt || 'team logo'} className={`${sizeClass} object-contain flex-shrink-0`} />;
    }

    const initial = (alt || 'T')[0]?.toUpperCase() ?? 'T';
    return (
        <div className={`flex ${sizeClass} items-center justify-center text-xs font-semibold text-gray-400 bg-gray-100 rounded flex-shrink-0`}>
            {initial}
        </div>
    );
}
