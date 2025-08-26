"use client";

import { useState } from "react";
import { mockCashFlow } from "@/mock/analyticsData";
import { TrendingUp, TrendingDown, AlertTriangle, Download, Calendar, BarChart3, Eye, EyeOff } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Line, Bar } from "recharts";

// Extended mock data for time-series cash flow
const mockTimeSeriesData = {
  "30-day": [
    { date: "Aug 01", inflows: 0, outflows: 0, cash: 1200 },
    { date: "Aug 02", inflows: 600, outflows: 0, cash: 1800 },
    { date: "Aug 03", inflows: 300, outflows: 150, cash: 1950 },
    { date: "Aug 04", inflows: 450, outflows: 200, cash: 2200 },
    { date: "Aug 05", inflows: 0, outflows: 300, cash: 1900 },
    { date: "Aug 06", inflows: 800, outflows: 150, cash: 2550 },
    { date: "Aug 07", inflows: 200, outflows: 400, cash: 2350 },
    { date: "Aug 08", inflows: 650, outflows: 250, cash: 2750 },
    { date: "Aug 09", inflows: 0, outflows: 500, cash: 2250 },
    { date: "Aug 10", inflows: 750, outflows: 200, cash: 2800 },
    { date: "Aug 11", inflows: 300, outflows: 350, cash: 2750 },
    { date: "Aug 12", inflows: 900, outflows: 150, cash: 3500 },
    { date: "Aug 13", inflows: 150, outflows: 600, cash: 3050 },
    { date: "Aug 14", inflows: 500, outflows: 300, cash: 3250 },
    { date: "Aug 15", inflows: 0, outflows: 800, cash: 2450 },
    { date: "Aug 16", inflows: 700, outflows: 200, cash: 2950 },
    { date: "Aug 17", inflows: 250, outflows: 450, cash: 2750 },
    { date: "Aug 18", inflows: 850, outflows: 100, cash: 3500 },
    { date: "Aug 19", inflows: 0, outflows: 700, cash: 2800 },
    { date: "Aug 20", inflows: 600, outflows: 250, cash: 3150 },
    { date: "Aug 21", inflows: 400, outflows: 400, cash: 3150 },
    { date: "Aug 22", inflows: 950, outflows: 150, cash: 3950 },
    { date: "Aug 23", inflows: 100, outflows: 650, cash: 3400 },
    { date: "Aug 24", inflows: 550, outflows: 300, cash: 3650 },
    { date: "Aug 25", inflows: 0, outflows: 900, cash: 2750 },
    { date: "Aug 26", inflows: 750, outflows: 200, cash: 3300 },
    { date: "Aug 27", inflows: 300, outflows: 500, cash: 3100 },
    { date: "Aug 28", inflows: 800, outflows: 100, cash: 3800 },
    { date: "Aug 29", inflows: 150, outflows: 750, cash: 3200 },
    { date: "Aug 30", inflows: 650, outflows: 250, cash: 3600 },
  ],
  "90-day": [
    { date: "Jun 01", inflows: 0, outflows: 0, cash: 1200 },
    { date: "Jun 15", inflows: 2500, outflows: 1800, cash: 1900 },
    { date: "Jul 01", inflows: 3000, outflows: 2200, cash: 2700 },
    { date: "Jul 15", inflows: 2800, outflows: 2400, cash: 3100 },
    { date: "Aug 01", inflows: 3200, outflows: 2000, cash: 4300 },
    { date: "Aug 15", inflows: 2900, outflows: 2600, cash: 4600 },
    { date: "Aug 30", inflows: 3100, outflows: 2800, cash: 4900 },
  ]
};

const predictiveWarnings = [
  {
    type: "warning",
    title: "Cash Flow Alert",
    message: "Cash may drop below $500 by Sept 15 due to equipment payment + restock",
    date: "2024-09-15",
    impact: "Potential -$800 cash flow"
  },
  {
    type: "info",
    title: "Seasonal Pattern",
    message: "Outflows typically increase 25% in September due to back-to-school demand",
    date: "2024-09-01",
    impact: "Plan for higher expenses"
  },
  {
    type: "success",
    title: "Strong Recovery",
    message: "Cash flow expected to improve by Oct 1 with holiday season orders",
    date: "2024-10-01",
    impact: "Projected +$1,200 inflow"
  }
];

