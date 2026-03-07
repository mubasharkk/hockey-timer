import ApplicationLogo from '@/Components/ApplicationLogo';
import Footer from '@/Components/Footer';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/icons/background.png)',
                    backgroundRepeat: 'repeat',
                    opacity: 0.3,
                }}
            />

            <div className="relative z-10 flex min-h-screen flex-col">
                <div className="flex flex-1 flex-col items-center justify-center pt-6 sm:pt-0">
                    <div>
                        <Link href="/">
                            <ApplicationLogo className="h-72 fill-current text-green-700" />
                        </Link>
                    </div>

                    <div className="w-full overflow-hidden bg-white/90 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg backdrop-blur-sm">
                        {children}
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
