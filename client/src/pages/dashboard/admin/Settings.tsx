import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Admin Settings</h1>
        {/* TODO: Add settings content */}
      </div>
    </DashboardLayout>
  );
}

