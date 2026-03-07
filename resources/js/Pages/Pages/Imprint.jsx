import {Head} from '@inertiajs/react';
import Footer from '@/Components/Footer';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {Link} from '@inertiajs/react';
import PublicLayout from "@/Layouts/PublicLayout.jsx";

export default function Imprint() {
    return (

        <PublicLayout>
            <div className="flex flex-col">
                <Head title="Imprint"/>

                <div className="flex-1 py-12">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6">
                        {/* Logo */}
                        <div className=" text-center">
                            <Link href="/">
                                <ApplicationLogo className="mx-auto h-48 w-auto"/>
                            </Link>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900">Imprint</h1>
                                <p className="mt-2 text-gray-600">Legal information about our company</p>
                            </div>

                            {/* Combined Company Info Card */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Information */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-green-700 mb-3">Company
                                            Information</h2>
                                        <div className="space-y-2 text-gray-700">
                                            <p className="font-medium">MK IT Consulting</p>
                                            <p>Berlin, Germany</p>
                                            <p>
                                                <span className="font-medium">Website:</span>{' '}
                                                <a href="https://social-gizmo.com"
                                                   className="text-green-700 hover:text-green-600 underline"
                                                   target="_blank" rel="noopener noreferrer">
                                                    https://social-gizmo.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Represented By */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-green-700 mb-3">Represented by</h2>
                                        <p className="text-gray-700">Mubashar Khokhar</p>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-green-700 mb-3">Contact</h2>
                                        <div className="space-y-1 text-gray-700">
                                            <p>
                                                <span className="font-medium">Email:</span>{' '}
                                                <a href="mailto:contact@social-gizmo.com"
                                                   className="text-green-700 hover:text-green-600 underline">
                                                    contact@social-gizmo.com
                                                </a>
                                            </p>
                                            <p>
                                                <span className="font-medium">Website:</span>{' '}
                                                <a href="https://social-gizmo.com"
                                                   className="text-green-700 hover:text-green-600 underline"
                                                   target="_blank" rel="noopener noreferrer">
                                                    https://social-gizmo.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* VAT */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-green-700 mb-3">VAT
                                            Identification</h2>
                                        <p className="text-gray-700">DE368760166</p>
                                        <p className="text-xs text-gray-500 mt-1">VAT ID according to §27a German VAT
                                            Act</p>
                                    </div>
                                </div>
                            </div>

                            {/* Collaboration */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-green-700 mb-4">Partnerships</h2>
                                <p className="text-gray-700 mb-4">
                                    We are proud to be the <span className="font-semibold">technical partner</span> for
                                    this platform, developed in collaboration with:
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    <a href="https://aavasports.com/" target="_blank" rel="noopener noreferrer"
                                       className="transition hover:opacity-80">
                                        <img
                                            src="https://aavasports.com/wp-content/uploads/2025/08/Union.png"
                                            alt="Aavaa Sports"
                                            className="h-16 w-auto object-contain"
                                        />
                                    </a>
                                    <img
                                        src="/icons/KHA-logo.png"
                                        alt="Karachi Hockey Association"
                                        className="h-48 w-auto object-contain"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-4 text-center">
                                    This platform powers hockey tournaments and events for Aavaa Sports and the Karachi
                                    Hockey Association.
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-green-700 mb-4">Disclaimer</h2>
                                <div className="space-y-4 text-gray-600">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Liability for Content</h3>
                                        <p className="mt-1 text-sm">
                                            The contents of this website have been created with the utmost care.
                                            However, we cannot guarantee the accuracy, completeness, or timeliness of
                                            the content.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Liability for Links</h3>
                                        <p className="mt-1 text-sm">
                                            Our website contains links to external websites of third parties,
                                            over whose contents we have no control. Therefore, we cannot assume
                                            any liability for these external contents. The respective provider
                                            or operator of the linked pages is always responsible for their content.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Copyright</h3>
                                        <p className="mt-1 text-sm">
                                            The content and works created by the site operator on these pages
                                            are subject to German copyright law. Duplication, processing,
                                            distribution, or any form of commercialization beyond the scope
                                            of copyright law shall require the prior written consent of the respective
                                            author.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </PublicLayout>
    );
}
