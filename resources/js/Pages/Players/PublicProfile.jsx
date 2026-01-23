import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake, faIdCard, faShirt, faTrophy, faFutbol, faFlag, faPhone, faTint, faRunning, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

export default function PublicProfile({ player, teams = [], statistics }) {
    const currentPlayer = player?.data ?? player;
    const playerTeams = Array.isArray(teams) ? teams : teams?.data || [];

    const age = currentPlayer.date_of_birth 
        ? moment().diff(moment(currentPlayer.date_of_birth), 'years')
        : null;

    return (
        <>
            <Head title={`${currentPlayer.name} - Player Profile`} />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Header */}
                <div className="px-4 py-8 text-white" style={{ backgroundColor: '#01411C' }}>
                    <div className="mx-auto max-w-4xl">
                        <div className="flex items-center gap-6">
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
                            <div>
                                <h1 className="text-3xl font-bold">{currentPlayer.name}</h1>
                                {currentPlayer.shirt_number && (
                                    <p className="mt-1 text-xl text-green-200">#{currentPlayer.shirt_number}</p>
                                )}
                                {currentPlayer.player_type_label && (
                                    <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                                        {currentPlayer.player_type_label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Player Info Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Player Information</h2>
                            <div className="space-y-3">
                                {currentPlayer.player_pass_number && (
                                    <InfoRow icon={faIdCard} label="Pass Number" value={currentPlayer.player_pass_number} />
                                )}
                                {currentPlayer.date_of_birth && (
                                    <InfoRow 
                                        icon={faBirthdayCake} 
                                        label="Date of Birth" 
                                        value={`${moment(currentPlayer.date_of_birth).format('DD MMM YYYY')}${age ? ` (${age} years)` : ''}`} 
                                    />
                                )}
                                {currentPlayer.gender && (
                                    <InfoRow icon={faVenusMars} label="Gender" value={currentPlayer.gender === 'male' ? 'Male' : 'Female'} />
                                )}
                                {currentPlayer.blood_group && (
                                    <InfoRow icon={faTint} label="Blood Group" value={currentPlayer.blood_group} />
                                )}
                                {currentPlayer.phone && (
                                    <InfoRow icon={faPhone} label="Phone" value={currentPlayer.phone} />
                                )}
                                <InfoRow 
                                    label="Status" 
                                    value={
                                        currentPlayer.is_active ? (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                                        ) : (
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Inactive</span>
                                        )
                                    } 
                                />
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Statistics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <StatBox icon={faFutbol} label="Goals" value={statistics.goals || 0} color="text-green-600" bg="bg-green-50" />
                                <StatBox icon={faTrophy} label="Games" value={statistics.total_games || 0} color="text-green-700" bg="bg-green-50" />
                                <StatBox icon={faFlag} label="Yellow Cards" value={statistics.yellow_cards || 0} color="text-yellow-600" bg="bg-yellow-50" />
                                <StatBox icon={faFlag} label="Red Cards" value={statistics.red_cards || 0} color="text-red-600" bg="bg-red-50" />
                            </div>
                        </div>

                        {/* Teams Card */}
                        {playerTeams.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Teams</h2>
                                <div className="flex flex-wrap gap-3">
                                    {playerTeams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2"
                                        >
                                            {team.logo_url && (
                                                <img
                                                    src={team.logo_url}
                                                    alt={team.name}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{team.name}</p>
                                                {team.players && team.players[0]?.shirt_number && (
                                                    <p className="text-xs text-gray-500">#{team.players[0].shirt_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-400">
                        Player Profile
                    </div>
                </div>
            </div>
        </>
    );
}

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
        <div className="flex items-center gap-2 text-gray-600">
            {icon && <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">{label}</span>
        </div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
);

const StatBox = ({ icon, label, value, color, bg }) => (
    <div className={`rounded-lg ${bg} p-4 text-center`}>
        {icon && <FontAwesomeIcon icon={icon} className={`mx-auto mb-2 h-5 w-5 ${color}`} />}
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    </div>
);
