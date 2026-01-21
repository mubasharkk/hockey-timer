import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        website: '',
        description: '',
        logo: null,
        address: {
            street: '',
            city: '',
            state: '',
            post_code: '',
        },
        contact_persons: [],
    });

    const addContactPerson = () => {
        setData('contact_persons', [
            ...data.contact_persons,
            { name: '', role: '', phone: '', email: '' },
        ]);
    };

    const removeContactPerson = (index) => {
        setData('contact_persons', data.contact_persons.filter((_, i) => i !== index));
    };

    const updateContactPerson = (index, field, value) => {
        const updated = [...data.contact_persons];
        updated[index] = { ...updated[index], [field]: value };
        setData('contact_persons', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('clubs.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Club" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Create a Club</h1>
                        <p className="text-sm text-gray-600">Add your club details, address, and contact persons.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        {/* Basic Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Club Name <span className="text-red-500">*</span></label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://..."
                                />
                                {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Club Logo (optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-700"
                                onChange={(e) => setData('logo', e.target.files[0] || null)}
                            />
                            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB.</p>
                            {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
                        </div>

                        {/* Address */}
                        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                            <p className="text-sm font-semibold text-gray-800">Address (optional)</p>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Street</label>
                                    <input
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.address.street}
                                        onChange={(e) => setData('address', { ...data.address, street: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.address.city}
                                        onChange={(e) => setData('address', { ...data.address, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.address.state}
                                        onChange={(e) => setData('address', { ...data.address, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.address.post_code}
                                        onChange={(e) => setData('address', { ...data.address, post_code: e.target.value })}
                                    />
                                </div>
                            </div>
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
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={contact.name}
                                                onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Role</label>
                                            <input
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={contact.role}
                                                onChange={(e) => updateContactPerson(index, 'role', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Phone</label>
                                            <input
                                                type="tel"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={contact.phone}
                                                onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Email</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={contact.email}
                                                onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {data.contact_persons.length === 0 && (
                                <p className="text-xs text-gray-500">No contact persons added yet.</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Club'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
