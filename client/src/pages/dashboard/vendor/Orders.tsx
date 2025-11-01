import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyVendorOrders } from "@/lib/api/vendor-dashboard";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function VendorOrders() {
  const { data: orders } = useQuery(["vendor", "orders"], getMyVendorOrders);

  return (
    <DashboardLayout role="vendor">
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Orders</h1>
        <div className="bg-white rounded-lg border divide-y">
          {orders?.length ? (
            orders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Order #{order.orderNumber || order.id}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                  <StatusBadge status={order.status || "pending"} />
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-gray-500">No orders yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

