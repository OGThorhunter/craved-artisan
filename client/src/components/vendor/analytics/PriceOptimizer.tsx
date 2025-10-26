"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Target, Calculator, BarChart3, Zap, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
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
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUndoConfirmationModal, setShowUndoConfirmationModal] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  
  // State for products that can be updated
  const [currentProducts, setCurrentProducts] = useState<Product[]>([
    { id: "1", name: "Artisan Sourdough Bread", currentPrice: 8.50, costPrice: 3.20, margin: 62.4, competitorPrice: 9.25, reorderRate: 0.78, monthlySales: 450, revenue: 3825, category: "Bread", status: "underpriced" },
    { id: "2", name: "Organic Whole Grain Loaf", currentPrice: 7.00, costPrice: 2.80, margin: 60.0, competitorPrice: 7.50, reorderRate: 0.65, monthlySales: 320, revenue: 2240, category: "Bread", status: "optimal" },
    { id: "3", name: "Cinnamon Raisin Swirl", currentPrice: 5.50, costPrice: 2.10, margin: 61.8, competitorPrice: 6.00, reorderRate: 0.45, monthlySales: 280, revenue: 1540, category: "Pastry", status: "underpriced" },
    { id: "4", name: "Rustic Country Boule", currentPrice: 9.00, costPrice: 3.60, margin: 60.0, competitorPrice: 8.75, reorderRate: 0.52, monthlySales: 210, revenue: 1890, category: "Bread", status: "overpriced" },
    { id: "5", name: "Chocolate Croissant", currentPrice: 4.25, costPrice: 1.70, margin: 60.0, competitorPrice: 4.50, reorderRate: 0.38, monthlySales: 180, revenue: 765, category: "Pastry", status: "underperforming" },
    { id: "6", name: "Baguette", currentPrice: 6.50, costPrice: 2.60, margin: 60.0, competitorPrice: 6.75, reorderRate: 0.72, monthlySales: 380, revenue: 2470, category: "Bread", status: "optimal" },
  ]);
  
  // Store original product data for undo functionality
  const [originalProducts, setOriginalProducts] = useState<Product[]>([
    { id: "1", name: "Artisan Sourdough Bread", currentPrice: 8.50, costPrice: 3.20, margin: 62.4, competitorPrice: 9.25, reorderRate: 0.78, monthlySales: 450, revenue: 3825, category: "Bread", status: "underpriced" },
    { id: "2", name: "Organic Whole Grain Loaf", currentPrice: 7.00, costPrice: 2.80, margin: 60.0, competitorPrice: 7.50, reorderRate: 0.65, monthlySales: 320, revenue: 2240, category: "Bread", status: "optimal" },
    { id: "3", name: "Cinnamon Raisin Swirl", currentPrice: 5.50, costPrice: 2.10, margin: 61.8, competitorPrice: 6.00, reorderRate: 0.45, monthlySales: 280, revenue: 1540, category: "Pastry", status: "underpriced" },
    { id: "4", name: "Rustic Country Boule", currentPrice: 9.00, costPrice: 3.60, margin: 60.0, competitorPrice: 8.75, reorderRate: 0.52, monthlySales: 210, revenue: 1890, category: "Bread", status: "overpriced" },
    { id: "5", name: "Chocolate Croissant", currentPrice: 4.25, costPrice: 1.70, margin: 60.0, competitorPrice: 4.50, reorderRate: 0.38, monthlySales: 180, revenue: 765, category: "Pastry", status: "underperforming" },
    { id: "6", name: "Baguette", currentPrice: 6.50, costPrice: 2.60, margin: 60.0, competitorPrice: 6.75, reorderRate: 0.72, monthlySales: 380, revenue: 2470, category: "Bread", status: "optimal" },
  ]);
  
  // Track if optimizations have been applied
  const [hasOptimizationsApplied, setHasOptimizationsApplied] = useState(false);

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

  // Handle applying pricing optimizations
  const handleApplyOptimizations = () => {
    setShowConfirmationModal(true);
  };

  // Handle applying a single recommendation
  const handleApplySingleRecommendation = (simulation: PricingSimulation) => {
    const product = currentProducts.find(p => p.id === simulation.productId);
    if (!product) return;

    const newPrice = simulation.suggestedPrice;
    const newRevenue = (newPrice * product.monthlySales);
    const newMargin = ((newPrice - product.costPrice) / newPrice) * 100;
    
    // Update status based on new pricing
    let newStatus = product.status;
    if (newPrice > product.competitorPrice) {
      newStatus = "overpriced";
    } else if (newPrice < product.competitorPrice * 0.95) {
      newStatus = "underpriced";
    } else {
      newStatus = "optimal";
    }
    
    const updatedProduct = {
      ...product,
      currentPrice: newPrice,
      revenue: newRevenue,
      margin: newMargin,
      status: newStatus
    };

    setCurrentProducts(prev => 
      prev.map(p => p.id === product.id ? updatedProduct : p)
    );
    setHasOptimizationsApplied(true);

    // TODO: After deployment, replace with real API call:
    // const response = await fetch('/api/pricing/apply-single-optimization', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     vendorId: 'current-vendor-id',
    //     productId: product.id,
    //     optimization: simulation 
    //   })
    // });

    console.log(`[PLACEHOLDER] Applied single optimization for ${product.name}: ${formatCurrency(product.currentPrice)} → ${formatCurrency(newPrice)}`);
  };

  // Handle reversing a single recommendation
  const handleReverseSingleRecommendation = (simulation: PricingSimulation) => {
    const product = currentProducts.find(p => p.id === simulation.productId);
    if (!product) return;

    // Find the original product data
    const originalProduct = originalProducts.find(p => p.id === simulation.productId);
    if (!originalProduct) return;

    // Revert to original values
    const revertedProduct = {
      ...product,
      currentPrice: originalProduct.currentPrice,
      revenue: originalProduct.revenue,
      margin: originalProduct.margin,
      status: originalProduct.status
    };

    setCurrentProducts(prev => 
      prev.map(p => p.id === product.id ? revertedProduct : p)
    );

    // Check if any optimizations are still applied
    const hasAnyOptimizations = currentProducts.some(p => {
      const original = originalProducts.find(op => op.id === p.id);
      return original && p.currentPrice !== original.currentPrice;
    });
    
    if (!hasAnyOptimizations) {
      setHasOptimizationsApplied(false);
    }

    // TODO: After deployment, replace with real API call:
    // const response = await fetch('/api/pricing/reverse-single-optimization', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     vendorId: 'current-vendor-id',
    //     productId: product.id,
    //     originalData: originalProduct 
    //   })
    // });

    console.log(`[PLACEHOLDER] Reversed single optimization for ${product.name}: ${formatCurrency(product.currentPrice)} → ${formatCurrency(originalProduct.currentPrice)}`);
  };

  // Handle confirmation and proceed with optimizations
  const handleConfirmOptimizations = async () => {
    setShowConfirmationModal(false);
    setOptimizationStatus('processing');
    setShowOptimizationModal(true);
    
    try {
      // Simulate API call to apply optimizations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: After deployment, replace with real API call:
      // const response = await fetch('/api/pricing/apply-optimizations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     vendorId: 'current-vendor-id',
      //     optimizations: pricingSimulations 
      //   })
      // });
      
      // Actually apply the optimizations to the products
      const updatedProducts = currentProducts.map(product => {
        const optimization = pricingSimulations.find(sim => sim.productId === product.id);
        if (optimization) {
          const newPrice = optimization.suggestedPrice;
          const newRevenue = (newPrice * product.monthlySales);
          const newMargin = ((newPrice - product.costPrice) / newPrice) * 100;
          
          // Update status based on new pricing
          let newStatus = product.status;
          if (newPrice > product.competitorPrice) {
            newStatus = "overpriced";
          } else if (newPrice < product.competitorPrice * 0.95) {
            newStatus = "underpriced";
          } else {
            newStatus = "optimal";
          }
          
          return {
            ...product,
            currentPrice: newPrice,
            revenue: newRevenue,
            margin: newMargin,
            status: newStatus
          };
        }
        return product;
      });
      
             setCurrentProducts(updatedProducts);
       setHasOptimizationsApplied(true);
       setOptimizationStatus('completed');
       
       // Auto-hide success message after 3 seconds
       setTimeout(() => {
         setShowOptimizationModal(false);
         setOptimizationStatus('idle');
       }, 3000);
      
    } catch (error) {
      console.error('Error applying optimizations:', error);
      setOptimizationStatus('error');
    }
  };

  // Handle detailed report generation
  const handleDetailedReport = async () => {
    setShowDetailedReport(true);
    
    try {
      // TODO: After deployment, replace with real API call:
      // const response = await fetch('/api/pricing/generate-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     vendorId: 'current-vendor-id',
      //     reportType: 'detailed-pricing-analysis',
      //     dateRange: 'last-30-days'
      //   })
      // });
      
      // For now, just show the modal
      console.log('[PLACEHOLDER] Would generate detailed pricing report');
      
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  // Handle undoing optimizations
  const handleUndoOptimizations = () => {
    setCurrentProducts([...originalProducts]);
    setHasOptimizationsApplied(false);
    
    // TODO: After deployment, replace with real API call:
    // const response = await fetch('/api/pricing/undo-optimizations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     vendorId: 'current-vendor-id',
    //     originalData: originalProducts 
    //   })
    // });
    
    console.log('[PLACEHOLDER] Would revert pricing optimizations via API');
  };

  const totalRevenue = currentProducts.reduce((sum, product) => sum + product.revenue, 0);
  const avgMargin = currentProducts.reduce((sum, product) => sum + product.margin, 0) / currentProducts.length;
  const underperformingProducts = currentProducts.filter(p => p.status === "underperforming" || p.status === "overpriced");
  
  // Calculate optimization opportunity based on current vs suggested prices
  const optimizationOpportunity = pricingSimulations.reduce((sum, sim) => {
    const currentProduct = currentProducts.find(p => p.id === sim.productId);
    if (currentProduct) {
      const currentRevenue = currentProduct.currentPrice * currentProduct.monthlySales;
      const suggestedRevenue = sim.suggestedPrice * currentProduct.monthlySales;
      return sum + (suggestedRevenue - currentRevenue);
    }
    return sum;
  }, 0);

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
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
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Zap size={18} className="text-[#5B6E02]" />
               <h3 className="text-lg font-semibold text-gray-800">AI Pricing Simulations</h3>
             </div>
             
             {/* Individual Recommendations Summary */}
             <div className="flex items-center gap-3 text-sm">
               <div className="flex items-center gap-2">
                 <span className="text-gray-600">Applied:</span>
                 <span className="font-semibold text-green-600">
                   {pricingSimulations.filter(sim => 
                     currentProducts.find(p => p.id === sim.productId)?.currentPrice === sim.suggestedPrice
                   ).length}
                 </span>
                 <span className="text-gray-500">/ {pricingSimulations.length}</span>
               </div>
               <div className="w-px h-4 bg-gray-300"></div>
               <div className="flex items-center gap-2">
                 <span className="text-gray-600">Pending:</span>
                 <span className="font-semibold text-orange-600">
                   {pricingSimulations.filter(sim => 
                     currentProducts.find(p => p.id === sim.productId)?.currentPrice !== sim.suggestedPrice
                   ).length}
                 </span>
               </div>
             </div>
           </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingSimulations.map((simulation, idx) => (
                <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-[#5B6E02] transition-colors">
                                 <div className="flex items-center justify-between mb-2">
                   <h4 className="font-semibold text-gray-800">{simulation.productName}</h4>
                   <div className="flex items-center gap-2">
                     <span className={`text-sm font-medium ${getConfidenceColor(simulation.confidence)}`}>
                       {simulation.confidence}% confidence
                     </span>
                     {/* Applied Indicator */}
                     {currentProducts.find(p => p.id === simulation.productId)?.currentPrice === simulation.suggestedPrice && (
                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                         Applied
                       </span>
                     )}
                   </div>
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
                 
                                   {/* Price Change Summary */}
                  <div className="mb-3 p-2 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price Change:</span>
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold ${simulation.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {simulation.priceChange > 0 ? '+' : ''}{formatCurrency(simulation.priceChange)}
                        </span>
                        <span className="text-gray-500">
                          ({simulation.priceChange > 0 ? '+' : ''}{((simulation.priceChange / simulation.currentPrice) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    {/* Show original price when applied */}
                    {currentProducts.find(p => p.id === simulation.productId)?.currentPrice === simulation.suggestedPrice && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <span className="text-gray-500">Original Price: </span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(simulation.currentPrice)}
                        </span>
                      </div>
                    )}
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
                                 <p className="text-xs text-gray-600 italic mb-3">{simulation.reasoning}</p>
                 
                                   {/* Individual Apply/Undo Button */}
                  {currentProducts.find(p => p.id === simulation.productId)?.currentPrice === simulation.suggestedPrice ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                        title="This recommendation has already been applied"
                      >
                        <CheckCircle size={14} />
                        Applied
                      </button>
                      <button
                        onClick={() => handleReverseSingleRecommendation(simulation)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        title={`Revert ${simulation.productName} back to original price`}
                      >
                        <ArrowDownRight size={14} />
                        Undo
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplySingleRecommendation(simulation)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#5B6E02] text-white text-sm rounded-lg hover:bg-[#4A5A01] transition-colors"
                      title={`Apply ${simulation.priceChange > 0 ? 'price increase' : 'price decrease'} for ${simulation.productName}`}
                    >
                      <Calculator size={14} />
                      Apply This Recommendation
                    </button>
                  )}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Product Pricing Analysis */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
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
                             {currentProducts.map((product, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    selectedProduct === product.id ? "bg-[#F7F2EC]" : ""
                  }`}
                  onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                >
                                     <td className="p-2 font-medium">
                     <div className="flex items-center gap-2">
                       {product.name}
                       {pricingSimulations.find(sim => sim.productId === product.id) && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                           AI Optimized
                         </span>
                       )}
                     </div>
                   </td>
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
               <BarChart data={currentProducts}>
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
               <ScatterChart data={currentProducts}>
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
            <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
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
           <button 
             onClick={handleApplyOptimizations}
             disabled={optimizationStatus === 'processing'}
             className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
               optimizationStatus === 'processing'
                 ? 'bg-gray-400 cursor-not-allowed'
                 : 'bg-[#5B6E02] hover:bg-[#4A5A01]'
             } text-white`}
           >
             {optimizationStatus === 'processing' ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 Processing...
               </>
             ) : (
               <>
                 <Calculator size={16} />
                 Apply Optimizations
               </>
             )}
           </button>
           
           {/* Undo Optimizations Button - Only show when optimizations have been applied */}
           {hasOptimizationsApplied && (
             <button 
               onClick={() => setShowUndoConfirmationModal(true)}
               className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               title="Revert all pricing changes back to original values"
             >
               <ArrowDownRight size={16} />
               Undo Optimizations
             </button>
           )}
           
           <button 
             onClick={handleDetailedReport}
             className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
           >
             <BarChart3 size={16} />
             Detailed Report
           </button>
         </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">⚠️ Confirm Price Optimizations</h3>
              <p className="text-gray-600">Please review the changes below before proceeding</p>
            </div>
            
            {/* AI Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">AI Recommendations Require Human Validation</p>
                  <p>While our AI provides data-driven pricing suggestions, these are recommendations that should be reviewed by human experts before implementation. Market conditions, customer relationships, and business strategy may require adjustments.</p>
                </div>
              </div>
            </div>

            {/* Summary of Changes */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Summary of Proposed Changes</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {pricingSimulations.map((sim, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{sim.productName}</p>
                        <p className="text-sm text-gray-600">{sim.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{formatCurrency(sim.currentPrice)}</span>
                          <ArrowUpRight size={16} className="text-gray-400" />
                          <span className={`font-semibold ${sim.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(sim.suggestedPrice)}
                          </span>
                        </div>
                        <div className={`text-xs font-medium ${sim.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sim.priceChange > 0 ? '+' : ''}{formatCurrency(sim.priceChange)} ({sim.priceChange > 0 ? '+' : ''}{((sim.priceChange / sim.currentPrice) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Expected Impact</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Products to Update:</span>
                  <p className="font-semibold text-blue-800">{pricingSimulations.length}</p>
                </div>
                <div>
                  <span className="text-blue-600">Monthly Revenue Impact:</span>
                  <p className={`font-semibold ${optimizationOpportunity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {optimizationOpportunity > 0 ? '+' : ''}{formatCurrency(optimizationOpportunity)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOptimizations}
                className="px-6 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors"
              >
                Confirm & Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Status Modal */}
      {showOptimizationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {optimizationStatus === 'processing' && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B6E02] mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Applying Optimizations</h3>
                  <p className="text-gray-600">Please wait while we update your pricing strategy...</p>
                </>
              )}
              
                             {optimizationStatus === 'completed' && (
                 <>
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={24} className="text-green-600" />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimizations Applied!</h3>
                   <p className="text-gray-600 mb-4">Your pricing strategy has been updated based on AI recommendations.</p>
                   <div className="text-sm text-gray-500">
                     <p>• {pricingSimulations.length} price adjustments applied</p>
                     <p>• Revenue updated from {formatCurrency(totalRevenue - optimizationOpportunity)} to {formatCurrency(totalRevenue)}/month</p>
                     <p>• Average margin updated to {avgMargin.toFixed(1)}%</p>
                     <p className="text-blue-600 font-medium">• Use the "Undo Optimizations" button to revert changes if needed</p>
                   </div>
                 </>
               )}
              
              {optimizationStatus === 'error' && (
                <>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimization Failed</h3>
                  <p className="text-gray-600 mb-4">There was an error applying the optimizations. Please try again.</p>
                  <button
                    onClick={() => setShowOptimizationModal(false)}
                    className="bg-[#5B6E02] text-white px-4 py-2 rounded-lg hover:bg-[#4A5A01] transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

             {/* Undo Confirmation Modal */}
       {showUndoConfirmationModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle size={32} className="text-red-600" />
               </div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">⚠️ Confirm Undo Optimizations</h3>
               <p className="text-gray-600">This will revert all pricing changes back to their original values</p>
             </div>
             
             <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
               <div className="flex items-start gap-3">
                 <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                 <div className="text-sm text-red-800">
                   <p className="font-semibold mb-1">This action cannot be undone</p>
                   <p>All AI-optimized pricing will be reverted to the original values. You'll need to re-run the optimization process if you want to apply changes again.</p>
                 </div>
               </div>
             </div>
             
             <div className="flex gap-3 justify-center">
               <button
                 onClick={() => setShowUndoConfirmationModal(false)}
                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={() => {
                   setShowUndoConfirmationModal(false);
                   handleUndoOptimizations();
                 }}
                 className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                 Confirm Undo
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Detailed Report Modal */}
       {showDetailedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Detailed Pricing Analysis Report</h3>
              <button
                onClick={() => setShowDetailedReport(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close detailed report"
                title="Close detailed report"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Executive Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Revenue:</span>
                    <p className="font-semibold text-lg">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Average Margin:</span>
                    <p className="font-semibold text-lg">{avgMargin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Optimization Opportunity:</span>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(optimizationOpportunity)}</p>
                  </div>
                </div>
              </div>

              {/* Product Performance Analysis */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Product Performance Analysis</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 border-b">Product</th>
                        <th className="text-right p-2 border-b">Current Price</th>
                        <th className="text-right p-2 border-b">Suggested Price</th>
                        <th className="text-right p-2 border-b">Price Change</th>
                        <th className="text-right p-2 border-b">Revenue Impact</th>
                        <th className="text-center p-2 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingSimulations.map((sim, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-medium">{sim.productName}</td>
                          <td className="p-2 text-right">{formatCurrency(sim.currentPrice)}</td>
                          <td className="p-2 text-right">{formatCurrency(sim.suggestedPrice)}</td>
                          <td className={`p-2 text-right font-semibold ${
                            sim.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sim.priceChange > 0 ? '+' : ''}{formatCurrency(sim.priceChange)}
                          </td>
                          <td className={`p-2 text-right font-semibold ${
                            sim.expectedRevenueChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sim.expectedRevenueChange > 0 ? '+' : ''}{formatCurrency(sim.expectedRevenueChange)}/month
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              sim.confidence >= 80 ? 'bg-green-100 text-green-800' :
                              sim.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sim.confidence}% confidence
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Market Analysis */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Market Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {competitorAnalysis.map((analysis, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2">{analysis.category}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Share:</span>
                          <span className="font-medium">{(analysis.marketShare * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price Gap:</span>
                          <span className={`font-medium ${
                            analysis.priceGap > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {analysis.priceGap > 0 ? '+' : ''}{formatCurrency(analysis.priceGap)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Recommended Action Items</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Review and approve suggested price changes for high-confidence recommendations</li>
                  <li>• Monitor competitor pricing trends in the next 30 days</li>
                  <li>• Analyze customer response to price adjustments</li>
                  <li>• Schedule follow-up analysis in 2 weeks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 