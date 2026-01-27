import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, teams = [] }) {
    const userId = auth?.user?.id;
    const teamList = Array.isArray(teams) ? teams : teams?.data || [];
    const ownsTeam = (team) => userId && team.user_id === userId;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Teams</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('teams.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            Register Team
                        </Link>
                        <Link
                            href={route('clubs.index')}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
                            Clubs
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Teams" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="text-sm text-gray-600">Registered teams ready to be used when creating games.</p>

                            <div className="mt-4 space-y-3">
                                {teamList.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                                        <p className="text-sm text-gray-600">No teams yet. Register one to get started.</p>
                                        <Link
                                            href={route('teams.create')}
                                            className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600"
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                            Register Team
                                        </Link>
                                    </div>
                                )}

                                {teamList.map((team) => (
                                    <div
                                        key={team.id}
                                        className="flex flex-wrap items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            {team.logo_url ? (
                                                <img
                                                    src={team.logo_url}
                                                    alt={`${team.name} logo`}
                                                    className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-gray-200 bg-white text-xs font-semibold uppercase text-gray-400">
                                                    Logo
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{team.name}</div>
                                                <div className="text-xs text-gray-600">
                                                    {team.club && (
                                                        <Link href={route('clubs.show', team.club.id)} className="text-green-700 hover:text-green-600">
                                                            {team.club.name}
                                                        </Link>
                                                    )}
                                                    {team.club && ' · '}
                                                    {team.type_label || 'Team'}
                                                    {' · '}{team.players?.length ?? 0} player(s)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {ownsTeam(team) && (
                                                <Link
                                                    href={route('players.scan', team.id)}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                                                    Add Player
                                                </Link>
                                            )}
                                            {ownsTeam(team) && (
                                                <Link
                                                    href={route('teams.edit', team.id)}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                                                    Edit
                                                </Link>
                                            )}
                                            <Link
                                                href={route('teams.show', team.id)}
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-600"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
