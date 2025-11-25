import React from 'react';
import { cardVariants } from '../../utils/theme';

const Card = ({
    children,
    variant = 'default',
    className = '',
    padding = true,
    ...props
}) => {
    const baseClasses = 'bg-white border border-gray-200 transition-shadow duration-200';
    const variantClasses = cardVariants[variant] || cardVariants.default;
    const paddingClasses = padding ? '' : 'p-0';

    const classes = `${baseClasses} ${variantClasses} ${paddingClasses} ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
        {children}
    </div>
);

const CardContent = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 ${className}`} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`} {...props}>
        {children}
    </div>
);

export { Card, CardHeader, CardContent, CardFooter };
export default Card;