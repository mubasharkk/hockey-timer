import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth, club, clubs, teamTypes }) {
    const currentClub = club?.data ?? club;
    const clubList = clubs?.data ?? clubs ?? [];
    const { data, setData, post, processing, errors } = useForm({
        club_id: currentClub?.id ?? '',
        name: '',
        type: '',
        coach: '',
        manager: '',
        email: '',
        phone: '',
        description: '',
        logo: null,
        contact_persons: [],
    });

    const addContactPerson = () => {
        setData('contact_persons', [
            ...data.contact_persons,
            { name: '', role: '', phone: '', email: '' },
        ]);
    };

    const removeContactPerson = (index) => {
        setData(
            'contact_persons',
            data.contact_persons.filter((_, i) => i !== index)
        );
    };

    const updateContactPerson = (index, field, value) => {
        const updated = [...data.contact_persons];
        updated[index] = { ...updated[index], [field]: value };
        setData('contact_persons', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        if (currentClub) {
            post(route('clubs.teams.store', currentClub.id), {
                forceFormData: true,
            });
        } else {
            post(route('teams.store'), {
                forceFormData: true,
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Register Team" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <header className="space-y-2">
                        {currentClub && <p className="text-xs font-semibold uppercase tracking-wide text-green-700">{currentClub.name}</p>}
                        <h1 className="text-2xl font-semibold text-gray-900">{currentClub ? 'Add a Team' : 'Register a Team'}</h1>
                        <p className="text-sm text-gray-600">{currentClub ? 'Create a new team for this club.' : 'Create a team profile with staff details.'}</p>
                    </header>

                    <form onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        {/* Club Selection - only show if not coming from a specific club */}
                        {!currentClub && clubList.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Club (optional)</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.club_id}
                                    onChange={(e) => setData('club_id', e.target.value)}
                                >
                                    <option value="">— No club (standalone team) —</option>
                                    {clubList.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.club_id && <p className="mt-1 text-xs text-red-600">{errors.club_id}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team Name <span className="text-red-500">*</span></label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team Type (optional)</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    <option value="">— Select type —</option>
                                    {teamTypes && Object.entries(teamTypes).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="team@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+1 234 567 890"
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description about your team..."
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Coach (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.coach}
                                    onChange={(e) => setData('coach', e.target.value)}
                                    placeholder="Name"
                                />
                                {errors.coach && <p className="mt-1 text-xs text-red-600">{errors.coach}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Manager (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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

                        {/* Contact Persons */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Contact Persons (optional)</label>
                                <button
                                    type="button"
                                    onClick={addContactPerson}
                                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                                    Add Contact
                                </button>
                            </div>

                            {data.contact_persons.map((contact, index) => (
                                <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">Contact #{index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeContactPerson(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Name <span className="text-red-500">*</span></label>
                                            <input
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.name}
                                                onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                                placeholder="Full name"
                                                required
                                            />
                                            {errors[`contact_persons.${index}.name`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`contact_persons.${index}.name`]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Role (optional)</label>
                                            <input
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.role}
                                                onChange={(e) => updateContactPerson(index, 'role', e.target.value)}
                                                placeholder="e.g. Team Captain, Coordinator"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Phone (optional)</label>
                                            <input
                                                type="tel"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.phone}
                                                onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Email (optional)</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.email}
                                                onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                                                placeholder="contact@example.com"
                                            />
                                            {errors[`contact_persons.${index}.email`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`contact_persons.${index}.email`]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {data.contact_persons.length === 0 && (
                                <p className="text-xs text-gray-500">No contact persons added yet.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Add players after saving this team.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
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
