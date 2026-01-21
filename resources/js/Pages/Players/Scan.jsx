import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faUpload, faSpinner, faArrowRight, faKeyboard, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef } from 'react';

const MAX_FILES = 2;

export default function Scan({ auth, team }) {
    const currentTeam = team?.data ?? team;
    const [previews, setPreviews] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        id_documents: [],
    });

    const handleFiles = (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        const currentFiles = data.id_documents || [];
        const combinedFiles = [...currentFiles, ...validFiles].slice(0, MAX_FILES);

        setData('id_documents', combinedFiles);

        // Generate previews
        const newPreviews = [];
        combinedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews[index] = { url: reader.result, name: file.name };
                if (newPreviews.filter(Boolean).length === combinedFiles.length) {
                    setPreviews([...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        if (combinedFiles.length === 0) {
            setPreviews([]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('teams.players.scan.process', currentTeam.id), {
            forceFormData: true,
        });
    };

    const removeFile = (index) => {
        const newFiles = data.id_documents.filter((_, i) => i !== index);
        setData('id_documents', newFiles);
        setPreviews(previews.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearAllFiles = () => {
        setData('id_documents', []);
        setPreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Scan Player ID" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Step 1 of 2</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Scan ID Document</h1>
                        <p className="text-sm text-gray-600">
                            Upload a player's ID document to automatically extract their information.
                        </p>
                    </header>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-start gap-4 rounded-lg bg-blue-50 p-4">
                            <FontAwesomeIcon icon={faIdCard} className="mt-0.5 h-5 w-5 text-blue-600" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Supported Documents</p>
                                <p className="mt-1 text-blue-700">
                                    National ID cards, passports, driver's licenses, or sports federation cards.
                                    The image should be clear and all text readable.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Uploaded files preview */}
                            {previews.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-700">
                                            Uploaded Documents ({previews.length}/{MAX_FILES})
                                        </p>
                                        <button
                                            type="button"
                                            onClick={clearAllFiles}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Remove all
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {previews.map((preview, index) => (
                                            <div
                                                key={index}
                                                className="group relative rounded-lg border border-green-200 bg-green-50 p-2"
                                            >
                                                <img
                                                    src={preview.url}
                                                    alt={`ID Document ${index + 1}`}
                                                    className="h-40 w-full rounded object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                                                </button>
                                                <p className="mt-1 truncate text-xs text-gray-600">{preview.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Drop zone - show if less than max files */}
                            {previews.length < MAX_FILES && (
                                <div
                                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                        dragActive
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className="space-y-3">
                                        <FontAwesomeIcon
                                            icon={faUpload}
                                            className="mx-auto h-12 w-12 text-gray-400"
                                        />
                                        <div>
                                            <label
                                                htmlFor="id_documents"
                                                className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                Click to upload
                                            </label>
                                            <span className="text-sm text-gray-500"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF, or WebP up to 10MB each
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {previews.length === 0
                                                ? 'Upload up to 2 images (e.g., front and back of ID)'
                                                : `You can add ${MAX_FILES - previews.length} more image`}
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        id="id_documents"
                                        name="id_documents[]"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            {(errors.id_documents || errors['id_documents.0'] || errors['id_documents.1']) && (
                                <p className="text-sm text-red-600">
                                    {errors.id_documents || errors['id_documents.0'] || errors['id_documents.1']}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <Link
                                    href={route('teams.players.create', currentTeam.id)}
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    <FontAwesomeIcon icon={faKeyboard} className="h-4 w-4" />
                                    Enter manually instead
                                </Link>

                                <button
                                    type="submit"
                                    disabled={data.id_documents.length === 0 || processing}
                                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                >
                                    {processing ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            Scan & Create Player
                                            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Info card */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-medium text-gray-900">How it works</h3>
                        <ol className="mt-2 space-y-1 text-sm text-gray-600">
                            <li>1. Upload 1-2 clear photos of the player's ID (front and back)</li>
                            <li>2. AI extracts name, date of birth, ID number, and address</li>
                            <li>3. Review extracted data and fill in any missing fields</li>
                        </ol>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
