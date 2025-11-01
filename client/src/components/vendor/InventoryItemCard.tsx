import React from "react";
import { formatNumber } from "@/lib/formatters";

export function InventoryItemCard({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-xs text-gray-500">
          SKU: {item.sku || "N/A"} • {item.category || "Uncategorized"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{formatNumber(item.quantity ?? 0, 0)}</p>
        <p className="text-xs text-gray-400">in stock</p>
      </div>
    </div>
  );
}

