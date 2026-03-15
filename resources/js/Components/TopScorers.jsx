import React from 'react';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

export default function TopScorers({ scorers = [] }) {
    if (!scorers || scorers.length === 0) {
        return <p className="text-sm text-gray-500">No scorers yet.</p>;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm px-5">
            <div className="mb-4 flex items-center gap-3 pt-5">
                <FontAwesomeIcon icon={faMedal} className="h-4 w-4 text-green-700" />
                <h3 className="text-sm font-semibold text-gray-900">Top Goal Scorers</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <Th>#</Th>
                            <Th>Player</Th>
                            <Th>Team</Th>
                            <Th align="center">Goals</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {scorers.map((row, idx) => (
                            <tr key={`${row.team_id}-${row.player_shirt_number}-${idx}`}>
                                <Td>{idx + 1}</Td>
                                <Td>
                                    <div className="flex flex-col">
                                        {row.player_id ? (
                                            <a
                                                href={route('players.public', row.player_id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-green-700 hover:text-green-800 hover:underline"
                                            >
                                                {row.player_name || 'Player'}
                                            </a>
                                        ) : (
                                            <span className="font-semibold text-gray-900">{row.player_name || 'Player'}</span>
                                        )}
                                        {row.player_shirt_number != null && (
                                            <span className="text-xs text-gray-500">#{row.player_shirt_number}</span>
                                        )}
                                    </div>
                                </Td>
                                <Td>{row.team_name || 'Team'}</Td>
                                <Td align="center" className="font-semibold text-gray-900">
                                    {row.goals}
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const Th = ({ children, align = 'left' }) => (
    <th className={`px-3 py-2 text-${align} font-semibold uppercase tracking-wide text-gray-600`}>{children}</th>
);

const Td = ({ children, align = 'left', className = '' }) => (
    <td className={`px-3 py-2 text-${align} text-gray-800 ${className}`}>{children}</td>
);
