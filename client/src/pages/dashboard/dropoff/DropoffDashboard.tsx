import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getDropoffs } from "@/lib/api/dropoff";

export default function DropoffDashboard() {
  const { data } = useQuery(["dropoff", "locations"], getDropoffs);

  return (
    <DashboardLayout role="DROPOFF_MANAGER">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Drop-off Manager</h1>
        <div className="space-y-3">
          {data?.length ? (
            data.map((loc: any) => (
              <div key={loc.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{loc.name}</p>
                  <p className="text-xs text-gray-500">{loc.address}</p>
                </div>
                <p className="text-xs text-gray-400">{loc.pendingOrders || 0} pending</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No locations yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

