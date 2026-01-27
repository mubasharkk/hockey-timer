export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/icons/logo.png"
            alt="HockeyApp logo"
            className={`object-contain ${className}`.trim()}
            {...props}
        />
    );
}
