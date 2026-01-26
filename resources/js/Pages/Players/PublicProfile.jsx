import { Head } from '@inertiajs/react';
import TeamCard from '@/Components/TeamCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFutbol, faFlag, faUser, faUserShield, faLocationDot, faIdCard } from '@fortawesome/free-solid-svg-icons';

export default function PublicProfile({ player, teams = [], statistics }) {
    const currentPlayer = player?.data ?? player;
    const playerTeams = Array.isArray(teams) ? teams : teams?.data || [];
    const contactPersons = currentPlayer.contact_persons || [];
    const address = currentPlayer.addresses?.[0] || currentPlayer.address;
    const guardian = contactPersons.find(c => c.role?.toLowerCase().includes('guardian')) || contactPersons[0];

    return (
        <>
            <Head title={`${currentPlayer.name} - Player Profile`} />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Header */}
                <div className="px-4 py-8 text-white" style={{ backgroundColor: '#01411C' }}>
                    <div className="mx-auto max-w-4xl">
                        <div className="flex items-center gap-6">
                            {/* Column 1: Photo - shrink left */}
                            <div className="flex-shrink-0">
                                {currentPlayer.photo_url ? (
                                    <img
                                        src={currentPlayer.photo_url}
                                        alt={currentPlayer.name}
                                        className="h-24 w-24 rounded-full border-4 border-white/30 object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 text-3xl font-bold shadow-lg" style={{ backgroundColor: '#026B2E' }}>
                                        {currentPlayer.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Name + Type - expanded */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl font-bold truncate">{currentPlayer.name}</h1>
                                {currentPlayer.player_type_label && (
                                    <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                                        {currentPlayer.player_type_label}
                                    </span>
                                )}
                            </div>

                            {/* Column 3: Shirt Number - shrink right */}
                            <div className="flex-shrink-0 text-right">
                                <span className="font-bold text-white/90" style={{ fontSize: '48px' }}>
                                    # {currentPlayer.shirt_number}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-4xl px-4 py-6">
                    {/* Basic Info */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-500">
                                    <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                                    Name
                                </span>
                                <p className="font-medium text-gray-900">{currentPlayer.name}</p>
                            </div>
                            {guardian && (
                                <div>
                                    <span className="flex items-center gap-1.5 text-gray-500">
                                        <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
                                        Guardian
                                    </span>
                                    <p className="font-medium text-gray-900">{guardian.name}</p>
                                </div>
                            )}
                            {(address?.city || address?.country) && (
                                <div>
                                    <span className="flex items-center gap-1.5 text-gray-500">
                                        <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                        Location
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {[address?.city, address?.country].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                            {currentPlayer.player_pass_number && (
                                <div>
                                    <span className="flex items-center gap-1.5 text-gray-500">
                                        <FontAwesomeIcon icon={faIdCard} className="h-3 w-3" />
                                        Pass Number
                                    </span>
                                    <p className="font-medium text-gray-900">{currentPlayer.player_pass_number}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics - Compact inline */}
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                        <StatItem icon={faFutbol} label="Goals" value={statistics.goals || 0} color="text-green-600" />
                        <StatItem icon={faTrophy} label="Games" value={statistics.total_games || 0} color="text-green-700" />
                        <StatItem icon={faFlag} label="Yellow" value={statistics.yellow_cards || 0} color="text-yellow-600" />
                        <StatItem icon={faFlag} label="Red" value={statistics.red_cards || 0} color="text-red-600" />
                    </div>

                    {/* Teams Card */}
                    {playerTeams.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Teams</h2>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {playerTeams.map((team) => (
                                    <TeamCard key={team.id} team={team} asDiv />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Player Profile
                    </div>
                </div>
            </div>
        </>
    );
}

const StatItem = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${color}`} />}
        <span className="text-xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-500">{label}</span>
    </div>
);
