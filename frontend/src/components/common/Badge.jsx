const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        critical: 'bg-danger-100 text-danger-700',
        high: 'bg-warning-100 text-warning-700',
        medium: 'bg-blue-100 text-blue-700',
        low: 'bg-success-100 text-success-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;