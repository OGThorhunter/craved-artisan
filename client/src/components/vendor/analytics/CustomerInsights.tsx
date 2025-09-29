"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, DollarSign, Crown, RefreshCw, TrendingUp, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { mockAnalyticsData } from "@/mock/analyticsData";

interface CustomerData {
  zipCode: string;
  customers: number;
  avgSpend: number;
  totalRevenue: number;
  loyaltyMembers: number;
}

interface CohortData {
  cohort: string;
  day1: number;
  day7: number;
  day30: number;
  day90: number;
}

const topZipCodes: CustomerData[] = [
  { zipCode: "90210", customers: 234, avgSpend: 45.20, totalRevenue: 10576.80, loyaltyMembers: 189 },
  { zipCode: "90211", customers: 187, avgSpend: 38.50, totalRevenue: 7199.50, loyaltyMembers: 142 },
  { zipCode: "90212", customers: 156, avgSpend: 42.80, totalRevenue: 6676.80, loyaltyMembers: 98 },
  { zipCode: "90213", customers: 134, avgSpend: 35.90, totalRevenue: 4810.60, loyaltyMembers: 87 },
  { zipCode: "90214", customers: 98, avgSpend: 48.30, totalRevenue: 4733.40, loyaltyMembers: 76 },
];

const cohortData: CohortData[] = [
  { cohort: "Jan 2024", day1: 100, day7: 78, day30: 45, day90: 23 },
  { cohort: "Feb 2024", day1: 100, day7: 82, day30: 52, day90: 28 },
  { cohort: "Mar 2024", day1: 100, day7: 75, day30: 48, day90: 25 },
  { cohort: "Apr 2024", day1: 100, day7: 85, day30: 58, day90: 32 },
  { cohort: "May 2024", day1: 100, day7: 88, day30: 62, day90: 35 },
  { cohort: "Jun 2024", day1: 100, day7: 91, day30: 68, day90: 38 },
];

// This will be updated with mock data in useEffect
const defaultCustomerMetrics = {
  totalCustomers: 1247,
  avgSpendPerCustomer: 42.30,
  loyaltyProgramMembers: 892,
  loyaltyImpact: 23.5,
  returnRate: 2.8,
  repeatPurchaseRate: 67.3,
  newCustomerAcquisition: 89,
  customerLifetimeValue: 156.80,
};

