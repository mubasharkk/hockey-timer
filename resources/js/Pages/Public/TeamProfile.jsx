import { Head, Link } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrophy, faFutbol, faFlag, faUserShield, faUsers, faEnvelope,
    faPhone, faGlobe, faIdCard, faTshirt, faCircleCheck, faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import ApplicationLogo from '@/Components/ApplicationLogo.jsx';

export default function TeamProfile({ team }) {
    const currentTeam = team?.data ?? team;
    const club = currentTeam.club;
    const players = currentTeam.players || [];

    const squadStats = {
        totalPlayers: players.length,
        activePlayers: players.filter(p => p.pivot?.is_active).length,
        totalGoals: players.reduce((sum, p) => sum + (p.statistics?.total_goals || 0), 0),
        totalGames: players.reduce((max, p) => Math.max(max, p.statistics?.total_games || 0), 0),
    };

    return (
        <>
            <Head>
                <title>{currentTeam.name}</title>
                <meta name="description" content={`${currentTeam.type_label || 'Team'} - ${club?.name || 'Hockey Team'}`.trim()} />
                <meta property="og:title" content={currentTeam.name} />
                <meta property="og:description" content={`${currentTeam.type_label || 'Team'} - ${club?.name || 'Hockey Team'}`.trim()} />
                <meta property="og:image" content={currentTeam.logo_url || club?.logo_url || '/icons/logo.png'} />
                <link rel="canonical" href={route('teams.public', currentTeam.uid)} />
            </Head>
            <div className="relative flex min-h-screen flex-col">
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/icons/background.png)',
                        backgroundRepeat: 'repeat',
                        opacity: 0.3,
                    }}
                />

                <div className="relative z-10 flex min-h-screen flex-col">
                    {/* Header */}
                    <div className="px-4 py-6 text-white sm:py-8" style={{ backgroundColor: '#01411C' }}>
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-4 flex justify-center md:hidden">
                                <Link href="/">
                                    <ApplicationLogo className="block h-auto w-auto fill-current text-white" />
                                </Link>
                            </div>

                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <div className="flex-shrink-0">
                                    {currentTeam.logo_url ? (
                                        <img
                                            src={currentTeam.logo_url}
                                            alt={currentTeam.name}
                                            className="h-24 w-24 rounded-xl border-4 border-white/30 object-cover shadow-lg sm:h-28 sm:w-28"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white/30 text-3xl font-bold shadow-lg sm:h-28 sm:w-28" style={{ backgroundColor: '#026B2E' }}>
                                            {currentTeam.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{currentTeam.name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        {currentTeam.type_label && (
                                            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                                                {currentTeam.type_label}
                                            </span>
                                        )}
                                        {club?.name && (
                                            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm">
                                                {club.name}
                                            </span>
                                        )}
                                    </div>
                                    {(currentTeam.coach || currentTeam.manager) && (
                                        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-green-100 sm:justify-start">
                                            {currentTeam.coach && (
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
                                                    Coach: {currentTeam.coach}
                                                </span>
                                            )}
                                            {currentTeam.manager && (
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
                                                    Manager: {currentTeam.manager}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden flex-shrink-0 md:block">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-28 w-auto fill-current text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Stats Bar */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 rounded-xl bg-white/10 px-4 py-3 sm:gap-8">
                                <QuickStat label="Players" value={squadStats.totalPlayers} />
                                <QuickStat label="Active" value={squadStats.activePlayers} />
                                <QuickStat label="Total Goals" value={squadStats.totalGoals} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
                        {/* Club Info Card */}
                        {club && (
                            <div className="mb-6 rounded-xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Club Information</h2>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                                    {club.logo_url && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={club.logo_url}
                                                alt={club.name}
                                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="grid flex-1 grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <span className="text-gray-500">Club Name</span>
                                            <p className="font-medium text-gray-900">{club.name}</p>
                                        </div>
                                        {club.email && (
                                            <div>
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                                                    Email
                                                </span>
                                                <p className="font-medium text-gray-900">{club.email}</p>
                                            </div>
                                        )}
                                        {club.phone && (
                                            <div>
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                                    Phone
                                                </span>
                                                <p className="font-medium text-gray-900">{club.phone}</p>
                                            </div>
                                        )}
                                        {club.website && (
                                            <div>
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <FontAwesomeIcon icon={faGlobe} className="h-3 w-3" />
                                                    Website
                                                </span>
                                                <a href={club.website} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                                                    {club.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                        {club.address?.city && (
                                            <div>
                                                <span className="text-gray-500">Location</span>
                                                <p className="font-medium text-gray-900">
                                                    {[club.address.city, club.address.state].filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {club.description && (
                                    <p className="mt-3 text-sm text-gray-600">{club.description}</p>
                                )}
                            </div>
                        )}

                        {/* Squad Table */}
                        {players.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Squad ({players.length})
                                    </h2>
                                </div>

                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                <th className="px-4 py-3 w-10">#</th>
                                                <th className="px-4 py-3">Player</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3">Pass #</th>
                                                <th className="px-4 py-3 text-center">
                                                    <FontAwesomeIcon icon={faTrophy} className="h-3 w-3" title="Games" />
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    <FontAwesomeIcon icon={faFutbol} className="h-3 w-3" title="Goals" />
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    <span className="inline-block h-3 w-3 rounded-sm bg-green-500" title="Green Cards" />
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" title="Yellow Cards" />
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    <span className="inline-block h-3 w-3 rounded-sm bg-red-500" title="Red Cards" />
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {players.map((player) => (
                                                <tr key={player.id} className="transition hover:bg-green-50/50">
                                                    <td className="px-4 py-3 font-semibold text-gray-500">
                                                        {player.pivot?.shirt_number || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {player.photo_url ? (
                                                                <img src={player.photo_url} alt={player.name} className="h-8 w-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                                                                    {player.name?.charAt(0)}
                                                                </div>
                                                            )}
                                                            <Link href={route('players.public', player.player_pass_number || player.id)} className="font-medium text-gray-900 hover:text-green-700">
                                                                {player.name}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <StatusBadge active={player.pivot?.is_active} />
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {player.player_pass_number || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-medium text-gray-900">{player.statistics?.total_games || 0}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-gray-900">{player.statistics?.total_goals || 0}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{player.statistics?.total_green_cards || 0}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{player.statistics?.total_yellow_cards || 0}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{player.statistics?.total_red_cards || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {players.map((player) => (
                                        <div key={player.id} className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {player.photo_url ? (
                                                    <img src={player.photo_url} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                                                        {player.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={route('players.public', player.player_pass_number || player.id)} className="font-medium text-gray-900 hover:text-green-700">
                                                        {player.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        {player.pivot?.shirt_number && (
                                                            <span className="flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faTshirt} className="h-3 w-3" />
                                                                #{player.pivot.shirt_number}
                                                            </span>
                                                        )}
                                                        {player.player_pass_number && (
                                                            <span className="flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faIdCard} className="h-3 w-3" />
                                                                {player.player_pass_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <StatusBadge active={player.pivot?.is_active} />
                                            </div>
                                            <div className="mt-2 flex items-center justify-around rounded-lg bg-gray-50 px-2 py-2 text-xs">
                                                <span title="Games">
                                                    <FontAwesomeIcon icon={faTrophy} className="mr-1 h-3 w-3 text-green-700" />
                                                    {player.statistics?.total_games || 0}
                                                </span>
                                                <span title="Goals">
                                                    <FontAwesomeIcon icon={faFutbol} className="mr-1 h-3 w-3 text-green-600" />
                                                    {player.statistics?.total_goals || 0}
                                                </span>
                                                <span title="Green Cards">
                                                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                                                    {player.statistics?.total_green_cards || 0}
                                                </span>
                                                <span title="Yellow Cards">
                                                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-yellow-400" />
                                                    {player.statistics?.total_yellow_cards || 0}
                                                </span>
                                                <span title="Red Cards">
                                                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                                                    {player.statistics?.total_red_cards || 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {players.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm">
                                <FontAwesomeIcon icon={faUsers} className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                <p className="text-gray-500">No players registered for this team yet.</p>
                            </div>
                        )}
                    </div>

                    <Footer />
                </div>
            </div>
        </>
    );
}

const QuickStat = ({ label, value }) => (
    <div className="text-center">
        <span className="block text-xl font-bold text-white">{value}</span>
        <span className="text-xs text-green-200">{label}</span>
    </div>
);

const StatusBadge = ({ active }) => {
    if (active) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            <FontAwesomeIcon icon={faCircleXmark} className="h-3 w-3" />
            Inactive
        </span>
    );
};
