"use client";

import { useState } from "react";
import { DollarSign, FileText, Calculator, MapPin, TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3, Download, Receipt } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface SalesTaxData {
  zipCode: string;
  region: string;
  state: string;
  taxRate: number;
  salesAmount: number;
  taxCollected: number;
  transactions: number;
}

interface Deduction {
  category: string;
  amount: number;
  description: string;
  type: "cogs" | "tools" | "marketing" | "other";
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface StripeFee {
  month: string;
  processingFees: number;
  platformFees: number;
  refundFees: number;
  totalFees: number;
  grossRevenue: number;
  netRevenue: number;
}

const salesTaxData: SalesTaxData[] = [
  { zipCode: "90210", region: "Beverly Hills", state: "CA", taxRate: 9.5, salesAmount: 12500, taxCollected: 1187.50, transactions: 156 },
  { zipCode: "90211", region: "West Hollywood", state: "CA", taxRate: 9.5, salesAmount: 8900, taxCollected: 845.50, transactions: 112 },
  { zipCode: "90212", region: "Beverly Hills", state: "CA", taxRate: 9.5, salesAmount: 6700, taxCollected: 636.50, transactions: 89 },
  { zipCode: "90213", region: "Culver City", state: "CA", taxRate: 9.5, salesAmount: 5400, taxCollected: 513.00, transactions: 67 },
  { zipCode: "90214", region: "Beverly Hills", state: "CA", taxRate: 9.5, salesAmount: 4200, taxCollected: 399.00, transactions: 54 },
];

const deductions: Deduction[] = [
  { category: "Ingredients & Supplies", amount: 4200, description: "Flour, yeast, butter, packaging materials", type: "cogs", date: "2024-08-15", status: "approved" },
  { category: "Kitchen Equipment", amount: 1800, description: "Stand mixer, baking sheets, cooling racks", type: "tools", date: "2024-08-10", status: "approved" },
  { category: "Digital Marketing", amount: 450, description: "Facebook ads, Google ads, social media tools", type: "marketing", date: "2024-08-12", status: "approved" },
  { category: "Business Insurance", amount: 320, description: "General liability insurance premium", type: "other", date: "2024-08-01", status: "approved" },
  { category: "Vehicle Expenses", amount: 280, description: "Gas, maintenance for delivery vehicle", type: "other", date: "2024-08-08", status: "pending" },
  { category: "Office Supplies", amount: 150, description: "Receipts, labels, business cards", type: "other", date: "2024-08-14", status: "approved" },
];

const stripeFees: StripeFee[] = [
  { month: "Jan", processingFees: 245, platformFees: 180, refundFees: 25, totalFees: 450, grossRevenue: 9000, netRevenue: 8550 },
  { month: "Feb", processingFees: 267, platformFees: 195, refundFees: 18, totalFees: 480, grossRevenue: 9750, netRevenue: 9270 },
  { month: "Mar", processingFees: 289, platformFees: 210, refundFees: 32, totalFees: 531, grossRevenue: 10500, netRevenue: 9969 },
  { month: "Apr", processingFees: 312, platformFees: 225, refundFees: 15, totalFees: 552, grossRevenue: 11250, netRevenue: 10698 },
  { month: "May", processingFees: 334, platformFees: 240, refundFees: 28, totalFees: 602, grossRevenue: 12000, netRevenue: 11398 },
  { month: "Jun", processingFees: 356, platformFees: 255, refundFees: 22, totalFees: 633, grossRevenue: 12750, netRevenue: 12117 },
  { month: "Jul", processingFees: 378, platformFees: 270, refundFees: 35, totalFees: 683, grossRevenue: 13500, netRevenue: 12817 },
  { month: "Aug", processingFees: 400, platformFees: 285, refundFees: 20, totalFees: 705, grossRevenue: 14250, netRevenue: 13545 },
];

const quarterlyEstimates = [
  { quarter: "Q1 2024", grossRevenue: 29250, netRevenue: 27789, estimatedTax: 4168, dueDate: "2024-04-15", status: "paid" },
  { quarter: "Q2 2024", grossRevenue: 35250, netRevenue: 33483, estimatedTax: 5022, dueDate: "2024-07-15", status: "paid" },
  { quarter: "Q3 2024", grossRevenue: 40500, netRevenue: 38475, estimatedTax: 5771, dueDate: "2024-10-15", status: "upcoming" },
  { quarter: "Q4 2024", grossRevenue: 45000, netRevenue: 42750, estimatedTax: 6413, dueDate: "2025-01-15", status: "upcoming" },
];

const COLORS = ['#5B6E02', '#7F232E', '#E8CBAE', '#8B5A3C', '#10B981'];

export function TaxSummary() {
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const [showDeductions, setShowDeductions] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "upcoming":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <TrendingUp size={16} className="text-green-600" />;
      case "upcoming":
        return <Calendar size={16} className="text-orange-600" />;
      case "overdue":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "approved":
        return <TrendingUp size={16} className="text-green-600" />;
      case "pending":
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case "rejected":
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const totalTaxCollected = salesTaxData.reduce((sum, item) => sum + item.taxCollected, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const totalStripeFees = stripeFees.reduce((sum, item) => sum + item.totalFees, 0);
  const currentQuarterEstimate = quarterlyEstimates.find(q => q.status === "upcoming");

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[#5B6E02]" />
          <h2 className="text-xl font-semibold text-gray-800">Tax Report Summary</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeductions(!showDeductions)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showDeductions
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Receipt size={12} />
            {showDeductions ? "Hide Deductions" : "Show Deductions"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "overview" ? "detailed" : "overview")}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#7F232E] text-white rounded-full hover:bg-[#6A1E27] transition-colors"
          >
            <BarChart3 size={12} />
            {viewMode === "overview" ? "Detailed View" : "Overview"}
          </button>
        </div>
      </div>

      {/* Key Tax Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalTaxCollected)}</p>
          <p className="text-sm text-gray-600">Sales Tax Collected</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDeductions)}</p>
          <p className="text-sm text-gray-600">Total Deductions</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalStripeFees)}</p>
          <p className="text-sm text-gray-600">Stripe Fees</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentQuarterEstimate?.estimatedTax || 0)}</p>
          <p className="text-sm text-gray-600">Q3 Estimated Tax</p>
        </div>
      </div>

      {/* Quarterly Estimated Tax Guidance */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-[#5B6E02]" />
          <h3 className="text-lg font-semibold text-gray-800">Quarterly Estimated Tax Guidance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarterlyEstimates.map((quarter, idx) => (
            <div 
              key={idx} 
              className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                selectedQuarter === quarter.quarter ? "border-[#5B6E02] bg-[#F7F2EC]" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedQuarter(selectedQuarter === quarter.quarter ? null : quarter.quarter)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{quarter.quarter}</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(quarter.status)}`}>
                  {getStatusIcon(quarter.status)}
                  <span className="capitalize">{quarter.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Revenue:</span>
                  <span className="font-medium">{formatCurrency(quarter.grossRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Revenue:</span>
                  <span className="font-medium">{formatCurrency(quarter.netRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Tax:</span>
                  <span className="font-semibold text-[#5B6E02]">{formatCurrency(quarter.estimatedTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(quarter.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Tax Collection by Region */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Tax Collection by Region</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ZIP Code</th>
                <th className="text-left p-2">Region</th>
                <th className="text-left p-2">State</th>
                <th className="text-right p-2">Tax Rate</th>
                <th className="text-right p-2">Sales Amount</th>
                <th className="text-right p-2">Tax Collected</th>
                <th className="text-right p-2">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {salesTaxData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{item.zipCode}</td>
                  <td className="p-2">{item.region}</td>
                  <td className="p-2">{item.state}</td>
                  <td className="p-2 text-right">{formatPercentage(item.taxRate)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.salesAmount)}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(item.taxCollected)}</td>
                  <td className="p-2 text-right">{item.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deductions */}
      {showDeductions && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deductions.map((deduction, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{deduction.category}</h4>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(deduction.status)}`}>
                    {getStatusIcon(deduction.status)}
                    <span className="capitalize">{deduction.status}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{deduction.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#5B6E02]">{formatCurrency(deduction.amount)}</span>
                  <span className="text-sm text-gray-500">{new Date(deduction.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed View */}
      {viewMode === "detailed" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stripe Fees Over Time */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Stripe Fees Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stripeFees}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                <Line type="monotone" dataKey="totalFees" stroke="#7F232E" strokeWidth={2} name="Total Fees" />
                <Line type="monotone" dataKey="processingFees" stroke="#5B6E02" strokeWidth={2} name="Processing Fees" />
                <Line type="monotone" dataKey="platformFees" stroke="#E8CBAE" strokeWidth={2} name="Platform Fees" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Deductions by Category */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Deductions by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "COGS", value: deductions.filter(d => d.type === "cogs").reduce((sum, d) => sum + d.amount, 0) },
                    { name: "Tools", value: deductions.filter(d => d.type === "tools").reduce((sum, d) => sum + d.amount, 0) },
                    { name: "Marketing", value: deductions.filter(d => d.type === "marketing").reduce((sum, d) => sum + d.amount, 0) },
                    { name: "Other", value: deductions.filter(d => d.type === "other").reduce((sum, d) => sum + d.amount, 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stripe Fees Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Stripe Fees Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Month</th>
                <th className="text-right p-2">Gross Revenue</th>
                <th className="text-right p-2">Processing Fees</th>
                <th className="text-right p-2">Platform Fees</th>
                <th className="text-right p-2">Refund Fees</th>
                <th className="text-right p-2">Total Fees</th>
                <th className="text-right p-2">Net Revenue</th>
                <th className="text-right p-2">Fee %</th>
              </tr>
            </thead>
            <tbody>
              {stripeFees.map((fee, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{fee.month}</td>
                  <td className="p-2 text-right">{formatCurrency(fee.grossRevenue)}</td>
                  <td className="p-2 text-right">{formatCurrency(fee.processingFees)}</td>
                  <td className="p-2 text-right">{formatCurrency(fee.platformFees)}</td>
                  <td className="p-2 text-right">{formatCurrency(fee.refundFees)}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(fee.totalFees)}</td>
                  <td className="p-2 text-right">{formatCurrency(fee.netRevenue)}</td>
                  <td className="p-2 text-right">{formatPercentage((fee.totalFees / fee.grossRevenue) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Reminders */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-800">Tax Reminders</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-orange-600" />
              <span className="font-medium">Q3 Estimated Tax Due</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">Due Date: October 15, 2024</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-orange-600">{formatCurrency(currentQuarterEstimate?.estimatedTax || 0)}</span>
              <button className="text-sm underline hover:no-underline text-orange-600">
                Set Reminder
              </button>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-blue-600" />
              <span className="font-medium">Annual Tax Return</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">Due Date: April 15, 2025</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-600">Prepare Documents</span>
              <button className="text-sm underline hover:no-underline text-blue-600">
                Start Preparation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Comprehensive tax reporting with sales tax collection, deductions, and quarterly estimated tax guidance
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
            <Download size={16} />
            Export Tax Report
          </button>
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calculator size={16} />
            Tax Calculator
          </button>
        </div>
      </div>
    </div>
  );
} 