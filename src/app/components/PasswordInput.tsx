import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    className: string;
    autoComplete?: string;
    autoFocus?: boolean;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
}

// Password field with a show/hide eye button
export function PasswordInput({ value, onChange, className, ...inputProps }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
        <div className="relative">
            <input
                {...inputProps}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${className} pe-12`}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute inset-y-0 end-0 px-4 flex items-center text-[#8B7355] hover:text-[#2C2C2C] transition-colors"
                tabIndex={-1}
                aria-label={visible ? 'Hide' : 'Show'}
            >
                <Icon className="w-5 h-5" />
            </button>
        </div>
    );
}
