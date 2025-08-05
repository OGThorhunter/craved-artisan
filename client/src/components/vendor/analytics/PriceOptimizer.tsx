"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Target, Calculator, BarChart3, Zap, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";

interface Product {
  id: string;
  name: string;
  currentPrice: number;
  costPrice: number;
  margin: number;
  competitorPrice: number;
  reorderRate: number;
  monthlySales: number;
  revenue: number;
  category: string;
  status: "optimal" | "underpriced" | "overpriced" | "underperforming";
}

interface PricingSimulation {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  priceChange: number;
  expectedRevenueChange: number;
  expectedSalesChange: number;
  confidence: number;
  reasoning: string;
}

const products: Product[] = [
  { id: "1", name: "Artisan Sourdough Bread", currentPrice: 8.50, costPrice: 3.20, margin: 62.4, competitorPrice: 9.25, reorderRate: 0.78, monthlySales: 450, revenue: 3825, category: "Bread", status: "underpriced" },
  { id: "2", name: "Organic Whole Grain Loaf", currentPrice: 7.00, costPrice: 2.80, margin: 60.0, competitorPrice: 7.50, reorderRate: 0.65, monthlySales: 320, revenue: 2240, category: "Bread", status: "optimal" },
  { id: "3", name: "Cinnamon Raisin Swirl", currentPrice: 5.50, costPrice: 2.10, margin: 61.8, competitorPrice: 6.00, reorderRate: 0.45, monthlySales: 280, revenue: 1540, category: "Pastry", status: "underpriced" },
  { id: "4", name: "Rustic Country Boule", currentPrice: 9.00, costPrice: 3.60, margin: 60.0, competitorPrice: 8.75, reorderRate: 0.52, monthlySales: 210, revenue: 1890, category: "Bread", status: "overpriced" },
  { id: "5", name: "Chocolate Croissant", currentPrice: 4.25, costPrice: 1.70, margin: 60.0, competitorPrice: 4.50, reorderRate: 0.38, monthlySales: 180, revenue: 765, category: "Pastry", status: "underperforming" },
  { id: "6", name: "Baguette", currentPrice: 6.50, costPrice: 2.60, margin: 60.0, competitorPrice: 6.75, reorderRate: 0.72, monthlySales: 380, revenue: 2470, category: "Bread", status: "optimal" },
];

const pricingSimulations: PricingSimulation[] = [
  { productId: "1", productName: "Artisan Sourdough Bread", currentPrice: 8.50, suggestedPrice: 9.25, priceChange: 0.75, expectedRevenueChange: 337.5, expectedSalesChange: -15, confidence: 85, reasoning: "Competitor pricing + high reorder rate" },
  { productId: "3", productName: "Cinnamon Raisin Swirl", currentPrice: 5.50, suggestedPrice: 6.00, priceChange: 0.50, expectedRevenueChange: 220, expectedSalesChange: -10, confidence: 78, reasoning: "Below competitor price + good margin" },
  { productId: "4", productName: "Rustic Country Boule", currentPrice: 9.00, suggestedPrice: 8.75, priceChange: -0.25, expectedRevenueChange: -52.5, expectedSalesChange: 5, confidence: 72, reasoning: "Above competitor price + low reorder rate" },
  { productId: "5", productName: "Chocolate Croissant", currentPrice: 4.25, suggestedPrice: 4.50, priceChange: 0.25, expectedRevenueChange: 45, expectedSalesChange: -5, confidence: 65, reasoning: "Below competitor price + low reorder rate" },
];

const competitorAnalysis = [
  { category: "Artisan Breads", avgCompetitorPrice: 8.33, ourAvgPrice: 8.17, priceGap: -0.16, marketShare: 0.35 },
  { category: "Pastries", avgCompetitorPrice: 5.25, ourAvgPrice: 4.88, priceGap: -0.37, marketShare: 0.28 },
  { category: "Specialty Items", avgCompetitorPrice: 12.50, ourAvgPrice: 11.75, priceGap: -0.75, marketShare: 0.22 },
];

