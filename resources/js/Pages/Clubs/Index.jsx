import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, clubs }) {
    const clubList = clubs?.data ?? clubs ?? [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clubs" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Clubs</h1>
                            <p className="text-sm text-gray-600">Manage your clubs and their teams.</p>
                        </div>
                        <Link
                            href={route('clubs.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            New Club
                        </Link>
                    </header>

                    {clubList.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                            <FontAwesomeIcon icon={faBuilding} className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No clubs yet</h3>
                            <p className="mt-2 text-sm text-gray-600">Get started by creating your first club.</p>
                            <Link
                                href={route('clubs.create')}
                                className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                Create Club
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {clubList.map((club) => (
                                <Link
                                    key={club.id}
                                    href={route('clubs.show', club.id)}
                                    className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-4">
                                        {club.logo_url ? (
                                            <img
                                                src={club.logo_url}
                                                alt={`${club.name} logo`}
                                                className="h-14 w-14 rounded-lg border border-gray-100 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-50">
                                                <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-green-700" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                {club.name}
                                            </h3>
                                            {club.email && (
                                                <p className="mt-1 truncate text-sm text-gray-500">{club.email}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
                                                <span>{club.teams_count ?? 0} teams</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
