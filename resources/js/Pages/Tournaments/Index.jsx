import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, tournaments = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Tournaments</h2>
                    <Link
                        href={route('tournaments.create')}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        New Tournament
                    </Link>
                </div>
            }
        >
            <Head title="Tournaments" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="text-sm text-gray-600">Organize games under tournaments and pools.</p>
                            <div className="mt-4 space-y-3">
                                {tournaments.length === 0 && (
                                    <p className="text-sm text-gray-600">No tournaments yet. Create one to get started.</p>
                                )}
                                {tournaments.map((tournament) => (
                                    <div
                                        key={tournament.id}
                                        className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            {tournament.logo_url && (
                                                <img
                                                    src={tournament.logo_url}
                                                    alt={`${tournament.title} logo`}
                                                    className="h-10 w-10 rounded-md object-contain ring-1 ring-gray-200 bg-white"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{tournament.title}</div>
                                                <div className="text-xs text-gray-600">Slug: {tournament.slug}</div>
                                                <div className="text-xs text-gray-600">
                                                    Venue: {tournament.venue} · {tournament.win_points}/{tournament.draw_points}/{tournament.loss_points} (W/D/L)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-semibold">
                                            <Link
                                                href={route('tournaments.show', tournament.id)}
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                                                View
                                            </Link>
                                            <Link
                                                href={route('tournaments.edit', tournament.id)}
                                                className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900"
                                            >
                                                <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                                                Edit
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
