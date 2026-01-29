import { Link } from '@inertiajs/react';

const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PlayerCard({ player }) {
    const age = calculateAge(player.date_of_birth);

    return (
        <Link
            href={route('players.show', player.id)}
            className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-300 hover:shadow-md"
        >
            <div className="flex items-start gap-4">
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={player.name}
                        className="h-14 w-14 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700">
                        {player.name?.charAt(0) || '?'}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-gray-900 group-hover:text-green-700">
                            {player.name}
                        </p>
                        <span
                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                player.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {player.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                        {player.player_pass_number && (
                            <p>Pass: {player.player_pass_number}</p>
                        )}
                        {player.nic_number && <p>NIC: {player.nic_number}</p>}
                        {player.date_of_birth && (
                            <p>
                                DOB: {formatDate(player.date_of_birth)}
                                {age !== null && (
                                    <span className="ml-1 text-gray-400">({age} yrs)</span>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