type TimeRange = "30-day" | "90-day" | "custom";

export function CashFlowChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30-day");
  const [showChart, setShowChart] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  
  const { startingCash, inflows, outflows } = mockCashFlow;

  const totalInflows = inflows.reduce((sum, i) => sum + i.amount, 0);
  const totalOutflows = outflows.reduce((sum, o) => sum + o.amount, 0);
  const netChange = totalInflows - totalOutflows;
  const endingCash = startingCash + netChange;

  const chartData = mockTimeSeriesData[timeRange] || mockTimeSeriesData["30-day"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    const csvContent = [
      "Date,Inflows,Outflows,Cash Balance",
      ...chartData.map(item => `${item.date},${item.inflows},${item.outflows},${item.cash}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "success":
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return <Calendar size={16} className="text-blue-600" />;
    }
  };

  const getWarningColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl mt-6 max-w-6xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Cash Flow Analysis</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showWarnings
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <AlertTriangle size={12} />
            {showWarnings ? "Hide Warnings" : "Show Warnings"}
          </button>
          <button
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showChart
                ? "bg-[#7F232E] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {showChart ? <EyeOff size={12} /> : <Eye size={12} />}
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#5B6E02] text-white rounded-full hover:bg-[#4A5A01] transition-colors"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Time Range Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-2">
          {["30-day", "90-day"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as TimeRange)}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                timeRange === range
                  ? "bg-[#7F232E] text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current Cash:</span> {formatCurrency(endingCash)}
        </div>
      </div>

      {/* Predictive Warnings */}
      {showWarnings && (
        <div className="mb-6">
          <div className="space-y-3">
            {predictiveWarnings.map((warning, idx) => (
              <div key={idx} className={`p-3 border rounded-lg ${getWarningColor(warning.type)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getWarningIcon(warning.type)}
                  <span className="font-medium">{warning.title}</span>
                </div>
                <p className="text-sm mb-2">{warning.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{warning.impact}</span>
                  <span className="text-sm">{new Date(warning.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stacked Area Chart */}
      {showChart && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Cash Flow Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name === "inflows" ? "Inflows" : name === "outflows" ? "Outflows" : "Cash Balance"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="inflows" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Inflows"
              />
              <Area 
                type="monotone" 
                dataKey="outflows" 
                stackId="1"
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6}
                name="Outflows"
              />
              <Line 
                type="monotone" 
                dataKey="cash" 
                stroke="#5B6E02" 
                strokeWidth={3}
                name="Cash Balance"
                dot={{ fill: "#5B6E02", strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Summary */}
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Cash Flow Summary</h3>
          
          <div className="flex justify-between">
            <span className="text-gray-700">Starting Cash</span>
            <span className="text-gray-800 font-medium">${startingCash.toFixed(2)}</span>
          </div>

          <div>
            <p className="font-medium text-gray-700 mt-3 mb-1">Inflows:</p>
            <div className="space-y-1">
              {inflows.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{i.label}</span>
                  <span className="text-green-700">+${i.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-700 mt-3 mb-1">Outflows:</p>
            <div className="space-y-1">
              {outflows.map((o, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{o.label}</span>
                  <span className="text-red-600">-${o.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between font-semibold">
            <span>Net Change</span>
            <span className={netChange >= 0 ? "text-green-700" : "text-red-600"}>
              {netChange >= 0 ? "+" : "-"}${Math.abs(netChange).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Ending Cash</span>
            <span className={endingCash >= 0 ? "text-green-700" : "text-red-600"}>
              ${endingCash.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
              <Download size={16} />
              Export to QuickBooks
            </button>
            
            <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar size={16} />
              Set Cash Flow Alerts
            </button>
            
            <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 size={16} />
              Generate Cash Forecast
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Cash Flow Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cash Runway</span>
                <span className="font-medium text-green-600">45 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Daily Burn</span>
                <span className="font-medium text-red-600">-$86.33</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Safety Buffer</span>
                <span className="font-medium text-green-600">$1,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 