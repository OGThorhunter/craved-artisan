import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyVendorInventory } from "@/lib/api/vendor-dashboard";
import { InventoryItemCard } from "@/components/vendor/InventoryItemCard";

export default function VendorInventory() {
  const { data: inventory } = useQuery(["vendor", "inventory"], getMyVendorInventory);

  return (
    <DashboardLayout role="vendor">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Inventory</h1>
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

