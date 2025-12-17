import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

export default function Edit({ auth, team }) {
    const currentTeam = team?.data ?? team;
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        name: currentTeam?.name ?? '',
        coach: currentTeam?.coach ?? '',
        manager: currentTeam?.manager ?? '',
        logo: null,
        remove_logo: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('teams.update', currentTeam.id), {
            forceFormData: true,
            onSuccess: () => reset('logo'),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit ${currentTeam.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Team</p>
                            <h1 className="text-2xl font-semibold text-gray-900">Edit {currentTeam.name}</h1>
                            <p className="text-sm text-gray-600">Update basic team details. Players stay unchanged.</p>
                        </div>
                        <Link
                            href={route('teams.show', currentTeam.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            Back
                        </Link>
                    </header>

                    <form onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Team Name</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Coach (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.coach}
                                    onChange={(e) => setData('coach', e.target.value)}
                                    placeholder="Name"
                                />
                                {errors.coach && <p className="mt-1 text-xs text-red-600">{errors.coach}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Manager (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.manager}
                                    onChange={(e) => setData('manager', e.target.value)}
                                    placeholder="Name"
                                />
                                {errors.manager && <p className="mt-1 text-xs text-red-600">{errors.manager}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Team Logo (optional)</label>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-700"
                                    onChange={(e) => {
                                        const file = e.target.files[0] || null;
                                        setData('logo', file);
                                        if (file) {
                                            setData('remove_logo', false);
                                        }
                                    }}
                                />
                                {team.logo_url && !data.remove_logo && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={team.logo_url}
                                            alt={`${team.name} logo`}
                                            className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-red-600 hover:text-red-500"
                                            onClick={() => {
                                                setData('remove_logo', true);
                                                setData('logo', null);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                {data.remove_logo && (
                                    <div className="text-xs text-gray-600">
                                        <p>Logo will be removed on save. Upload a new file to replace instead.</p>
                                        <button
                                            type="button"
                                            className="mt-1 font-semibold text-indigo-600 hover:text-indigo-500"
                                            onClick={() => setData('remove_logo', false)}
                                        >
                                            Keep existing logo
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB.</p>
                            {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">These details update immediately for upcoming games.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
