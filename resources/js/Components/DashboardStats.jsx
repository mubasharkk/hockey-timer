import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUsers, faUserGroup, faUserCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DashboardStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-center py-4">
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin text-green-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
                <p className="text-xs text-red-600">Failed to load statistics</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <StatCard
                    icon={faBuilding}
                    label="Clubs"
                    value={stats.clubs}
                    href={route('clubs.index')}
                    color="text-blue-600"
                />
                <StatCard
                    icon={faUsers}
                    label="Teams"
                    value={stats.teams}
                    href={route('teams.index')}
                    color="text-green-600"
                />
                <StatCard
                    icon={faUserGroup}
                    label="Players"
                    value={stats.players}
                    href={route('players.index')}
                    color="text-purple-600"
                />
                <StatCard
                    icon={faUserCheck}
                    label="Active"
                    value={stats.active_players}
                    href={route('players.index')}
                    color="text-emerald-600"
                />
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value, href, color }) => (
    <Link
        href={href}
        className="group flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-50"
    >
        <FontAwesomeIcon icon={icon} className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-lg font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-500 group-hover:text-green-700">{label}</span>
    </Link>
);
