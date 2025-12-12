import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, teams = [] }) {
    const userId = auth?.user?.id;
    const ownsTeam = (team) => userId && team.user_id === userId;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Teams</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('teams.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            Register Team
                        </Link>
                        <Link
                            href={route('public.tournaments.show', 'latest')}\n                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-indigo-200 transition hover:bg-indigo-50"
                        >
                            Public view
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
                                {teams.length === 0 && <p className="text-sm text-gray-600">No teams yet. Register one to get started.</p>}

                                {teams.map((team) => (
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
                                                    {team.players?.length ?? 0} player(s)
                                                    {team.coach ? ` · Coach: ${team.coach}` : ''}
                                                    {team.manager ? ` · Manager: ${team.manager}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {ownsTeam(team) && (
                                                <Link
                                                    href={route('teams.players.create', team.id)}
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
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
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
