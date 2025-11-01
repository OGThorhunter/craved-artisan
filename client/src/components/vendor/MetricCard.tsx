import React from "react";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function MetricCard({ label, value, hint, variant = "default" }: MetricCardProps) {
  const border =
    variant === "success"
      ? "border-emerald-200"
      : variant === "warning"
      ? "border-amber-200"
      : variant === "danger"
      ? "border-rose-200"
      : "border-gray-200";

  return (
    <div className={cn("bg-white rounded-lg border p-4", border)}>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}

