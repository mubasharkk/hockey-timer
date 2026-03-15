import { Link } from '@inertiajs/react';

export default function KnockoutBracket({ bracket }) {
    const rounds = bracket?.rounds || [];

    if (!rounds.length) {
        return null;
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex items-stretch gap-2 py-4" style={{ minWidth: rounds.length * 240 }}>
                {rounds.map((round, ri) => (
                    <div key={round.key} className="flex flex-col min-w-[220px]" style={{ justifyContent: 'space-around' }}>
                        <h4 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {round.label}
                        </h4>
                        <div className="flex flex-1 flex-col justify-around" style={{ gap: `${Math.pow(2, ri) * 0.75}rem` }}>
                            {(round.matchups || [])
                                .sort((a, b) => a.position - b.position)
                                .map((matchup) => (
                                    <BracketMatchup key={`${round.key}-${matchup.position}`} matchup={matchup} roundKey={round.key} />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BracketMatchup({ matchup, roundKey }) {
    const homeResolved = !!matchup.home_team_id;
    const awayResolved = !!matchup.away_team_id;
    const hasWinner = !!matchup.winner_team_id;

    return (
        <div className="w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <TeamRow
                teamId={matchup.home_team_id}
                teamName={matchup.home_team_name}
                teamUid={matchup.home_team_uid}
                label={matchup.home_label}
                resolved={homeResolved}
                isWinner={hasWinner && matchup.winner_team_id === matchup.home_team_id}
                isLoser={hasWinner && matchup.winner_team_id !== matchup.home_team_id}
            />
            <div className="border-t border-gray-100" />
            <TeamRow
                teamId={matchup.away_team_id}
                teamName={matchup.away_team_name}
                teamUid={matchup.away_team_uid}
                label={matchup.away_label}
                resolved={awayResolved}
                isWinner={hasWinner && matchup.winner_team_id === matchup.away_team_id}
                isLoser={hasWinner && matchup.winner_team_id !== matchup.away_team_id}
            />
            {matchup.game_id && (
                <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 text-center">
                    <Link
                        href={route('games.report', matchup.game_id)}
                        className="text-[10px] font-semibold text-green-700 hover:text-green-800"
                    >
                        View Report
                    </Link>
                </div>
            )}
        </div>
    );
}

function TeamRow({ teamId, teamName, teamUid, label, resolved, isWinner, isLoser }) {
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
        <div className={`flex items-center gap-2 px-3 py-2 ${bgClass}`}>
            {isWinner && <span className="text-[10px] text-green-600">&#9654;</span>}
            <span className={`truncate text-sm ${textClass}`}>{displayName}</span>
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