export function PriceOptimizer() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showSimulations, setShowSimulations] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-green-600 bg-green-50 border-green-200";
      case "underpriced":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "overpriced":
        return "text-red-600 bg-red-50 border-red-200";
      case "underperforming":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return <CheckCircle size={16} className="text-green-600" />;
      case "underpriced":
        return <ArrowUpRight size={16} className="text-orange-600" />;
      case "overpriced":
        return <ArrowDownRight size={16} className="text-red-600" />;
      case "underperforming":
        return <AlertTriangle size={16} className="text-yellow-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
  const avgMargin = products.reduce((sum, product) => sum + product.margin, 0) / products.length;
  const underperformingProducts = products.filter(p => p.status === "underperforming" || p.status === "overpriced");
  const optimizationOpportunity = pricingSimulations.reduce((sum, sim) => sum + sim.expectedRevenueChange, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-[#5B6E02]" />
          <h2 className="text-xl font-semibold text-gray-800">Pricing Optimizer</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulations(!showSimulations)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showSimulations
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Zap size={12} />
            {showSimulations ? "Hide AI Simulations" : "Show AI Simulations"}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-gray-600">Total Monthly Revenue</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{avgMargin.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Average Margin</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-2xl font-bold text-orange-600">{underperformingProducts.length}</p>
          <p className="text-sm text-gray-600">Products Need Attention</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(optimizationOpportunity)}</p>
          <p className="text-sm text-gray-600">Optimization Opportunity</p>
        </div>
      </div>

      {/* AI Pricing Simulations */}
      {showSimulations && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-[#5B6E02]" />
            <h3 className="text-lg font-semibold text-gray-800">AI Pricing Simulations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingSimulations.map((simulation, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-[#5B6E02] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{simulation.productName}</h4>
                  <span className={`text-sm font-medium ${getConfidenceColor(simulation.confidence)}`}>
                    {simulation.confidence}% confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(simulation.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Suggested Price</p>
                    <p className={`font-semibold ${simulation.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(simulation.suggestedPrice)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Revenue Impact</p>
                    <p className={`font-semibold ${simulation.expectedRevenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {simulation.expectedRevenueChange > 0 ? '+' : ''}{formatCurrency(simulation.expectedRevenueChange)}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sales Impact</p>
                    <p className={`font-semibold ${simulation.expectedSalesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {simulation.expectedSalesChange > 0 ? '+' : ''}{simulation.expectedSalesChange} units
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">{simulation.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Pricing Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Pricing Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product</th>
                <th className="text-right p-2">Current Price</th>
                <th className="text-right p-2">Competitor</th>
                <th className="text-right p-2">Margin</th>
                <th className="text-right p-2">Reorder Rate</th>
                <th className="text-right p-2">Monthly Sales</th>
                <th className="text-right p-2">Revenue</th>
                <th className="text-center p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    selectedProduct === product.id ? "bg-[#F7F2EC]" : ""
                  }`}
                  onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                >
                  <td className="p-2 font-medium">{product.name}</td>
                  <td className="p-2 text-right">{formatCurrency(product.currentPrice)}</td>
                  <td className="p-2 text-right">{formatCurrency(product.competitorPrice)}</td>
                  <td className="p-2 text-right">{product.margin.toFixed(1)}%</td>
                  <td className="p-2 text-right">{(product.reorderRate * 100).toFixed(0)}%</td>
                  <td className="p-2 text-right">{product.monthlySales}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(product.revenue)}</td>
                  <td className="p-2 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      <span className="capitalize">{product.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed View */}
      {viewMode === "detailed" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Price vs Competitor Chart */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Price vs Competitor Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Price']} />
                <Bar dataKey="currentPrice" fill="#5B6E02" name="Our Price" />
                <Bar dataKey="competitorPrice" fill="#7F232E" name="Competitor Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Margin vs Reorder Rate Scatter */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Margin vs Reorder Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={products}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="margin" name="Margin %" />
                <YAxis type="number" dataKey="reorderRate" name="Reorder Rate" />
                <ZAxis type="number" dataKey="revenue" range={[50, 200]} />
                <Tooltip formatter={(value, name) => [
                  name === 'reorderRate' ? `${(Number(value) * 100).toFixed(0)}%` : 
                  name === 'revenue' ? formatCurrency(Number(value)) : 
                  `${Number(value).toFixed(1)}%`, 
                  name
                ]} />
                <Scatter dataKey="revenue" fill="#5B6E02" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Competitor Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Competitor Price Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitorAnalysis.map((analysis, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">{analysis.category}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Competitor Avg:</span>
                  <span className="font-medium">{formatCurrency(analysis.avgCompetitorPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Our Avg:</span>
                  <span className="font-medium">{formatCurrency(analysis.ourAvgPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price Gap:</span>
                  <span className={`font-medium ${analysis.priceGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.priceGap > 0 ? '+' : ''}{formatCurrency(analysis.priceGap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Share:</span>
                  <span className="font-medium">{(analysis.marketShare * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          AI-enhanced pricing suggestions based on competitor analysis, reorder rates, and margin optimization
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
            <Calculator size={16} />
            Apply Optimizations
          </button>
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={16} />
            Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
} 