import React from "react";
import { useRoute } from "wouter";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getEventInventory } from "@/lib/api/coordinator";
import { InventoryItemCard } from "@/components/vendor/InventoryItemCard";

export default function EventInventory() {
  const [, params] = useRoute<{ eventId: string }>("/dashboard/event-coordinator/events/:eventId/inventory");
  const eventId = params?.eventId || "";
  
  const { data: inventory } = useQuery(
    ["coordinator", "events", eventId, "inventory"],
    () => getEventInventory(eventId),
    { enabled: !!eventId }
  );

  return (
    <DashboardLayout role="EVENT_COORDINATOR">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Event Inventory</h1>
        <div className="space-y-3">
          {inventory?.length ? (
            inventory.map((item: any) => <InventoryItemCard key={item.id} item={item} />)
          ) : (
            <p className="text-sm text-gray-500">No inventory items.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

