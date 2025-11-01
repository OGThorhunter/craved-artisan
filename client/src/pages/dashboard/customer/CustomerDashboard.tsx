import React from "react";
import { DashboardLayout } from "../../../layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile, getCustomerOrders } from "../../../lib/api/customer";
import { formatCurrency } from "../../../lib/formatters";

export default function CustomerDashboard() {
  const { data: profile } = useQuery({
    queryKey: ["customer", "profile"],
    queryFn: getCustomerProfile,
  });
  const { data: orders } = useQuery({
    queryKey: ["customer", "orders"],
    queryFn: getCustomerOrders,
  });

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome{profile?.name ? `, ${profile.name}` : ""}</h1>
          <p className="text-gray-500 text-sm">Manage your orders, favorites, and pickup windows.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-semibold">{orders ? orders.length : 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Lifetime Spend</p>
            <p className="text-2xl font-semibold">
              {profile?.lifetimeSpend ? formatCurrency(profile.lifetimeSpend) : "$0.00"}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Next Pickup</p>
            <p className="text-sm">{profile?.nextPickup || "No upcoming pickups"}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <div className="divide-y">
            {orders && orders.length ? (
              orders.map((order: any) => (
                <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.status}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No orders yet.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

