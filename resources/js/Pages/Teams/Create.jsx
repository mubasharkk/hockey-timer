import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        coach: '',
        manager: '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('teams.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Register Team" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Register a Team</h1>
                        <p className="text-sm text-gray-600">Create a reusable team profile with staff details.</p>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Team Logo (optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-700"
                                onChange={(e) => setData('logo', e.target.files[0] || null)}
                            />
                            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB.</p>
                            {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Add players after saving this team.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Team'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
