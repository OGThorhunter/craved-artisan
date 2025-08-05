"use client";

import { mockAnalyticsData } from "@/mock/analyticsData";
import { TrendingUp, Package } from "lucide-react";

export function TopProducts() {
  const topProducts = mockAnalyticsData.topProducts;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Package size={20} className="text-[#5B6E02]" />
        <h2 className="text-xl font-semibold text-gray-800">Top Performing Products</h2>
      </div>
      
      <div className="space-y-3">
        {topProducts.map((product, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5B6E02] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.sales} units sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#5B6E02]">${product.revenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={12} />
                <span>+{Math.floor(Math.random() * 20 + 10)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 