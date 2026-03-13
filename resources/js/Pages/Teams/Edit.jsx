import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFloppyDisk, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Edit({ auth, team, clubs, teamTypes }) {
    const currentTeam = team?.data ?? team;
    const clubList = clubs?.data ?? clubs ?? [];
    const [logoPreview, setLogoPreview] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        club_id: currentTeam?.club_id ?? '',
        name: currentTeam?.name ?? '',
        type: currentTeam?.type ?? '',
        coach: currentTeam?.coach ?? '',
        manager: currentTeam?.manager ?? '',
        email: currentTeam?.email ?? '',
        phone: currentTeam?.phone ?? '',
        description: currentTeam?.description ?? '',
        logo: null,
        remove_logo: false,
        contact_persons: currentTeam?.contact_persons ?? [],
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
        post(route('teams.update', currentTeam.id), {
            forceFormData: true,
            onSuccess: () => reset('logo'),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit ${currentTeam.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <header className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Team</p>
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
                        {/* Club Selection */}
                        {clubList.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Club (optional)</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.club_id || ''}
                                    onChange={(e) => setData('club_id', e.target.value || null)}
                                >
                                    <option value="">— No club (standalone team) —</option>
                                    {clubList.map((club) => (
                                        <option key={club.id} value={club.id}>{club.name}</option>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Team Logo (optional)</label>
                            <div className="flex items-start gap-4">
                                {/* Preview */}
                                {!data.remove_logo && (logoPreview || currentTeam.logo_url) && (
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={logoPreview || currentTeam.logo_url}
                                            alt={`${currentTeam.name} logo`}
                                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                                            onClick={() => {
                                                setData((prev) => ({ ...prev, logo: null, remove_logo: true }));
                                                setLogoPreview(null);
                                            }}
                                            title="Remove logo"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
                                        </button>
                                        {logoPreview && (
                                            <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-green-700/80 py-0.5 text-center text-[10px] font-semibold text-white">
                                                New
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                                        onChange={(e) => {
                                            const file = e.target.files[0] || null;
                                            setData((prev) => ({ ...prev, logo: file, remove_logo: false }));
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setLogoPreview(ev.target.result);
                                                reader.readAsDataURL(file);
                                            } else {
                                                setLogoPreview(null);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB.</p>
                                    {data.remove_logo && !logoPreview && (
                                        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                            <span>Logo will be removed on save.</span>
                                            <button
                                                type="button"
                                                className="font-semibold underline hover:text-amber-800"
                                                onClick={() => setData('remove_logo', false)}
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                <div key={contact.id || index} className="rounded-md border border-gray-200 bg-gray-50 p-4">
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
                                                value={contact.role || ''}
                                                onChange={(e) => updateContactPerson(index, 'role', e.target.value)}
                                                placeholder="e.g. Team Captain, Coordinator"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Phone (optional)</label>
                                            <input
                                                type="tel"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.phone || ''}
                                                onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Email (optional)</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={contact.email || ''}
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
                            <p className="text-xs text-gray-500">These details update immediately for upcoming games.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
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
