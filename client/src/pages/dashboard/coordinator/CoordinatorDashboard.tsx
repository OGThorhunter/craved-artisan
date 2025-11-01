import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyEvents } from "@/lib/api/coordinator";
import { Link } from "wouter";

export default function CoordinatorDashboard() {
  const { data: events } = useQuery(["coordinator", "events"], getMyEvents);

  return (
    <DashboardLayout role="EVENT_COORDINATOR">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Event Coordinator</h1>
        <p className="text-sm text-gray-500">Manage upcoming markets, vendor applications, and check-ins.</p>
        <div className="space-y-3">
          {events?.length ? (
            events.map((ev: any) => (
              <div key={ev.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{ev.name || ev.title || 'Unnamed Event'}</p>
                  <p className="text-xs text-gray-500">{ev.date || ev.startDate}</p>
                  <p className="text-xs text-gray-400">{ev.location || ev.venue}</p>
                </div>
                <Link
                  href={`/dashboard/event-coordinator/events/${ev.id}/inventory`}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Inventory
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No events yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

