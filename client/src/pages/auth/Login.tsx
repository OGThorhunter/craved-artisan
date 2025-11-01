import React, { useState } from "react";
import { AuthForm } from "../../components/auth/AuthForm";
import { login } from "../../lib/api/auth";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      navigate("/dashboard"); // server will redirect by role if you set it up
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || "Unable to login. Please try again.";
      try {
        const parsed = JSON.parse(errorMessage);
        setError(parsed.body?.message || errorMessage);
      } catch {
        setError(errorMessage);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm title="Welcome back" subtitle="Sign in to your Craved Artisan account" onSubmit={handleSubmit} error={error}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full rounded-md border-gray-300 text-sm" />
        </div>
      </AuthForm>
    </div>
  );
}

