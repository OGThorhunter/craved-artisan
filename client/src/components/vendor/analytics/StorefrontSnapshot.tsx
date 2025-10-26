"use client";

import { useState, useRef } from "react";
import { Download, Share2, Image, FileText, Star, TrendingUp, Package, Users, Award, Quote, BarChart3, Settings } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface Product {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  sales: number;
  revenue: number;
  category: string;
  featured: boolean;
}

interface CustomerFeedback {
  text: string;
  rating: number;
  customer: string;
  date: string;
  product?: string;
}

interface PerformanceStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  customerCount: number;
  repeatCustomerRate: number;
  fulfillmentRate: number;
  avgRating: number;
  yearsInBusiness: number;
}

const bestProducts: Product[] = [
  { name: "Artisan Sourdough Bread", image: "/api/placeholder/150/150", rating: 4.9, reviews: 127, sales: 450, revenue: 6750, category: "Bread", featured: true },
  { name: "Organic Whole Grain Loaf", image: "/api/placeholder/150/150", rating: 4.8, reviews: 89, sales: 320, revenue: 4480, category: "Bread", featured: true },
  { name: "Cinnamon Raisin Swirl", image: "/api/placeholder/150/150", rating: 4.7, reviews: 156, sales: 280, revenue: 3920, category: "Pastry", featured: false },
  { name: "Rustic Country Boule", image: "/api/placeholder/150/150", rating: 4.6, reviews: 73, sales: 210, revenue: 2940, category: "Bread", featured: false },
];

const customerFeedback: CustomerFeedback[] = [
  { text: "The best sourdough I've ever tasted! Perfect crust and amazing flavor.", rating: 5, customer: "Sarah M.", date: "2024-08-10", product: "Artisan Sourdough Bread" },
  { text: "Consistently excellent quality. This bakery has become our family's go-to for fresh bread.", rating: 5, customer: "Michael R.", date: "2024-08-08" },
  { text: "Amazing customer service and the bread is always fresh. Highly recommend!", rating: 5, customer: "Jennifer L.", date: "2024-08-05", product: "Organic Whole Grain Loaf" },
  { text: "The cinnamon raisin swirl is absolutely divine. Perfect texture and sweetness.", rating: 4, customer: "David K.", date: "2024-08-03", product: "Cinnamon Raisin Swirl" },
];

const performanceStats: PerformanceStats = {
  totalOrders: 2847,
  totalRevenue: 142350,
  avgOrderValue: 50.02,
  customerCount: 892,
  repeatCustomerRate: 78.5,
  fulfillmentRate: 98.2,
  avgRating: 4.8,
  yearsInBusiness: 3,
};

const orderVolumeData = [
  { month: "Jan", orders: 180, revenue: 9000 },
  { month: "Feb", orders: 195, revenue: 9750 },
  { month: "Mar", orders: 210, revenue: 10500 },
  { month: "Apr", orders: 225, revenue: 11250 },
  { month: "May", orders: 240, revenue: 12000 },
  { month: "Jun", orders: 255, revenue: 12750 },
  { month: "Jul", orders: 270, revenue: 13500 },
  { month: "Aug", orders: 285, revenue: 14250 },
];

const categoryData = [
  { name: "Artisan Breads", value: 45, color: "#5B6E02" },
  { name: "Pastries", value: 30, color: "#7F232E" },
  { name: "Specialty Items", value: 15, color: "#E8CBAE" },
  { name: "Seasonal", value: 10, color: "#8B5A3C" },
];

const COLORS = ['#5B6E02', '#7F232E', '#E8CBAE', '#8B5A3C'];

