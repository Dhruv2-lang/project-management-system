import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const BASE =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
const VALID = 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30';
const INVALID = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30';

function controlClass(invalid: boolean | undefined, extra: string | undefined): string {
  return `${BASE} ${invalid ? INVALID : VALID} ${extra ?? ''}`;
}

function describedBy(id: string | undefined, invalid: boolean | undefined): string | undefined {
  return invalid && id ? `${id}-error` : undefined;
}

interface FieldProps {
  /** Must match the `id` of the control inside. */
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy(rest.id, invalid)}
      className={controlClass(invalid, className)}
      {...rest}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function TextArea({ invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy(rest.id, invalid)}
      className={controlClass(invalid, className)}
      {...rest}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy(rest.id, invalid)}
      className={controlClass(invalid, className)}
      {...rest}
    >
      {children}
    </select>
  );
}
