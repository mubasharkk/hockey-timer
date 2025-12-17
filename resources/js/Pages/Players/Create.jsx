import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth, team }) {
    const currentTeam = team?.data ?? team;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        shirt_number: '',
        player_pass_number: '',
        nic_number: '',
        date_of_birth: '',
        is_active: true,
        address: {
            street: '',
            street_extra: '',
            city: '',
            state: '',
            post_code: '',
        },
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('teams.players.store', currentTeam.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Register Player" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Player</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Add to {currentTeam.name}</h1>
                        <p className="text-sm text-gray-600">Capture player identity, pass number, and optional address/photo.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shirt Number</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.shirt_number}
                                    onChange={(e) => setData('shirt_number', e.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.shirt_number && <p className="mt-1 text-xs text-red-600">{errors.shirt_number}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Player Pass Number</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.player_pass_number}
                                    onChange={(e) => setData('player_pass_number', e.target.value)}
                                    placeholder="Leave empty to auto-generate"
                                />
                                {errors.player_pass_number && <p className="mt-1 text-xs text-red-600">{errors.player_pass_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Player NIC (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.nic_number}
                                    onChange={(e) => setData('nic_number', e.target.value)}
                                />
                                {errors.nic_number && <p className="mt-1 text-xs text-red-600">{errors.nic_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.date_of_birth || ''}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                                {errors.date_of_birth && <p className="mt-1 text-xs text-red-600">{errors.date_of_birth}</p>}
                            </div>
                        </div>

                        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                            <p className="text-sm font-semibold text-gray-800">Address (optional)</p>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <TextField
                                    label="Street"
                                    value={data.address.street}
                                    onChange={(val) => setData('address', { ...data.address, street: val })}
                                    error={errors['address.street']}
                                />
                                <TextField
                                    label="Street Extra"
                                    value={data.address.street_extra}
                                    onChange={(val) => setData('address', { ...data.address, street_extra: val })}
                                    error={errors['address.street_extra']}
                                />
                                <TextField
                                    label="City"
                                    value={data.address.city}
                                    onChange={(val) => setData('address', { ...data.address, city: val })}
                                    error={errors['address.city']}
                                />
                                <TextField
                                    label="State"
                                    value={data.address.state}
                                    onChange={(val) => setData('address', { ...data.address, state: val })}
                                    error={errors['address.state']}
                                />
                                <TextField
                                    label="Postal Code"
                                    value={data.address.post_code}
                                    onChange={(val) => setData('address', { ...data.address, post_code: val })}
                                    error={errors['address.post_code']}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Photo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm text-gray-700"
                                    onChange={(e) => setData('photo', e.target.files[0])}
                                />
                                {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Player is active and selectable
                                </label>
                                {errors.is_active && <p className="text-xs text-red-600">{errors.is_active}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Pass numbers auto-generate when left blank.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Player'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const TextField = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);
