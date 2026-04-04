import { Link } from '@inertiajs/react';
import BracketTeamRow from './BracketTeamRow';

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
            <BracketTeamRow
                teamId={matchup.home_team_id}
                teamName={matchup.home_team_name}
                teamUid={matchup.home_team_uid}
                teamLogo={matchup.home_team_logo}
                label={matchup.home_label}
                score={matchup.home_score}
                shootout={matchup.home_shootout}
                showScore={isFinished}
                resolved={homeResolved}
                isWinner={hasWinner && matchup.winner_team_id === matchup.home_team_id}
                isLoser={hasWinner && matchup.winner_team_id !== matchup.home_team_id}
            />
            <div className="border-t border-gray-100" />
            <BracketTeamRow
                teamId={matchup.away_team_id}
                teamName={matchup.away_team_name}
                teamUid={matchup.away_team_uid}
                teamLogo={matchup.away_team_logo}
                label={matchup.away_label}
                score={matchup.away_score}
                shootout={matchup.away_shootout}
                showScore={isFinished}
                resolved={awayResolved}
                isWinner={hasWinner && matchup.winner_team_id === matchup.away_team_id}
                isLoser={hasWinner && matchup.winner_team_id !== matchup.away_team_id}
            />
            {matchup.game_id && (
                <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 text-center">
                    {matchup.game_started_at && (
                        <div className="mb-1 text-[10px] text-gray-500">
                            <span>{new Date(matchup.game_started_at).toLocaleDateString()}</span>
                            {' · '}
                            <span>{new Date(matchup.game_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                    {matchup.game_excerpt && (
                        <div className="mb-1 text-[10px] italic text-gray-500">{matchup.game_excerpt}</div>
                    )}
                    <Link
                        href={isFinished ? route('games.report', matchup.game_id) : route('games.summary', matchup.game_id)}
                        className="text-[10px] font-semibold text-green-700 hover:text-green-800"
                    >
                        {isFinished ? 'View Report' : 'View Summary'}
                    </Link>
                </div>
            )}
        </div>
    );
}

