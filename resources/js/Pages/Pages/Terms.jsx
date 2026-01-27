import { Head } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Head title="Terms of Service" />

            <div className="flex-1 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Link href="/">
                            <ApplicationLogo className="mx-auto h-48" />
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-8 shadow-sm">
                        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>

                        <div className="prose prose-green max-w-none text-gray-600">
                            <p className="mb-4">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By accessing and using this application, you accept and agree to be bound by the terms
                                and conditions of this agreement.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">2. Use of Service</h2>
                            <p className="mb-4">
                                This application is provided for managing hockey teams, players, and tournaments
                                for the Karachi Hockey Association. You agree to use the service only for lawful purposes.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">3. User Accounts</h2>
                            <p className="mb-4">
                                You are responsible for maintaining the confidentiality of your account credentials
                                and for all activities that occur under your account.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">4. Data Accuracy</h2>
                            <p className="mb-4">
                                You agree to provide accurate and complete information when registering players,
                                teams, and managing tournament data.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">5. Limitation of Liability</h2>
                            <p className="mb-4">
                                The Karachi Hockey Association shall not be liable for any indirect, incidental,
                                special, or consequential damages arising from your use of this service.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">6. Changes to Terms</h2>
                            <p className="mb-4">
                                We reserve the right to modify these terms at any time. Continued use of the service
                                after changes constitutes acceptance of the new terms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
