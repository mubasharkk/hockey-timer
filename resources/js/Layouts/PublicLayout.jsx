import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import Footer from "@/Components/Footer.jsx";

export default function PublicLayout({ children, fullWidth = false }) {
    return (
        <div className="relative min-h-screen">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/icons/background.png)',
                    backgroundRepeat: 'repeat',
                }}
            />

            <div className="relative z-10">
                <div className={fullWidth ? 'w-full min-h-screen' : 'min-h-screen mx-auto w-full max-w-6xl px-4 '}>
                    <div className="mx-0 sm:mx-10 overflow-hidden rounded-2xl">{children}</div>
                    <div className="mt-10">
                        <Footer/>
                    </div>
                </div>
            </div>
        </div>
    );
}
