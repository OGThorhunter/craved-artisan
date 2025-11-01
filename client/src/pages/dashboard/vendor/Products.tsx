import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyVendorProducts } from "@/lib/api/vendor-dashboard";
import { formatCurrency } from "@/lib/formatters";

export default function VendorProducts() {
  const { data: products } = useQuery(["vendor", "products"], getMyVendorProducts);

  return (
    <DashboardLayout role="vendor">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Products</h1>
          <button className="rounded-md bg-emerald-600 text-white text-sm px-3 py-2">New Product</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products?.length ? (
            products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category || "Uncategorized"}</p>
                <p className="text-sm font-semibold">
                  {product.price ? formatCurrency(product.price) : "$0.00"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No products yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

