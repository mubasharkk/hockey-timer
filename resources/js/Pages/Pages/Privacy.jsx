import { Head } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import PublicLayout from "@/Layouts/PublicLayout.jsx";

export default function Privacy() {
    return (
        <PublicLayout>
        <div className="flex min-h-screen flex-col ">
            <Head title="Privacy Policy" />

            <div className="flex-1 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Link href="/">
                            <ApplicationLogo className="mx-auto h-48" />
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-8 shadow-sm">
                        <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>

                        <div className="prose prose-green max-w-none text-gray-600">
                            <p className="mb-4">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">1. Information We Collect</h2>
                            <p className="mb-4">
                                We collect information you provide directly to us, such as when you create an account,
                                register players, or contact us for support.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">2. How We Use Your Information</h2>
                            <p className="mb-4">
                                We use the information we collect to operate, maintain, and improve our services,
                                including managing hockey teams, players, and tournaments.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">3. Information Sharing</h2>
                            <p className="mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties
                                without your consent, except as required by law.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">4. Data Security</h2>
                            <p className="mb-4">
                                We implement appropriate security measures to protect your personal information
                                against unauthorized access, alteration, disclosure, or destruction.
                            </p>

                            <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-800">5. Contact Us</h2>
                            <p className="mb-4">
                                If you have any questions about this Privacy Policy, please contact us at
                                the Karachi Hockey Association.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </PublicLayout>
    );
}
