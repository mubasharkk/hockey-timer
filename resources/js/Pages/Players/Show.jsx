import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TeamCard from '@/Components/TeamCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faBirthdayCake, faIdCard, faShirt, faTrophy, faFutbol, faFlag, faStopwatch, faPhone, faTint, faRunning, faUserShield, faEnvelope, faVenusMars, faExternalLinkAlt, faTrash, faExpand } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

export default function Show({ auth, player, teams = [], statistics, recentGames = [], events = [], can = {} }) {
    const currentPlayer = player?.data ?? player;
    const playerTeams = Array.isArray(teams) ? teams : teams?.data || [];
    const playerGames = Array.isArray(recentGames) ? recentGames : recentGames?.data || [];
    const playerEvents = Array.isArray(events) ? events : events?.data || [];

    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const { delete: deletePlayer, processing: deleting } = useForm();

    const age = currentPlayer.date_of_birth
        ? moment().diff(moment(currentPlayer.date_of_birth), 'years')
        : null;

    const handleDelete = () => {
        deletePlayer(route('players.destroy', currentPlayer.id), {
            onFinish: () => setConfirmingDelete(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        {currentPlayer.photo_url && (
                            <img
                                src={currentPlayer.photo_url}
                                alt={currentPlayer.name}
                                className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover sm:h-16 sm:w-16"
                            />
                        )}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Player</p>
                            <h2 className="text-lg font-semibold leading-tight text-gray-800 sm:text-xl">{currentPlayer.name}</h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                {currentPlayer.player_pass_number && (
                                    <p className="text-sm text-gray-600">Pass: {currentPlayer.player_pass_number}</p>
                                )}
                                {playerTeams.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1">
                                        {playerTeams.map((team) => (
                                            <Link
                                                key={team.id}
                                                href={route('teams.show', team.id)}
                                                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
                                            >
                                                {team.logo_url && (
                                                    <img src={team.logo_url} alt="" className="h-3 w-3 rounded-full object-cover" />
                                                )}
                                                {team.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <a
                            href={`/player/${currentPlayer.player_pass_number || currentPlayer.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-green-200 transition hover:bg-green-50 sm:px-3"
                            title="Public Profile"
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
                            <span className="hidden sm:inline">Public Profile</span>
                        </a>
                        {can.edit && (
                            <Link
                                href={route('players.edit', currentPlayer.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 sm:px-3"
                                title="Edit"
                            >
                                <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                                <span className="hidden sm:inline">Edit</span>
                            </Link>
                        )}
                        {can.delete && (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 sm:px-3"
                                title="Delete"
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                        <Link
                            href={route('players.index')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 sm:px-3"
                            title="Back"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={currentPlayer.name} />

            <div className="py-10">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Player Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 md:flex-row">
                            {/* Column 1: Photo (1/3) */}
                            <div className="flex-shrink-0 md:w-1/3">
                                <div className="flex flex-col items-center">
                                    {currentPlayer.photo_url ? (
                                        <img
                                            src={currentPlayer.photo_url}
                                            alt={currentPlayer.name}
                                            className="h-64 w-64 rounded-lg border-2 border-gray-200 object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                            <span className="text-sm text-gray-400">No photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Player Information (2/3) */}
                            <div className="flex-1 space-y-4 md:w-2/3">
                                <h3 className="text-lg font-semibold text-gray-900">Player Information</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                                    {currentPlayer.player_pass_number && (
                                        <CompactInfo icon={faIdCard} label="Pass #" value={currentPlayer.player_pass_number} />
                                    )}
                                    {currentPlayer.nic_number && (
                                        <CompactInfo icon={faIdCard} label="NIC" value={currentPlayer.nic_number} />
                                    )}
                                    {currentPlayer.date_of_birth && (
                                        <CompactInfo
                                            icon={faBirthdayCake}
                                            label="DOB"
                                            value={`${moment(currentPlayer.date_of_birth).format('DD MMM YYYY')}${age ? ` (${age}y)` : ''}`}
                                        />
                                    )}
                                    {currentPlayer.gender && (
                                        <CompactInfo icon={faVenusMars} label="Gender" value={currentPlayer.gender === 'male' ? 'Male' : 'Female'} />
                                    )}
                                    {currentPlayer.phone && (
                                        <CompactInfo icon={faPhone} label="Phone" value={currentPlayer.phone} />
                                    )}
                                    {currentPlayer.blood_group && (
                                        <CompactInfo icon={faTint} label="Blood" value={currentPlayer.blood_group} />
                                    )}
                                    {currentPlayer.player_type_label && (
                                        <CompactInfo icon={faRunning} label="Position" value={currentPlayer.player_type_label} />
                                    )}
                                    <CompactInfo
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

                                {/* Contact Persons & Address in 2 columns */}
                                <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2">
                                    {/* Contact Persons */}
                                    {currentPlayer.contact_persons && currentPlayer.contact_persons.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Contact Persons</h4>
                                            <div className="space-y-2">
                                                {currentPlayer.contact_persons.map((contact) => (
                                                    <div key={contact.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faUserShield} className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                                                            {contact.role && (
                                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{contact.role}</span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
                                                            {contact.phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                                                    {contact.phone}
                                                                </span>
                                                            )}
                                                            {contact.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                                                                    {contact.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {currentPlayer.address && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Address</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
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
                        </div>
                    </div>

                    {/* Teams Card */}
                    {playerTeams.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Teams</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {playerTeams.map((team) => (
                                    <TeamCard key={team.id} team={team} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistics</h3>
                        <div className="flex flex-wrap items-center justify-start gap-6">
                            <StatItem icon={faFutbol} label="Goals" value={statistics.goals || 0} color="text-green-600" />
                            <StatItem icon={faTrophy} label="Games" value={statistics.total_games || 0} color="text-green-700" />
                            <StatItem icon={faFlag} label="Yellow" value={statistics.yellow_cards || 0} color="text-yellow-600" />
                            <StatItem icon={faFlag} label="Red" value={statistics.red_cards || 0} color="text-red-600" />
                            {statistics.green_cards > 0 && (
                                <StatItem icon={faFlag} label="Green" value={statistics.green_cards} color="text-emerald-600" />
                            )}
                            {statistics.penalty_corners > 0 && (
                                <StatItem icon={faStopwatch} label="PC" value={statistics.penalty_corners} color="text-blue-600" />
                            )}
                            {statistics.penalty_strokes > 0 && (
                                <StatItem icon={faStopwatch} label="PS" value={statistics.penalty_strokes} color="text-purple-600" />
                            )}
                        </div>
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
                                                <div className="text-xs text-green-700">{game.tournament.title}</div>
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

                    {/* Player Events Card */}
                    {playerEvents.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Player Events</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Event</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Game</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Session</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {playerEvents.map((event) => (
                                            <tr key={event.id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={getEventIcon(event.event_type, event.card_type)}
                                                            alt={getEventLabel(event)}
                                                            className="h-5 w-5"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {getEventLabel(event)}
                                                        </span>
                                                    </div>
                                                    {event.note && (
                                                        <p className="mt-1 text-xs text-gray-500">{event.note}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {event.game ? (
                                                        <Link
                                                            href={route('games.summary', event.game.id)}
                                                            className="text-sm text-green-700 hover:text-green-600"
                                                        >
                                                            <div className="font-medium">
                                                                {event.team?.name || 'Team'} vs {event.opponent_team || 'Opponent'}
                                                            </div>
                                                            {event.game.code && (
                                                                <div className="text-xs text-gray-500">{event.game.code}</div>
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {event.occurred_at
                                                        ? moment(event.occurred_at).format('DD MMM YYYY · hh:mm A')
                                                        : event.game
                                                            ? moment(`${event.game.game_date} ${event.game.game_time}`).format('DD MMM YYYY')
                                                            : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {event.session_number ? `S${event.session_number}` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ID Documents Card */}
                    {currentPlayer.id_documents && currentPlayer.id_documents.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FontAwesomeIcon icon={faIdCard} className="h-5 w-5 text-green-700" />
                                <h3 className="text-sm font-semibold text-gray-900">Uploaded ID Documents</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {currentPlayer.id_documents.map((doc, index) => (
                                    <div
                                        key={doc.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                        onClick={() => setLightboxImage(doc.url)}
                                    >
                                        <img
                                            src={doc.url}
                                            alt={`ID Document ${index + 1}`}
                                            className="h-48 w-full object-cover transition group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                            <FontAwesomeIcon
                                                icon={faExpand}
                                                className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100"
                                            />
                                        </div>
                                        <p className="p-2 text-xs text-gray-600 truncate">{doc.name}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-gray-500">
                                Click on an image to view full size.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete this player?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{currentPlayer.name}</strong>? This action cannot be undone.
                        All associated data including statistics and game events will be permanently removed.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingDelete(false)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Player'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img
                            src={lightboxImage}
                            alt="ID Document Full View"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-gray-100"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

const CompactInfo = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 py-1">
        {icon && (
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">{label}:</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
);

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

const StatItem = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${color}`} />}
        <span className="text-xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-500">{label}</span>
    </div>
);

const getEventIcon = (eventType, cardType) => {
    switch (eventType) {
        case 'goal':
            return '/icons/goal.png';
        case 'penalty_corner':
            return '/icons/foul.png';
        case 'penalty_stroke':
            return '/icons/foul.png';
        case 'card':
            if (cardType === 'red') return '/icons/red-card.png';
            if (cardType === 'yellow') return '/icons/yellow-card.png';
            if (cardType === 'green') return '/icons/green-card.png';
            return '/icons/red-card.png';
        case 'session_end':
            return '/icons/half-time.png';
        case 'session_start':
            return '/icons/half-time.png';
        case 'game_end':
            return '/icons/full-time.png';
        default:
            return '/icons/foul.png';
    }
};

const getEventLabel = (event) => {
    switch (event.event_type) {
        case 'goal':
            return event.goal_type ? `${event.goal_type} Goal` : 'Goal';
        case 'penalty_corner':
            return 'Penalty Corner';
        case 'penalty_stroke':
            return 'Penalty Stroke';
        case 'card':
            return `${event.card_type || ''} Card`.trim() || 'Card';
        case 'session_end':
            return 'Session End';
        case 'session_start':
            return 'Session Start';
        case 'game_end':
            return 'Game End';
        case 'highlight':
            return event.note || 'Highlight';
        default:
            return event.event_type || 'Event';
    }
};
