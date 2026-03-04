import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function PublicLayout({ children, fullWidth = false }) {
    return (
        <div className={fullWidth ? 'w-full' : 'mx-auto w-full max-w-6xl px-4'}>
            <div className="flex justify-center py-6">
                <Link href="/" className="flex items-center gap-3 rounded-2xl border-2 border-green-100 bg-gradient-to-r from-green-50 to-white px-8 py-4 shadow-lg transition hover:shadow-xl hover:border-green-200">
                    <ApplicationLogo className="h-14 w-14 fill-current text-green-700" />
                    <span className="text-2xl font-bold text-gray-900">HockeyApp</span>
                </Link>
            </div>
            <div className="mx-0 sm:mx-10 overflow-hidden rounded-2xl">{children}</div>
        </div>
    );
}
