import ApplicationLogo from '@/Components/ApplicationLogo';
import Footer from '@/Components/Footer';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <div className="flex flex-1 flex-col items-center justify-center pt-6 sm:pt-0">
                <div>
                    <Link href="/">
                        <ApplicationLogo className="h-72 fill-current text-gray-500" />
                    </Link>
                </div>

                <div className="w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
                </div>
            </div>

            <Footer />
        </div>
    );
}
