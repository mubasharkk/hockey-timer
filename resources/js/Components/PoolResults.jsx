import { useMemo } from 'react';

export default function PoolResults({ results = [] }) {
    const grouped = useMemo(() => {
        const map = {};
        results.forEach((r) => {
            const key = r.pool_id;
            if (!map[key]) {
                map[key] = { pool_id: r.pool_id, pool_name: r.pool_name, rows: [] };
            }
            map[key].rows.push(r);
        });
        return Object.values(map);
    }, [results]);

    if (!results || results.length === 0) {
        return <p className="text-sm text-gray-500">No results yet.</p>;
    }

    return (
        <div className="space-y-4">
            {grouped.map((pool) => (
                <div key={pool.pool_id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <h4 className="text-sm font-semibold text-gray-900">Pool {pool.pool_name}</h4>
                        <span className="text-xs text-gray-500">{pool.rows.length} team(s)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <Th>Team</Th>
                                    <Th align="center">P</Th>
                                    <Th align="center">W</Th>
                                    <Th align="center">D</Th>
                                    <Th align="center">L</Th>
                                    <Th align="center">GF</Th>
                                    <Th align="center">GA</Th>
                                    <Th align="center">GD</Th>
                                    <Th align="center">Pts</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {pool.rows.map((row) => (
                                    <tr key={row.team_id}>
                                        <Td>{row.team_name}</Td>
                                        <Td align="center">{row.played}</Td>
                                        <Td align="center">{row.wins}</Td>
                                        <Td align="center">{row.draws}</Td>
                                        <Td align="center">{row.losses}</Td>
                                        <Td align="center">{row.goals_for}</Td>
                                        <Td align="center">{row.goals_against}</Td>
                                        <Td align="center">{formatGoalDiff(row.goal_diff)}</Td>
                                        <Td align="center" className="font-semibold text-gray-900">
                                            {row.total_points}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

const Th = ({ children, align = 'left' }) => (
    <th className={`px-3 py-2 text-${align} font-semibold uppercase tracking-wide text-gray-600`}>{children}</th>
);

const Td = ({ children, align = 'left', className = '' }) => (
    <td className={`px-3 py-2 text-${align} text-gray-800 ${className}`}>{children}</td>
);

const formatGoalDiff = (value) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num) || num === 0) return '0';
    return num > 0 ? `+${num}` : `${num}`;
};
