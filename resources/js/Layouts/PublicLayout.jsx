import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function PublicLayout({ children, fullWidth = false }) {
    return (
        <div className={fullWidth ? 'w-full' : 'mx-auto w-full max-w-6xl px-4'}>
            <div className="mx-0 sm:mx-10 overflow-hidden rounded-2xl">{children}</div>
            <div className="flex justify-center">
                <ApplicationLogo className="h-48 fill-current text-green-700" />
            </div>
        </div>
    );
}
