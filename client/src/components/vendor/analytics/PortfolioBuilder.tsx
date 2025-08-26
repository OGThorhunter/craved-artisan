"use client";

import { useState, useRef } from "react";
import { mockKpis, mockFunnelData, mockTrendData } from "@/mock/analyticsData";
import { Download, Share2, Eye, Settings, Star, TrendingUp, MapPin, Users, Package, Image as ImageIcon, Trophy, Sparkles, ExternalLink, Copy } from "lucide-react";

// Mock data for portfolio
const portfolioData = {
  vendorName: "Rose Creek Bakery",
  location: "Locust Grove, GA",
  logo: "/logo.png", // Placeholder
  vendorId: "rose-creek-bakery-123",
  bestProducts: [
    { name: "Cinnamon Raisin Sourdough", sales: 156, revenue: 2340, rating: 4.9 },
    { name: "Artisan Croissant", sales: 134, revenue: 2010, rating: 4.8 },
    { name: "Chocolate Chip Cookies", sales: 98, revenue: 1470, rating: 4.7 },
  ],
  customerFeedback: [
    { text: "The best bread I've ever had — always fresh, always amazing!", rating: 5, customer: "Sarah M." },
    { text: "Incredible quality and taste. My family loves everything from Rose Creek!", rating: 5, customer: "Mike R." },
    { text: "Consistently excellent products. Highly recommend!", rating: 5, customer: "Jennifer L." },
  ],
  highlights: {
    topZipCodes: ["30248", "30223", "30236"],
    reorderRate: 78,
    featuredPhotos: 3,
    totalCustomers: 1247,
    averageRating: 4.8,
  },
  kpis: {
    monthlyRevenue: "$5,220",
    averageOrderValue: "$28.12",
    totalOrders: "186",
    customerSatisfaction: "98%"
  },
  achievements: [
    { title: "Top Seller", description: "3 months in a row", icon: "🏆", color: "gold" },
    { title: "Customer Favorite", description: "98% satisfaction rate", icon: "⭐", color: "yellow" },
    { title: "Local Hero", description: "Featured in Local Food Guide", icon: "🏅", color: "blue" },
    { title: "Quality Champion", description: "Zero complaints this month", icon: "🎯", color: "green" },
  ],
  gallery: [
    { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", alt: "Fresh baked bread", caption: "Our signature sourdough" },
    { url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", alt: "Artisan croissants", caption: "Buttery perfection" },
    { url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop", alt: "Bakery interior", caption: "Our cozy bakery" },
    { url: "https://images.unsplash.com/photo-1608198093002-ad4e505484ba?w=400&h=300&fit=crop", alt: "Fresh ingredients", caption: "Quality ingredients" },
  ]
};

// AI Tagline Generator
const generateAITagline = (data: typeof portfolioData) => {
  const taglines = [
    `Local favorite with ${data.highlights.reorderRate}% reorder rate`,
    `Serving ${data.highlights.totalCustomers.toLocaleString()}+ happy customers`,
    `Top-rated bakery with ${data.highlights.averageRating}★ average rating`,
    `Fresh from our oven to your table since 2020`,
    `Where tradition meets innovation in every bite`,
    `The community's choice for artisan bread and pastries`,
  ];
  
  // Return a tagline based on performance metrics
  if (data.highlights.reorderRate > 75) {
    return taglines[0];
  } else if (data.highlights.totalCustomers > 1000) {
    return taglines[1];
  } else if (data.highlights.averageRating > 4.5) {
    return taglines[2];
  }
  
  return taglines[Math.floor(Math.random() * taglines.length)];
};

export function PortfolioBuilder() {
  const [showSettings, setShowSettings] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);
  const [includeGallery, setIncludeGallery] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const aiTagline = generateAITagline(portfolioData);
  const publicUrl = `https://cravedartisan.com/vendor/portfolio/${portfolioData.vendorId}`;

  const handleExportPDF = async () => {
    try {
      // Mock PDF export functionality
      console.log("Exporting PDF...");
      
      // In a real implementation, you would use html2canvas or react-pdf
      // const canvas = await html2canvas(portfolioRef.current!);
      // const imgData = canvas.toDataURL('image/png');
      
      alert("PDF export functionality would be implemented with html2canvas or react-pdf");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handleExportImage = async () => {
    try {
      // Mock image export functionality
      console.log("Exporting image...");
      
      // In a real implementation, you would use html2canvas
      // const canvas = await html2canvas(portfolioRef.current!);
      // const link = document.createElement('a');
      // link.download = `${portfolioData.vendorName}-portfolio.png`;
      // link.href = canvas.toDataURL();
      // link.click();
      
      alert("Image export functionality would be implemented with html2canvas");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Public portfolio link copied to clipboard!");
  };

  const handlePreview = () => {
    window.open(publicUrl, '_blank');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Portfolio URL copied to clipboard!");
  };

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-6 shadow-xl mt-6 max-w-6xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Portfolio Builder</h2>
          <p className="text-gray-600">Auto-generate your business portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings size={16} />
            Customize
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01]"
          >
            <ExternalLink size={16} />
            View Public
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Portfolio Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Style</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                aria-label="Select template style"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeLogo"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeLogo" className="text-sm text-gray-700">Include Logo</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeContact"
                checked={includeContact}
                onChange={(e) => setIncludeContact(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeContact" className="text-sm text-gray-700">Include Contact Info</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeGallery"
                checked={includeGallery}
                onChange={(e) => setIncludeGallery(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeGallery" className="text-sm text-gray-700">Include Gallery</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAchievements"
                checked={includeAchievements}
                onChange={(e) => setIncludeAchievements(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeAchievements" className="text-sm text-gray-700">Include Achievements</label>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Preview */}
      <div ref={portfolioRef} className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-[#F7F2EC] to-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#5B6E02]">{portfolioData.vendorName}</h3>
            <p className="text-gray-600 flex items-center gap-1">
              <MapPin size={14} />
              {portfolioData.location}
            </p>
            {/* AI Generated Tagline */}
            <div className="flex items-center gap-2 mt-2">
              <Sparkles size={16} className="text-yellow-500" />
              <p className="text-sm italic text-gray-700">{aiTagline}</p>
            </div>
          </div>
          {includeLogo && (
            <div className="w-16 h-16 bg-white rounded-full border-2 border-[#5B6E02] flex items-center justify-center">
              <span className="text-[#5B6E02] font-bold text-lg">RC</span>
            </div>
          )}
        </div>

        {/* Achievements */}
        {includeAchievements && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-600" />
              Achievements & Recognition
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {portfolioData.achievements.map((achievement, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border shadow-sm text-center">
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <h5 className="font-semibold text-gray-800 text-sm">{achievement.title}</h5>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Monthly Revenue</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{portfolioData.kpis.monthlyRevenue}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Package size={20} className="text-blue-600" />
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Avg Order Value</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{portfolioData.kpis.averageOrderValue}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{portfolioData.kpis.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Star size={20} className="text-yellow-600" />
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Satisfaction</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{portfolioData.kpis.customerSatisfaction}</p>
          </div>
        </div>

        {/* Image Gallery */}
        {includeGallery && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ImageIcon size={20} className="text-blue-600" />
              Gallery
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {portfolioData.gallery.map((image, idx) => (
                <div 
                  key={idx} 
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedImage(idx)}
                >
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-24 object-cover rounded-lg border shadow-sm group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    {image.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Products */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🏆 Best Selling Products
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolioData.bestProducts.map((product, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">{product.name}</h5>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{product.sales} units sold</p>
                  <p className="font-medium text-green-600">${product.revenue.toLocaleString()} revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Feedback */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Testimonials</h4>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1">
                {[...Array(portfolioData.customerFeedback[0].rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="flex-1">
                <p className="italic text-gray-700 mb-2">"{portfolioData.customerFeedback[0].text}"</p>
                <p className="text-sm text-gray-600">— {portfolioData.customerFeedback[0].customer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Business Highlights</h4>
            <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Top ZIP Codes</span>
                <span className="font-medium">{portfolioData.highlights.topZipCodes.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reorder Rate</span>
                <span className="font-medium text-green-600">{portfolioData.highlights.reorderRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Customers</span>
                <span className="font-medium">{portfolioData.highlights.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-medium flex items-center gap-1">
                  {portfolioData.highlights.averageRating}
                  <Star size={14} className="text-yellow-500 fill-current" />
                </span>
              </div>
            </div>
          </div>

          {includeContact && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
                <p className="text-gray-600">📍 {portfolioData.location}</p>
                <p className="text-gray-600">📧 hello@rosecreekbakery.com</p>
                <p className="text-gray-600">📱 (555) 123-4567</p>
                <p className="text-gray-600">🌐 rosecreekbakery.com</p>
              </div>
            </div>
          )}
        </div>

        {/* Watermark */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Generated by Craved Artisan • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Public URL Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Public Portfolio URL</p>
            <p className="text-sm text-gray-600 font-mono">{publicUrl}</p>
          </div>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Copy size={14} />
            Copy
          </button>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="text-sm text-gray-600">
          Auto-generated portfolio with your latest performance data
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportImage}
            className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ImageIcon size={16} />
            Export Image
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01]"
          >
            <Share2 size={16} />
            Share Link
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{portfolioData.gallery[selectedImage].caption}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img 
              src={portfolioData.gallery[selectedImage].url} 
              alt={portfolioData.gallery[selectedImage].alt}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 