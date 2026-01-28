import { Link, usePage } from '@inertiajs/react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const user = usePage().props.auth?.user;

    return (
        <footer className="border-t border-green-900 bg-primary-950 text-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:text-left">
                    <p className="text-sm text-green-200">
                        &copy; {currentYear} Karachi Hockey. All rights reserved.
                        Developed by <a href="https://social-gizmo.com" target={'_blank'}>MK IT Consulting</a>
                    </p>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-sm text-green-200 transition hover:text-white"
                            >
                                Dashboard
                            </Link>
                        ) : null}
                        <Link
                            href={route('pages.show', 'privacy')}
                            className="text-sm text-green-200 transition hover:text-white"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href={route('pages.show', 'terms')}
                            className="text-sm text-green-200 transition hover:text-white"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href={route('pages.show', 'imprint')}
                            className="text-sm text-green-200 transition hover:text-white"
                        >
                            Imprint
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
