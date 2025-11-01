import React from "react";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  error?: string | null;
}

export function AuthForm({ title, subtitle, onSubmit, children, footer, error }: AuthFormProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-8">
      <h1 className="text-xl font-semibold mb-1">{title}</h1>
      {subtitle ? <p className="text-sm text-gray-500 mb-4">{subtitle}</p> : null}
      {error ? (
        <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Continue
        </button>
      </form>
      {footer ? <div className="mt-4 text-sm text-gray-500">{footer}</div> : null}
    </div>
  );
}

