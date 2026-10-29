import { useState } from 'react';

export default function PasswordField({
  id,
  name,
  label,
  labelClassName = '',
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  inputClassName = '',
  helperText,
  rightHeaderAction,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      {(label || rightHeaderAction) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={id}
              className={
                labelClassName ||
                'block text-xs font-semibold text-gray-700 uppercase tracking-wider'
              }
            >
              {label}
            </label>
          )}
          {rightHeaderAction}
        </div>
      )}

      <div className="relative">
        <input
          id={id}
          name={name || id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-gray-300 pl-3.5 pr-11 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:cursor-not-allowed ${inputClassName}`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'View password'}
        >
          {showPassword ? (
            /* Eye slash icon (hide) */
            <svg
              className="h-5 w-5 text-gray-500 hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          ) : (
            /* Eye icon (view) */
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {helperText && <p className="mt-1 text-[11px] text-gray-400">{helperText}</p>}
    </div>
  );
}

