import React from "react";
import { useRoute } from "wouter";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function UserDetail() {
  const [, params] = useRoute<{ id: string }>("/control/users/:id");
  
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">User Detail</h1>
        <p className="text-sm text-gray-500">User ID: {params?.id}</p>
        {/* TODO: Add user details content */}
      </div>
    </DashboardLayout>
  );
}

