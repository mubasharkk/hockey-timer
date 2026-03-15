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
    const isFinished = matchup.game_status === 'finished';

    return (
        <div className="w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <TeamRow
                teamId={matchup.home_team_id}
                teamName={matchup.home_team_name}
                teamUid={matchup.home_team_uid}
                label={matchup.home_label}
                score={matchup.home_score}
                showScore={isFinished}
                resolved={homeResolved}
                isWinner={hasWinner && matchup.winner_team_id === matchup.home_team_id}
                isLoser={hasWinner && matchup.winner_team_id !== matchup.home_team_id}
            />
            <div className="border-t border-gray-100" />
            {matchup.game_id && matchup.game_started_at && (
                <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 text-center text-[10px] text-gray-600">
                    <div>{new Date(matchup.game_started_at).toLocaleDateString()}</div>
                    <div>{new Date(matchup.game_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    {matchup.game_excerpt && <div className="mt-1 italic text-gray-500">{matchup.game_excerpt}</div>}
                </div>
            )}
            <div className="border-t border-gray-100" />
            <TeamRow
                teamId={matchup.away_team_id}
                teamName={matchup.away_team_name}
                teamUid={matchup.away_team_uid}
                label={matchup.away_label}
                score={matchup.away_score}
                showScore={isFinished}
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

function TeamRow({ teamId, teamName, teamUid, label, score, showScore, resolved, isWinner, isLoser }) {
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
