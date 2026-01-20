import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faBirthdayCake, faIdCard, faShirt, faTrophy, faFutbol, faFlag, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

export default function Show({ auth, team, player, statistics, recentGames = [] }) {
    const currentTeam = team?.data ?? team;
    const currentPlayer = player?.data ?? player;
    const playerGames = Array.isArray(recentGames) ? recentGames : recentGames?.data || [];
    const canManage = currentTeam?.user_id === auth?.user?.id;

    const age = currentPlayer.date_of_birth 
        ? moment().diff(moment(currentPlayer.date_of_birth), 'years')
        : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {currentPlayer.photo_url && (
                            <img
                                src={currentPlayer.photo_url}
                                alt={currentPlayer.name}
                                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                            />
                        )}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Player</p>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">{currentPlayer.name}</h2>
                            {currentPlayer.shirt_number && (
                                <p className="text-sm text-gray-600">#{currentPlayer.shirt_number}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {canManage && (
                            <Link
                                href={route('teams.players.edit', [currentTeam.id, currentPlayer.id])}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                            >
                                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                                Edit Player
                            </Link>
                        )}
                        <Link
                            href={route('teams.show', currentTeam.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            Back to Team
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={currentPlayer.name} />

            <div className="py-10">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    {/* Player Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Player Information</h3>
                                <div className="space-y-3">
                                    {currentPlayer.shirt_number && (
                                        <InfoItem
                                            icon={faShirt}
                                            label="Shirt Number"
                                            value={`#${currentPlayer.shirt_number}`}
                                        />
                                    )}
                                    {currentPlayer.player_pass_number && (
                                        <InfoItem
                                            icon={faIdCard}
                                            label="Player Pass Number"
                                            value={currentPlayer.player_pass_number}
                                        />
                                    )}
                                    {currentPlayer.nic_number && (
                                        <InfoItem
                                            icon={faIdCard}
                                            label="NIC Number"
                                            value={currentPlayer.nic_number}
                                        />
                                    )}
                                    {currentPlayer.date_of_birth && (
                                        <InfoItem
                                            icon={faBirthdayCake}
                                            label="Date of Birth"
                                            value={`${moment(currentPlayer.date_of_birth).format('DD MMM YYYY')}${age ? ` (${age} years)` : ''}`}
                                        />
                                    )}
                                    <InfoItem
                                        label="Status"
                                        value={
                                            currentPlayer.is_active ? (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold uppercase text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold uppercase text-amber-700">
                                                    Inactive
                                                </span>
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {currentPlayer.address && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        {currentPlayer.address.street && (
                                            <p>{currentPlayer.address.street}</p>
                                        )}
                                        {currentPlayer.address.street_extra && (
                                            <p>{currentPlayer.address.street_extra}</p>
                                        )}
                                        <p>
                                            {[
                                                currentPlayer.address.city,
                                                currentPlayer.address.state,
                                                currentPlayer.address.post_code,
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <StatCard
                                icon={faFutbol}
                                label="Goals"
                                value={statistics.goals || 0}
                                color="text-green-600"
                            />
                            <StatCard
                                icon={faFlag}
                                label="Yellow Cards"
                                value={statistics.yellow_cards || 0}
                                color="text-yellow-600"
                            />
                            <StatCard
                                icon={faFlag}
                                label="Red Cards"
                                value={statistics.red_cards || 0}
                                color="text-red-600"
                            />
                            <StatCard
                                icon={faTrophy}
                                label="Games Played"
                                value={statistics.total_games || 0}
                                color="text-indigo-600"
                            />
                        </div>
                        {(statistics.green_cards > 0 || statistics.penalty_corners > 0 || statistics.penalty_strokes > 0) && (
                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {statistics.green_cards > 0 && (
                                    <StatCard
                                        icon={faFlag}
                                        label="Green Cards"
                                        value={statistics.green_cards}
                                        color="text-emerald-600"
                                    />
                                )}
                                {statistics.penalty_corners > 0 && (
                                    <StatCard
                                        icon={faStopwatch}
                                        label="Penalty Corners"
                                        value={statistics.penalty_corners}
                                        color="text-blue-600"
                                    />
                                )}
                                {statistics.penalty_strokes > 0 && (
                                    <StatCard
                                        icon={faStopwatch}
                                        label="Penalty Strokes"
                                        value={statistics.penalty_strokes}
                                        color="text-purple-600"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Games Card */}
                    {playerGames.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Games</h3>
                            <div className="space-y-3">
                                {playerGames.map((game) => (
                                    <Link
                                        key={game.id}
                                        href={route('games.summary', game.id)}
                                        className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {game.team_a_name} vs {game.team_b_name}
                                            </div>
                                            {game.tournament?.title && (
                                                <div className="text-xs text-indigo-600">{game.tournament.title}</div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                {moment(`${game.game_date} ${game.game_time}`).format('DD MMM YYYY · hh:mm A')} · {game.venue}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {game.status === 'finished' ? (
                                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold uppercase text-red-700">
                                                    Finished
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold uppercase text-blue-700">
                                                    {game.status || 'Scheduled'}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        {icon && (
            <FontAwesomeIcon icon={icon} className="mt-0.5 h-4 w-4 text-gray-400" />
        )}
        <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-0.5 text-sm text-gray-900">{value}</p>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, color }) => (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-4 text-center">
        {icon && (
            <FontAwesomeIcon icon={icon} className={`mx-auto mb-2 h-6 w-6 ${color}`} />
        )}
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    </div>
);
