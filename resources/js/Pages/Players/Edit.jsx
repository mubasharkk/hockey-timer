import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faIdCard, faExpand, faUser, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

// Format date to YYYY-MM-DD for HTML date input
const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }
    // Try to parse and format
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

export default function Edit({ auth, team, player, genders = {}, bloodGroups = {}, playerTypes = {} }) {
    const currentTeam = team?.data ?? team;
    const currentPlayer = player?.data ?? player;
    const [lightboxImage, setLightboxImage] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(currentPlayer.photo_url || null);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        name: currentPlayer.name || '',
        shirt_number: currentPlayer.shirt_number || '',
        player_pass_number: currentPlayer.player_pass_number || '',
        nic_number: currentPlayer.nic_number || '',
        date_of_birth: formatDateForInput(currentPlayer.date_of_birth),
        gender: currentPlayer.gender || '',
        phone: currentPlayer.phone || '',
        blood_group: currentPlayer.blood_group || '',
        player_type: currentPlayer.player_type || '',
        description: currentPlayer.description || '',
        is_active: currentPlayer.is_active ?? true,
        address: {
            street: currentPlayer.address?.street || '',
            city: currentPlayer.address?.city || '',
            state: currentPlayer.address?.state || '',
            post_code: currentPlayer.address?.post_code || '',
        },
        photo: null,
        contact_persons: currentPlayer.contact_persons || [],
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
        post(route('teams.players.update', [currentTeam.id, currentPlayer.id]), {
            forceFormData: true,
            onSuccess: () => reset('photo'),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Player" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Player</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit {currentPlayer.name}</h1>
                        <p className="text-sm text-gray-600">Update player details, status, and photo.</p>
                    </header>

                    {/* ID Documents Preview */}
                    {currentPlayer.id_documents && currentPlayer.id_documents.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FontAwesomeIcon icon={faIdCard} className="h-5 w-5 text-indigo-600" />
                                <h3 className="text-sm font-semibold text-gray-900">Uploaded ID Documents</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {currentPlayer.id_documents.map((doc, index) => (
                                    <div
                                        key={doc.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                        onClick={() => setLightboxImage(doc.url)}
                                    >
                                        <img
                                            src={doc.url}
                                            alt={`ID Document ${index + 1}`}
                                            className="h-48 w-full object-cover transition group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                            <FontAwesomeIcon
                                                icon={faExpand}
                                                className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100"
                                            />
                                        </div>
                                        <p className="p-2 text-xs text-gray-600 truncate">{doc.name}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-gray-500">
                                Click on an image to view full size. These documents were used to extract player information.
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />
                            <Field
                                label="Shirt Number"
                                value={data.shirt_number}
                                onChange={(e) => setData('shirt_number', e.target.value)}
                                error={errors.shirt_number}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field
                                label="Player Pass Number"
                                value={data.player_pass_number}
                                onChange={(e) => setData('player_pass_number', e.target.value)}
                                error={errors.player_pass_number}
                                placeholder="Leave empty to keep or auto-generate"
                            />
                            <Field
                                label="Player NIC (optional)"
                                value={data.nic_number}
                                onChange={(e) => setData('nic_number', e.target.value)}
                                error={errors.nic_number}
                            />
                            <Field
                                label="Date of Birth"
                                type="date"
                                value={data.date_of_birth || ''}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                error={errors.date_of_birth}
                            />
                        </div>

                        {/* Player Details */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                    className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                                    Add Contact
                                </button>
                            </div>
                            {data.contact_persons.length > 0 && (
                                <div className="mt-3 space-y-3">
                                    {data.contact_persons.map((contact, index) => (
                                        <div key={contact.id || index} className="relative rounded-md border border-gray-200 bg-white p-3">
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
                                                    value={contact.role || ''}
                                                    onChange={(val) => updateContactPerson(index, 'role', val)}
                                                    error={errors[`contact_persons.${index}.role`]}
                                                />
                                                <TextField
                                                    label="Phone"
                                                    value={contact.phone || ''}
                                                    onChange={(val) => updateContactPerson(index, 'phone', val)}
                                                    error={errors[`contact_persons.${index}.phone`]}
                                                />
                                                <TextField
                                                    label="Email"
                                                    value={contact.email || ''}
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Any additional notes about the player..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        {/* Address */}
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
                                        <p className="mt-1 text-xs text-gray-500">
                                            {currentPlayer.photo_url ? 'Upload new photo to replace current one' : 'JPG, PNG, GIF up to 5MB'}
                                        </p>
                                    </div>
                                </div>
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
                            <p className="text-xs text-gray-500">Pass numbers keep the current value unless replaced.</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img
                            src={lightboxImage}
                            alt="ID Document Full View"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-gray-100"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

const Field = ({ label, error, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

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
