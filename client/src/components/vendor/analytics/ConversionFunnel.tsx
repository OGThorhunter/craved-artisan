"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// API base URL - same as in analytics service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const COLORS = ["#C5C5C5", "#A67F5B", "#5B6E02", "#7F232E"];

interface FunnelStep {
  stage: string;
  count: number;
  percentage: number;
  dropoff: number;
}

const aiSuggestions = [
  {
    type: "warning",
    title: "High Cart Abandonment",
    message: "43% of users abandon at checkout. Consider adding trust signals and simplifying the checkout process.",
    action: "Optimize Checkout",
    impact: "Could recover 150+ lost sales"
  },
  {
    type: "info",
    title: "Good View-to-Cart Rate",
    message: "71.7% of viewers add items to cart, which is above industry average. Your product presentation is working well.",
    action: "View Best Practices",
    impact: "Maintain current performance"
  },
  {
    type: "success",
    title: "Strong Purchase Conversion",
    message: "67.3% of checkout starters complete purchase, which is excellent. Your checkout process is effective.",
    action: "Analyze Success Factors",
    impact: "Keep current checkout flow"
  }
];

export function ConversionFunnel() {
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch conversion data from API
  const { data: conversionData, isLoading, error } = useQuery({
    queryKey: ['conversion-funnel'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/vendor/dev-user-id/analytics/conversion?range=monthly`);
      return response.data;
    }
  });

  // Transform API data to funnel format
  const funnelData = conversionData?.data ? [
    { stage: "Visitors", count: conversionData.data.visitors },
    { stage: "Page Views", count: conversionData.data.pageViews },
    { stage: "Add to Cart", count: conversionData.data.addToCart },
    { stage: "Checkout Started", count: conversionData.data.checkoutStarted },
    { stage: "Orders Completed", count: conversionData.data.ordersCompleted }
  ] : [];

  const total = funnelData[0]?.count ?? 1;

  const dataWithDropoff = funnelData.map((step, index) => {
    const dropoff =
      index === 0 ? 0 : ((funnelData[index - 1].count - step.count) / funnelData[index - 1].count) * 100;
    return {
      ...step,
      dropoff: index === 0 ? 0 : dropoff.toFixed(1),
      percentage: ((step.count / total) * 100).toFixed(1),
    };
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "danger":
        return "text-red-600 bg-red-50 border-red-200";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "danger":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "success":
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Zap size={16} className="text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#5B6E02]" />
            <h2 className="text-xl font-semibold text-gray-800">Conversion Funnel</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading conversion data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#5B6E02]" />
            <h2 className="text-xl font-semibold text-gray-800">Conversion Funnel</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading conversion data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-[#5B6E02]" />
          <h2 className="text-xl font-semibold text-gray-800">Conversion Funnel</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showSuggestions
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-300 hover:bg-gray-100"
            }`}
          >
            <Zap size={12} />
            {showSuggestions ? "Hide AI Insights" : "Show AI Insights"}
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && (
        <div className="mb-6">
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className={`p-3 border rounded-lg ${getSuggestionTypeColor(suggestion.type)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getSuggestionIcon(suggestion.type)}
                  <span className="font-medium">{suggestion.title}</span>
                </div>
                <p className="text-sm mb-2">{suggestion.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{suggestion.impact}</span>
                  <button className="text-sm underline hover:no-underline">
                    {suggestion.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataWithDropoff} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              tick={{ fill: "#333", fontSize: 14, fontWeight: 500 }}
              width={140}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [`${value}`, name === "dropoff" ? "Dropoff %" : "Users"]}
              labelFormatter={(label) => `Stage: ${label}`}
            />
            <Bar dataKey="count" barSize={30} radius={[4, 4, 4, 4]}>
              {funnelData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dropoff Analysis */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Dropoff Analysis</h3>
        <div className="space-y-1 text-sm text-gray-600">
          {dataWithDropoff.map((step, index) => {
            if (index === 0) return null;
            return (
              <p key={step.stage}>
                🔻 {step.dropoff}% dropped off from <strong>{funnelData[index - 1].stage}</strong> to{" "}
                <strong>{step.stage}</strong>
              </p>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">
            {conversionData?.meta?.conversionRate?.toFixed(1) || '20.2'}%
          </p>
          <p className="text-sm text-gray-600">Overall Conversion Rate</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-2xl font-bold text-orange-600">
            {formatNumber(conversionData?.data?.visitors - conversionData?.data?.ordersCompleted || 0)}
          </p>
          <p className="text-sm text-gray-600">Lost Opportunities</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">
            ${formatNumber(conversionData?.data?.revenue || 0)}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Track user journey from views to purchase with AI-powered optimization suggestions
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
            <TrendingUp size={16} />
            Optimize Funnel
          </button>
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Target size={16} />
            A/B Test
          </button>
        </div>
      </div>
    </div>
  );
} 