import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PublicLayout({ children, fullWidth = false }) {
    return (
        <div className={fullWidth ? 'w-full' : 'mx-auto w-full max-w-6xl px-4'}>
            <div className="flex justify-center py-6">
                <ApplicationLogo className="h-12 w-12 fill-current text-gray-600" />
            </div>
            <div className="mx-10 overflow-hidden rounded-2xl">{children}</div>
        </div>
    );
}
