import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminTable } from "@/components/admin/AdminTable";

export default function UsersList() {
  // TODO: Add React Query for fetching users
  // For now, just show the structure with DashboardLayout
  
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Users</h1>
        <AdminTable headers={["Name", "Email", "Role", "Status", "Actions"]}>
          <tr>
            <td className="px-4 py-2">No users yet.</td>
          </tr>
        </AdminTable>
      </div>
    </DashboardLayout>
  );
}

