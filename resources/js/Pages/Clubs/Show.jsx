import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TeamCard from '@/Components/TeamCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faBuilding,
    faEnvelope,
    faExpand,
    faGlobe,
    faLocationDot,
    faPen,
    faPhone,
    faPlus,
    faTrash,
    faUser,
} from '@fortawesome/free-solid-svg-icons';

export default function Show({ auth, club }) {
    const currentClub = club?.data ?? club;
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const { delete: deleteClub, processing } = useForm();

    const teams = currentClub?.teams ?? [];
    const contactPersons = currentClub?.contact_persons ?? [];
    const canManage = currentClub?.user_id === auth?.user?.id;

    const handleDelete = () => {
        deleteClub(route('clubs.destroy', currentClub.id), {
            onFinish: () => setConfirmingDelete(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={currentClub.name} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Header */}
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {currentClub.logo_url ? (
                                <button
                                    type="button"
                                    onClick={() => setLightboxImage(currentClub.logo_url)}
                                    className="group relative cursor-pointer"
                                >
                                    <img
                                        src={currentClub.logo_url}
                                        alt={`${currentClub.name} logo`}
                                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover transition group-hover:border-green-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/20">
                                        <FontAwesomeIcon icon={faExpand} className="h-4 w-4 text-white opacity-0 transition group-hover:opacity-100" />
                                    </div>
                                </button>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-50">
                                    <FontAwesomeIcon icon={faBuilding} className="h-8 w-8 text-green-700" />
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Club</p>
                                <h1 className="text-2xl font-semibold text-gray-900">{currentClub.name}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {canManage && (
                                <>
                                    <Link
                                        href={route('clubs.teams.create', currentClub.id)}
                                        className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                        Add Team
                                    </Link>
                                    <Link
                                        href={route('clubs.edit', currentClub.id)}
                                        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(true)}
                                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                        Delete
                                    </button>
                                </>
                            )}
                            <Link
                                href={route('clubs.index')}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                                Back
                            </Link>
                        </div>
                    </header>

                    {/* Club Info */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Club Information</h3>

                        {/* Contact Details */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <a href={`mailto:${currentClub.email}`} className="text-sm font-medium text-green-700 hover:text-green-600">
                                        {currentClub.email}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    {currentClub.phone ? (
                                        <a href={`tel:${currentClub.phone}`} className="text-sm font-medium text-gray-900 hover:text-green-700">
                                            {currentClub.phone}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">—</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                                    <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Website</p>
                                    {currentClub.website ? (
                                        <a href={currentClub.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-700 hover:text-green-600">
                                            {currentClub.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">—</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        {currentClub.address && (
                            <div className="mt-6 border-t border-gray-100 pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                                        <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm text-gray-900">
                                            {currentClub.address.street}
                                            {currentClub.address.city && `, ${currentClub.address.city}`}
                                            {currentClub.address.state && `, ${currentClub.address.state}`}
                                            {currentClub.address.post_code && ` ${currentClub.address.post_code}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {currentClub.description && (
                            <div className="mt-6 border-t border-gray-100 pt-6">
                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Description</h4>
                                <p className="whitespace-pre-wrap text-sm text-gray-600">{currentClub.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Contact Persons */}
                    {contactPersons.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Persons</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {contactPersons.map((contact) => (
                                    <div key={contact.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-green-700" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900">{contact.name}</p>
                                                {contact.role && <p className="text-xs text-green-700">{contact.role}</p>}
                                                <div className="mt-2 space-y-1">
                                                    {contact.email && (
                                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-700">
                                                            <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                                                            <span className="truncate">{contact.email}</span>
                                                        </a>
                                                    )}
                                                    {contact.phone && (
                                                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-700">
                                                            <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                                            {contact.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Teams */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
                            {canManage && (
                                <Link
                                    href={route('clubs.teams.create', currentClub.id)}
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-600"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                                    Add Team
                                </Link>
                            )}
                        </div>

                        {teams.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.map((team) => (
                                    <TeamCard key={team.id} team={team} showMeta />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No teams yet. Add the first team to this club.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete this club?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This will permanently delete the club and all its associated data. Teams will be unlinked but not deleted.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingDelete(false)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete Club'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img
                            src={lightboxImage}
                            alt="Club Logo Full View"
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
