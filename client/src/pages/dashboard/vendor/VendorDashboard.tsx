import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyVendorProfile, getMyVendorOrders } from "@/lib/api/vendor-dashboard";
import { MetricCard } from "@/components/vendor/MetricCard";

export default function VendorDashboard() {
  const { data: profile } = useQuery(["vendor", "me"], getMyVendorProfile);
  const { data: orders } = useQuery(["vendor", "orders"], getMyVendorOrders);

  return (
    <DashboardLayout role="vendor">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {profile?.name ? profile.name : "Vendor Dashboard"}
          </h1>
          <p className="text-sm text-gray-500">
            Monitor sales, manage products, and keep your storefront live.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Today's Orders" value={orders?.todayCount ?? 0} />
          <MetricCard label="Month Revenue" value={orders?.monthRevenue ?? "$0.00"} />
          <MetricCard label="Low Inventory" value={profile?.lowInventoryCount ?? 0} variant="warning" />
          <MetricCard label="Vacation Mode" value={profile?.vacationMode ? "On" : "Off"} variant={profile?.vacationMode ? "danger" : "default"} />
        </div>

        {/* You can drop in "smart restock" or "recent orders" here later */}
      </div>
    </DashboardLayout>
  );
}

