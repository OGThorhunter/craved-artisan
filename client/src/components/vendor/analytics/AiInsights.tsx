"use client";

import { Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";

const insights = [
  {
    type: "opportunity",
    icon: <TrendingUp size={20} className="text-green-600" />,
    title: "Revenue Opportunity",
    description: "Your Artisan Sourdough has 23% higher demand on weekends. Consider increasing production by 15% on Fridays.",
    action: "Adjust production schedule",
  },
  {
    type: "alert",
    icon: <AlertTriangle size={20} className="text-orange-500" />,
    title: "Inventory Alert",
    description: "Blueberry Muffins stock is running low. Based on current trends, you'll need to restock within 2 days.",
    action: "Order ingredients now",
  },
  {
    type: "optimization",
    icon: <Target size={20} className="text-blue-600" />,
    title: "Pricing Optimization",
    description: "Your Croissant Assortment has room for a 5% price increase without affecting demand. This could add $100+ monthly revenue.",
    action: "Review pricing strategy",
  },
  {
    type: "insight",
    icon: <Lightbulb size={20} className="text-purple-600" />,
    title: "Customer Insight",
    description: "Customers who buy Artisan Sourdough are 3x more likely to purchase Chocolate Chip Cookies. Consider bundling.",
    action: "Create product bundle",
  },
];

export function AiInsights() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={20} className="text-[#5B6E02]" />
        <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-[#5B6E02] transition-colors">
            <div className="flex items-start gap-3">
              {insight.icon}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                <button className="text-sm text-[#5B6E02] font-medium hover:text-[#7F232E] transition-colors">
                  {insight.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 