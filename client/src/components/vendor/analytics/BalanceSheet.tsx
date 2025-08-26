"use client";

import { useState } from "react";
import { mockBalanceSheet } from "@/mock/analyticsData";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Lightbulb, Calendar, TrendingDown, Calculator } from "lucide-react";

// Historical balance sheet data with depreciation
const historicalBalanceSheets = {
  "2024-08-01": {
    assets: [
      { label: "Cash", amount: 1200 },
      { label: "Inventory (Raw + Baked)", amount: 850 },
      { label: "Equipment (Oven, Mixer)", amount: 5200 },
    ],
    liabilities: [
      { label: "Outstanding Invoices", amount: 450 },
      { label: "Equipment Lease", amount: 1400 },
      { label: "Credit Card Balance", amount: 280 },
    ],
  },
  "2024-07-01": {
    assets: [
      { label: "Cash", amount: 980 },
      { label: "Inventory (Raw + Baked)", amount: 920 },
      { label: "Equipment (Oven, Mixer)", amount: 5400 },
    ],
    liabilities: [
      { label: "Outstanding Invoices", amount: 380 },
      { label: "Equipment Lease", amount: 1400 },
      { label: "Credit Card Balance", amount: 220 },
    ],
  },
  "2024-06-01": {
    assets: [
      { label: "Cash", amount: 750 },
      { label: "Inventory (Raw + Baked)", amount: 1100 },
      { label: "Equipment (Oven, Mixer)", amount: 5600 },
    ],
    liabilities: [
      { label: "Outstanding Invoices", amount: 320 },
      { label: "Equipment Lease", amount: 1400 },
      { label: "Credit Card Balance", amount: 180 },
    ],
  },
};

// Depreciation rates (monthly)
const DEPRECIATION_RATES = {
  "Equipment (Oven, Mixer)": 0.02, // 2% monthly depreciation
};

// AI Insights based on financial ratios
const generateAIInsights = (assets: any[], liabilities: any[], totalAssets: number, totalLiabilities: number) => {
  const insights = [];
  
  // Inventory analysis
  const inventory = assets.find(a => a.label.includes("Inventory"));
  const inventoryRatio = inventory ? (inventory.amount / totalAssets) * 100 : 0;
  
  if (inventoryRatio > 25) {
    insights.push({
      type: "warning",
      message: `💡 Inventory value is ${inventoryRatio.toFixed(0)}% of assets — consider a weekend flash sale to increase cash on hand`,
      impact: `Could free up $${(inventory.amount * 0.3).toFixed(0)}-${(inventory.amount * 0.5).toFixed(0)} cash`,
      action: "Create Flash Sale"
    });
  }
  
  // Equipment depreciation analysis
  const equipment = assets.find(a => a.label.includes("Equipment"));
  if (equipment) {
    const monthlyDepreciation = equipment.amount * DEPRECIATION_RATES["Equipment (Oven, Mixer)"];
    insights.push({
      type: "info",
      message: `📉 Equipment depreciating at $${monthlyDepreciation.toFixed(0)}/month — consider maintenance schedule`,
      impact: "Maintains equipment value",
      action: "Schedule Maintenance"
    });
  }
  
  // Debt-to-equity analysis
  const equity = totalAssets - totalLiabilities;
  const debtToEquity = totalLiabilities / equity;
  
  if (debtToEquity > 0.5) {
    insights.push({
      type: "warning",
      message: `⚠️ Debt-to-equity ratio is ${debtToEquity.toFixed(2)} — consider debt reduction strategies`,
      impact: "Improve financial stability",
      action: "Review Debt"
    });
  } else {
    insights.push({
      type: "success",
      message: `✅ Strong financial position with ${(equity / totalAssets * 100).toFixed(0)}% equity ratio`,
      impact: "Good borrowing capacity",
      action: "View Opportunities"
    });
  }
  
  return insights;
};

export function BalanceSheet() {
  const [selectedDate, setSelectedDate] = useState("2024-08-01");
  
  // Get current balance sheet data
  const currentData = selectedDate === "2024-08-01" ? mockBalanceSheet : historicalBalanceSheets[selectedDate as keyof typeof historicalBalanceSheets];
  const { assets, liabilities } = currentData;

  // Apply depreciation to equipment
  const assetsWithDepreciation = assets.map(asset => {
    if (asset.label.includes("Equipment")) {
      const depreciationRate = DEPRECIATION_RATES["Equipment (Oven, Mixer)"];
      const monthsSincePurchase = 6; // Assuming 6 months since purchase
      const depreciation = asset.amount * depreciationRate * monthsSincePurchase;
      return {
        ...asset,
        originalAmount: asset.amount + depreciation,
        depreciation: depreciation,
        amount: asset.amount
      };
    }
    return asset;
  });

  const totalAssets = assetsWithDepreciation.reduce((sum, a) => sum + a.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const equity = totalAssets - totalLiabilities;

  // Generate AI insights
  const aiInsights = generateAIInsights(assetsWithDepreciation, liabilities, totalAssets, totalLiabilities);

  // Chart data for donut chart
  const chartData = [
    { name: "Assets", value: totalAssets, color: "#10B981" },
    { name: "Liabilities", value: totalLiabilities, color: "#EF4444" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl mt-6 max-w-6xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Balance Sheet</h2>
        
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-600" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
            aria-label="Select balance sheet date"
          >
            <option value="2024-08-01">August 2024</option>
            <option value="2024-07-01">July 2024</option>
            <option value="2024-06-01">June 2024</option>
          </select>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <div className="mb-6">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 mb-3 ${
              insight.type === "warning" 
                ? "bg-orange-50 border-orange-400 text-orange-800" 
                : insight.type === "success"
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-blue-50 border-blue-400 text-blue-800"
            }`}>
              <div className="flex items-start gap-3">
                <Lightbulb size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium mb-1">{insight.message}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">{insight.impact}</span>
                    <button className="underline hover:no-underline font-medium">
                      {insight.action}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assets vs Liabilities Donut Chart */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-800 mb-4">Assets vs Liabilities</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {formatCurrency(equity)}
                </div>
                <div className="text-xs text-gray-600">Equity</div>
              </div>
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Liabilities</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet Details */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-2">Assets:</p>
              <div className="space-y-1">
                {assetsWithDepreciation.map((a, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{a.label}</span>
                    <div className="text-right">
                      <span className="text-green-700 font-medium">${a.amount.toFixed(2)}</span>
                      {a.depreciation && (
                        <div className="text-xs text-gray-500">
                          <TrendingDown size={10} className="inline mr-1" />
                          -${a.depreciation.toFixed(2)} dep.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-800 mt-2 pt-2 border-t">
                  <span>Total Assets</span>
                  <span>${totalAssets.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Liabilities:</p>
              <div className="space-y-1">
                {liabilities.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{l.label}</span>
                    <span className="text-red-600 font-medium">-${l.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-800 mt-2 pt-2 border-t">
                  <span>Total Liabilities</span>
                  <span>-${totalLiabilities.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Equity</span>
            <span className={equity >= 0 ? "text-green-700" : "text-red-600"}>
              ${equity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 