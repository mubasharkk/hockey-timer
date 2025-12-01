export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/logo.png"
            alt="HockeyApp logo"
            className={`h-10 w-10 object-contain ${className}`.trim()}
            {...props}
        />
    );
}
