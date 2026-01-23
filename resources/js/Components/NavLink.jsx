import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-green-300 text-white focus:border-green-200'
                    : 'border-transparent text-green-200 hover:border-green-400 hover:text-white focus:border-green-400 focus:text-white') +
                className
            }
        >
            {children}
        </Link>
    );
}
