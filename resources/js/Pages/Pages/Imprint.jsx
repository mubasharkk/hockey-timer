import { Head } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Imprint() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Head title="Imprint" />

            <div className="flex-1 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Link href="/">
                            <ApplicationLogo className="mx-auto h-48" />
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-8 shadow-sm">
                        <h1 className="mb-6 text-3xl font-bold text-gray-900">Imprint</h1>

                        <div className="prose prose-green max-w-none text-gray-600">
                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">Organization</h2>
                            <p className="mb-4">
                                Karachi Hockey Association<br />
                                Karachi, Pakistan
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">Contact</h2>
                            <p className="mb-4">
                                Email: info@karachi-hockey.com
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">Development</h2>
                            <p className="mb-4">
                                This application was developed by{' '}
                                <a
                                    href="https://social-gizmo.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-700 hover:text-green-600"
                                >
                                    Mubashar Khokhar IT Consulting
                                </a>
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">Disclaimer</h2>
                            <p className="mb-4">
                                The information provided on this platform is for general informational purposes
                                regarding hockey events and player registrations managed by the Karachi Hockey Association.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
