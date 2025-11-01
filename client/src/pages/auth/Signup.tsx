import React, { useState } from "react";
import { AuthForm } from "../../components/auth/AuthForm";
import { RoleSelect } from "../../components/auth/RoleSelect";
import { signup } from "../../lib/api/auth";
import { useLocation } from "wouter";

export default function Signup() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState("customer");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      await signup({ email, password, role, name });
      // after signup, go to onboarding or dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || "Unable to create account. Please try again.";
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
      <AuthForm title="Create your account" subtitle="Join the Movement" onSubmit={handleSubmit} error={error}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" type="text" className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <RoleSelect value={role} onChange={setRole} />
      </AuthForm>
    </div>
  );
}

