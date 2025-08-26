"use client";

import { useState } from "react";
import { mockProfitLossData } from "@/mock/analyticsData";
import { Download, Calculator, AlertTriangle, TrendingUp, Settings, FileText, Zap } from "lucide-react";

type Timeframe = "monthly" | "quarterly";

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  type: "fixed" | "variable";
  source: "manual" | "stripe" | "imported";
  date: string;
}

interface AIInsight {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  impact: string;
  action: string;
}

// Mock expense categories for demonstration
const mockExpenses: ExpenseCategory[] = [
  { id: "1", name: "Ingredients & Supplies", amount: 2800, type: "variable", source: "manual", date: "2024-08-15" },
  { id: "2", name: "Stripe Processing Fees", amount: 450, type: "variable", source: "stripe", date: "2024-08-15" },
  { id: "3", name: "Rent & Utilities", amount: 800, type: "fixed", source: "manual", date: "2024-08-01" },
  { id: "4", name: "Marketing & Advertising", amount: 200, type: "variable", source: "manual", date: "2024-08-10" },
];

const aiInsights: AIInsight[] = [
  {
    type: "warning",
    title: "High COGS Ratio",
    message: "Ingredients exceeded 30% of revenue — consider supplier optimization?",
    impact: "Could improve margin by 5-8%",
    action: "Review Suppliers"
  },
  {
    type: "success",
    title: "Strong Gross Margin",
    message: "61% gross margin is above industry average for food service.",
    impact: "Maintain current pricing strategy",
    action: "View Details"
  },
  {
    type: "info",
    title: "Expense Optimization",
    message: "Fixed expenses are 11% of revenue, which is well-managed.",
    impact: "Good cost control",
    action: "Analyze Trends"
  }
];

export function ProfitLossStatement() {
  const [range, setRange] = useState<Timeframe>("monthly");
  const [showExpenses, setShowExpenses] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isProMode, setIsProMode] = useState(false);
  const data = mockProfitLossData[range];

  const grossProfit = data.revenue - data.cogs;
  const netProfit = grossProfit - data.expenses;
  const grossMargin = (grossProfit / data.revenue) * 100;
  const cogsRatio = (data.cogs / data.revenue) * 100;
  const expenseRatio = (data.expenses / data.revenue) * 100;

  const handleExportCSV = () => {
    const csvContent = [
      "Category,Amount,Type,Source,Date",
      `Revenue,${data.revenue},income,orders,${new Date().toISOString().split('T')[0]}`,
      `COGS,${data.cogs},cost,inventory,${new Date().toISOString().split('T')[0]}`,
      `Gross Profit,${grossProfit},calculated,,${new Date().toISOString().split('T')[0]}`,
      ...mockExpenses.map(exp => `${exp.name},${exp.amount},${exp.type},${exp.source},${exp.date}`),
      `Net Profit,${netProfit},calculated,,${new Date().toISOString().split('T')[0]}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${range}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "success":
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return <Zap size={16} className="text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
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
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-[#5B6E02]" />
          <h2 className="text-xl font-semibold text-gray-800">Profit & Loss Statement</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showInsights
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Zap size={12} />
            {showInsights ? "Hide AI Insights" : "Show AI Insights"}
          </button>
          <button
            onClick={() => setIsProMode(!isProMode)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              isProMode
                ? "bg-[#7F232E] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings size={12} />
            {isProMode ? "Pro Mode" : "Basic Mode"}
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

      {/* Timeframe Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-2">
          {["monthly", "quarterly"].map((label) => (
            <button
              key={label}
              onClick={() => setRange(label as Timeframe)}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                range === label
                  ? "bg-[#7F232E] text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Gross Margin:</span> {grossMargin.toFixed(1)}% | 
          <span className="font-medium ml-2">COGS Ratio:</span> {cogsRatio.toFixed(1)}% | 
          <span className="font-medium ml-2">Expense Ratio:</span> {expenseRatio.toFixed(1)}%
        </div>
      </div>

      {/* AI Insights */}
      {showInsights && (
        <div className="mb-6">
          <div className="space-y-3">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className={`p-3 border rounded-lg ${getInsightColor(insight.type)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getInsightIcon(insight.type)}
                  <span className="font-medium">{insight.title}</span>
                </div>
                <p className="text-sm mb-2">{insight.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{insight.impact}</span>
                  <button className="text-sm underline hover:no-underline">
                    {insight.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main P&L Statement */}
      <div className="space-y-2 text-gray-700 text-base mb-6">
        <div className="flex justify-between border-b pb-1">
          <span className="font-medium">Revenue</span>
          <span>${data.revenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-medium">Cost of Goods Sold (COGS)</span>
          <span className="text-red-600">-${data.cogs.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-medium">Gross Profit</span>
          <span>${grossProfit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-medium">Expenses</span>
          <span className="text-red-600">-${data.expenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-1 font-bold text-lg">
          <span className="text-[#333]">Net Profit</span>
          <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>
            ${netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pro Mode Features */}
      {isProMode && (
        <>
          {/* Expense Breakdown */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Expense Breakdown</h3>
              <button
                onClick={() => setShowExpenses(!showExpenses)}
                className="text-sm text-[#5B6E02] hover:underline"
              >
                {showExpenses ? "Hide Details" : "Show Details"}
              </button>
            </div>
            
            {showExpenses && (
              <div className="space-y-2">
                {mockExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        expense.type === "fixed" ? "bg-blue-500" : "bg-orange-500"
                      }`} />
                      <div>
                        <p className="font-medium text-gray-800">{expense.name}</p>
                        <p className="text-sm text-gray-600">{expense.type} expense • {expense.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${expense.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Sources */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-green-600" />
                  <span className="font-medium">Revenue</span>
                </div>
                <p className="text-gray-600">Pulled from order data</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator size={16} className="text-blue-600" />
                  <span className="font-medium">COGS</span>
                </div>
                <p className="text-gray-600">Calculated from inventory costs</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Download size={16} className="text-purple-600" />
                  <span className="font-medium">Expenses</span>
                </div>
                <p className="text-gray-600">Manual + Stripe imports</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          {isProMode ? "Advanced P&L with AI insights and detailed breakdowns" : "Basic profit and loss statement"}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
            <Calculator size={16} />
            Recalculate COGS
          </button>
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText size={16} />
            Import Expenses
          </button>
        </div>
      </div>
    </div>
  );
} 