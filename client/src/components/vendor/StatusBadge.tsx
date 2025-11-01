import React from "react";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    fulfilled: "bg-blue-100 text-blue-800",
    canceled: "bg-rose-100 text-rose-800",
  };
  const cls = map[norm] || "bg-gray-100 text-gray-800";
  return <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", cls)}>{status}</span>;
}

