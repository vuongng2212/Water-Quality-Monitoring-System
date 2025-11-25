import React, { forwardRef } from 'react';
import { inputVariants } from '../../utils/theme';

const Input = forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    containerClassName = '',
    labelClassName = '',
    ...props
}, ref) => {
    const inputClasses = error
        ? inputVariants.error
        : inputVariants.default;

    const finalInputClasses = `${inputClasses} ${className}`;

    return (
        <div className={`space-y-1 ${containerClassName}`}>
            {label && (
                <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                className={finalInputClasses}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;