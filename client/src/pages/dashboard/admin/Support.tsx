import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminTable } from "@/components/admin/AdminTable";

export default function Support() {
  // TODO: Add React Query for fetching support tickets
  
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Support Tickets</h1>
        <AdminTable headers={["ID", "Subject", "Status", "Priority", "Created", "Actions"]}>
          <tr>
            <td className="px-4 py-2">No tickets yet.</td>
          </tr>
        </AdminTable>
      </div>
    </DashboardLayout>
  );
}

