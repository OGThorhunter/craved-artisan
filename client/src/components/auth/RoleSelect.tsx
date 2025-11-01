import React from "react";

const ROLES = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "b2b_vendor", label: "B2B Vendor" },
  { value: "event_coordinator", label: "Event Coordinator" },
  { value: "dropoff_manager", label: "Drop-off Manager" },
];

interface RoleSelectProps {
  value: string;
  onChange: (role: string) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select your role</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
      >
        <option value="">Choose...</option>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