export function CustomerInsights() {
  const [selectedZipCode, setSelectedZipCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"zipcodes" | "cohorts">("zipcodes");
  const [customerMetrics, setCustomerMetrics] = useState(defaultCustomerMetrics);

  useEffect(() => {
    // Update with mock data
    const insights = mockAnalyticsData.customerInsights;
    setCustomerMetrics({
      totalCustomers: insights.totalCustomers,
      avgSpendPerCustomer: 42.30, // Keep existing calculation
      loyaltyProgramMembers: Math.floor(insights.totalCustomers * 0.7), // Estimate 70% loyalty membership
      loyaltyImpact: 23.5, // Keep existing
      returnRate: 2.8, // Keep existing
      repeatPurchaseRate: insights.averageOrderFrequency * 30, // Convert to percentage
      newCustomerAcquisition: insights.newCustomers,
      customerLifetimeValue: insights.customerSatisfaction * 30, // Estimate based on satisfaction
    });
  }, []);

  const getLoyaltyImpactColor = (impact: number) => {
    if (impact > 20) return "text-green-600";
    if (impact > 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getReturnRateColor = (rate: number) => {
    if (rate < 3) return "text-green-600";
    if (rate < 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Users size={20} className="text-[#5B6E02]" />
        <h2 className="text-xl font-semibold text-gray-800">Customer Insights</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-[#5B6E02]">{customerMetrics.totalCustomers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Customers</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-[#5B6E02]">${customerMetrics.avgSpendPerCustomer}</p>
          <p className="text-sm text-gray-600">Avg Spend</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-[#5B6E02]">{customerMetrics.loyaltyProgramMembers}</p>
          <p className="text-sm text-gray-600">Loyalty Members</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-[#5B6E02]">${customerMetrics.customerLifetimeValue}</p>
          <p className="text-sm text-gray-600">CLV</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-yellow-500" />
            <span className="font-medium text-gray-800">Loyalty Impact</span>
          </div>
          <p className={`text-xl font-bold ${getLoyaltyImpactColor(customerMetrics.loyaltyImpact)}`}>
            +{customerMetrics.loyaltyImpact}%
          </p>
          <p className="text-sm text-gray-600">Revenue increase from loyalty program</p>
        </div>
        <div className="p-3 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={16} className="text-blue-500" />
            <span className="font-medium text-gray-800">Return Rate</span>
          </div>
          <p className={`text-xl font-bold ${getReturnRateColor(customerMetrics.returnRate)}`}>
            {customerMetrics.returnRate}%
          </p>
          <p className="text-sm text-gray-600">Below industry average (5.2%)</p>
        </div>
        <div className="p-3 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="font-medium text-gray-800">Repeat Purchase</span>
          </div>
          <p className="text-xl font-bold text-green-600">{customerMetrics.repeatPurchaseRate}%</p>
          <p className="text-sm text-gray-600">Customers who buy again</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("zipcodes")}
          className={`px-3 py-1 text-sm rounded-full border transition ${
            viewMode === "zipcodes"
              ? "bg-[#5B6E02] text-white border-transparent"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Top ZIP Codes
        </button>
        <button
          onClick={() => setViewMode("cohorts")}
          className={`px-3 py-1 text-sm rounded-full border transition ${
            viewMode === "cohorts"
              ? "bg-[#5B6E02] text-white border-transparent"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Cohort Analysis
        </button>
      </div>

      {/* ZIP Codes View */}
      {viewMode === "zipcodes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ZIP Code List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Top Customer ZIP Codes</h3>
              {topZipCodes.map((zipData, idx) => (
                <div
                  key={idx}
                  className={`p-3 border-2 rounded-lg transition-all cursor-pointer bg-white ${
                    selectedZipCode === zipData.zipCode
                      ? "border-[#5B6E02]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedZipCode(selectedZipCode === zipData.zipCode ? null : zipData.zipCode)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#5B6E02]" />
                      <span className="font-semibold">{zipData.zipCode}</span>
                    </div>
                    <span className="text-sm text-gray-600">{zipData.customers} customers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Spend:</span>
                      <span className="font-medium ml-1">${zipData.avgSpend}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loyalty:</span>
                      <span className="font-medium ml-1">{zipData.loyaltyMembers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Revenue by ZIP Code</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topZipCodes}>
                  <XAxis dataKey="zipCode" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="totalRevenue" fill="#5B6E02" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Cohort Analysis View */}
      {viewMode === "cohorts" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Customer Retention Cohort Analysis</h3>
          
          {/* Cohort Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-center p-2">Day 1</th>
                  <th className="text-center p-2">Day 7</th>
                  <th className="text-center p-2">Day 30</th>
                  <th className="text-center p-2">Day 90</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="p-2 text-center">{cohort.day1}%</td>
                    <td className="p-2 text-center">
                      <span className={cohort.day7 > 80 ? "text-green-600" : "text-yellow-600"}>
                        {cohort.day7}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cohort.day30 > 50 ? "text-green-600" : "text-yellow-600"}>
                        {cohort.day30}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cohort.day90 > 30 ? "text-green-600" : "text-yellow-600"}>
                        {cohort.day90}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cohort Chart */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-3">Retention Trends</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cohortData}>
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="day7" fill="#5B6E02" name="7-day retention" />
                <Bar dataKey="day30" fill="#7F232E" name="30-day retention" />
                <Bar dataKey="day90" fill="#E8CBAE" name="90-day retention" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-[#5B6E02] text-white rounded-full hover:bg-[#4A5A01] transition-colors">
            <Users size={12} />
            Export Customer Data
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-[#7F232E] text-white rounded-full hover:bg-[#6A1E27] transition-colors">
            <Crown size={12} />
            Loyalty Campaign
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
            <BarChart3 size={12} />
            Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
} 