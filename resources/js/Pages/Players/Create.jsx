import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUser, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import AddressForm from '@/Components/AddressForm';

export default function Create({ auth, genders = {}, bloodGroups = {}, playerTypes = {} }) {
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        player_pass_number: '',
        nic_number: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        blood_group: '',
        player_type: '',
        description: '',
        is_active: true,
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            post_code: '',
        },
        photo: null,
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
        post(route('players.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Player" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Player</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Create New Player</h1>
                        <p className="text-sm text-gray-600">Enter player details. You can add them to teams later.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Player Pass Number</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.player_pass_number}
                                    onChange={(e) => setData('player_pass_number', e.target.value)}
                                    placeholder="Leave empty to auto-generate"
                                />
                                {errors.player_pass_number && <p className="mt-1 text-xs text-red-600">{errors.player_pass_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Player NIC (optional)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.nic_number}
                                    onChange={(e) => setData('nic_number', e.target.value)}
                                />
                                {errors.nic_number && <p className="mt-1 text-xs text-red-600">{errors.nic_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.date_of_birth || ''}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                                {errors.date_of_birth && <p className="mt-1 text-xs text-red-600">{errors.date_of_birth}</p>}
                            </div>
                        </div>

                        {/* Player Details */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="">— Select —</option>
                                    {Object.entries(genders).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                            </div>
                            <TextField
                                label="Phone Number"
                                value={data.phone}
                                onChange={(val) => setData('phone', val)}
                                error={errors.phone}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.blood_group}
                                    onChange={(e) => setData('blood_group', e.target.value)}
                                >
                                    <option value="">— Select —</option>
                                    {Object.entries(bloodGroups).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.blood_group && <p className="mt-1 text-xs text-red-600">{errors.blood_group}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Player Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.player_type}
                                    onChange={(e) => setData('player_type', e.target.value)}
                                >
                                    <option value="">— Select —</option>
                                    {Object.entries(playerTypes).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.player_type && <p className="mt-1 text-xs text-red-600">{errors.player_type}</p>}
                            </div>
                        </div>

                        {/* Contact Persons */}
                        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">Contact Persons (optional)</p>
                                <button
                                    type="button"
                                    onClick={addContactPerson}
                                    className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                                    Add Contact
                                </button>
                            </div>
                            {data.contact_persons.length > 0 && (
                                <div className="mt-3 space-y-3">
                                    {data.contact_persons.map((contact, index) => (
                                        <div key={index} className="relative rounded-md border border-gray-200 bg-white p-3">
                                            <button
                                                type="button"
                                                onClick={() => removeContactPerson(index)}
                                                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                                            </button>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                                <TextField
                                                    label="Name *"
                                                    value={contact.name}
                                                    onChange={(val) => updateContactPerson(index, 'name', val)}
                                                    error={errors[`contact_persons.${index}.name`]}
                                                />
                                                <TextField
                                                    label="Role"
                                                    value={contact.role}
                                                    onChange={(val) => updateContactPerson(index, 'role', val)}
                                                    error={errors[`contact_persons.${index}.role`]}
                                                />
                                                <TextField
                                                    label="Phone"
                                                    value={contact.phone}
                                                    onChange={(val) => updateContactPerson(index, 'phone', val)}
                                                    error={errors[`contact_persons.${index}.phone`]}
                                                />
                                                <TextField
                                                    label="Email"
                                                    value={contact.email}
                                                    onChange={(val) => updateContactPerson(index, 'email', val)}
                                                    error={errors[`contact_persons.${index}.email`]}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {data.contact_persons.length === 0 && (
                                <p className="mt-2 text-xs text-gray-500">No contact persons added. Click "Add Contact" to add guardian, parent, or emergency contact.</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Any additional notes about the player..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        {/* Address */}
                        <AddressForm
                            address={data.address}
                            onChange={(newAddress) => setData('address', newAddress)}
                            errors={{
                                street: errors['address.street'],
                                city: errors['address.city'],
                                state: errors['address.state'],
                                country: errors['address.country'],
                                post_code: errors['address.post_code']
                            }}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Photo (optional)</label>
                                <div className="mt-1 flex items-start gap-4">
                                    {/* Photo Preview */}
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                        {photoPreview ? (
                                            <>
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPhotoPreview(null);
                                                        setData('photo', null);
                                                    }}
                                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <FontAwesomeIcon icon={faUser} className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-gray-700"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setData('photo', file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setPhotoPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                                    </div>
                                </div>
                                {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Player is active and selectable
                                </label>
                                {errors.is_active && <p className="text-xs text-red-600">{errors.is_active}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">Pass numbers auto-generate when left blank.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300 sm:w-auto"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);
