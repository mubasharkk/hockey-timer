export default function TeamLogo({ src, alt = 'Logo', height = 'h-16', width = 'w-16', className = '' }) {
    if (!src) return null;

    return (
        <img
            src={src}
            alt={alt}
            className={`${height} ${width} object-contain ${className}`}
        />
    );
}