export function StorefrontSnapshot() {
  const [exportFormat, setExportFormat] = useState<"pdf" | "image" | "share">("pdf");
  const [showBranding, setShowBranding] = useState(true);
  const [customWatermark, setCustomWatermark] = useState("Artisan Bakery Co.");
  const [selectedTemplate, setSelectedTemplate] = useState<"professional" | "creative" | "minimal">("professional");
  const portfolioRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case "creative":
        return "bg-gradient-to-br from-[#F7F2EC] to-white border-2 border-[#5B6E02]";
      case "minimal":
        return "bg-white border border-gray-200";
      default:
        return "bg-white shadow-lg";
    }
  };

  const handleExport = async () => {
    if (exportFormat === "pdf") {
      // PDF export logic would go here
      console.log("Exporting as PDF...");
    } else if (exportFormat === "image") {
      // Image export logic would go here
      console.log("Exporting as image...");
    } else if (exportFormat === "share") {
      // Share logic would go here
      console.log("Generating shareable link...");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-[#5B6E02]" />
          <h2 className="text-xl font-semibold text-gray-800">Storefront Portfolio Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBranding(!showBranding)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              showBranding
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings size={12} />
            {showBranding ? "Hide Branding" : "Show Branding"}
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Template:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
              aria-label="Select template style"
            >
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          {showBranding && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Watermark:</span>
              <input
                type="text"
                value={customWatermark}
                onChange={(e) => setCustomWatermark(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                placeholder="Enter custom watermark"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Export Format:</span>
          <button
            onClick={() => setExportFormat("pdf")}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              exportFormat === "pdf"
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={12} />
            PDF
          </button>
          <button
            onClick={() => setExportFormat("image")}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              exportFormat === "image"
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Image size={12} />
            Image
          </button>
          <button
            onClick={() => setExportFormat("share")}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition ${
              exportFormat === "share"
                ? "bg-[#5B6E02] text-white border-transparent"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Share2 size={12} />
            Share
          </button>
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className="mb-6">
        <div ref={portfolioRef} className={`${getTemplateStyles()} p-8 rounded-lg max-w-4xl mx-auto`}>
          {/* Header */}
          <div className="text-center mb-8">
            {showBranding && (
              <div className="absolute top-4 right-4 text-xs text-gray-400 opacity-50">
                {customWatermark}
              </div>
            )}
            <h1 className="text-3xl font-bold text-[#333] mb-2">Artisan Bakery Co.</h1>
            <p className="text-gray-600 mb-4">Crafting exceptional bread and pastries since 2021</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <span>⭐ {performanceStats.avgRating}/5.0 Average Rating</span>
              <span>📦 {performanceStats.fulfillmentRate}% Fulfillment Rate</span>
              <span>🔄 {performanceStats.repeatCustomerRate}% Repeat Customers</span>
            </div>
          </div>

          {/* Performance Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-[#F7F2EC] rounded-lg">
              <p className="text-2xl font-bold text-[#5B6E02]">{formatNumber(performanceStats.totalOrders)}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-[#F7F2EC] rounded-lg">
              <p className="text-2xl font-bold text-[#5B6E02]">{formatCurrency(performanceStats.totalRevenue)}</p>
              <p className="text-sm text-gray-600">Lifetime Revenue</p>
            </div>
            <div className="text-center p-4 bg-[#F7F2EC] rounded-lg">
              <p className="text-2xl font-bold text-[#5B6E02]">{formatNumber(performanceStats.customerCount)}</p>
              <p className="text-sm text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center p-4 bg-[#F7F2EC] rounded-lg">
              <p className="text-2xl font-bold text-[#5B6E02]">{performanceStats.yearsInBusiness}</p>
              <p className="text-sm text-gray-600">Years in Business</p>
            </div>
          </div>

          {/* Best Products */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-4">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bestProducts.filter(p => p.featured).map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="ml-1">{product.rating}</span>
                      </div>
                      <span>({product.reviews} reviews)</span>
                    </div>
                    <p className="text-sm text-gray-600">{formatNumber(product.sales)} units sold</p>
                    <p className="font-semibold text-[#5B6E02]">{formatCurrency(product.revenue)} revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Feedback */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-4">Customer Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerFeedback.slice(0, 4).map((feedback, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">- {feedback.customer}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{feedback.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Volume Chart */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-4">Order Volume Growth</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={orderVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Line type="monotone" dataKey="orders" stroke="#5B6E02" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-4">Product Mix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center">
                <div className="space-y-2">
                  {categoryData.map((category, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-gray-700">{category.name}: {category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Ready to partner with us?</p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>📧 hello@artisanbakery.com</span>
              <span>📞 (555) 123-4567</span>
              <span>🌐 artisanbakery.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Use Case: Send to buyers / markets / wholesale ops • Build pitch deck in 1 click
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors"
          >
            <Download size={16} />
            Export {exportFormat.toUpperCase()}
          </button>
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={16} />
            Customize
          </button>
        </div>
      </div>
    </div>
  );
} 