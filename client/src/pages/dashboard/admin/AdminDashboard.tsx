import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/vendor/MetricCard";
import { getAdminOverview } from "@/lib/api/admin";

export default function AdminDashboard() {
  const { data } = useQuery(["admin", "overview"], getAdminOverview);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Platform Control Room</h1>
          <p className="text-sm text-gray-500">Monitor vendors, revenue, support, and compliance.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active Vendors" value={data?.activeVendors ?? 0} />
          <MetricCard label="Active Customers" value={data?.activeCustomers ?? 0} />
          <MetricCard label="MTD Revenue" value={data?.mtdRevenue ?? "$0.00"} />
          <MetricCard label="Open Tickets" value={data?.openTickets ?? 0} variant="warning" />
        </div>
      </div>
    </DashboardLayout>
  );
}

