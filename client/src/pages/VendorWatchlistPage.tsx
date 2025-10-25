import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import { 
  AlertTriangle, 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Percent,
  Eye,
  Package,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

type Product = { 
  lastAiSuggestion?: number; 
  price: number; 
  [key: string]: any 
};
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
  vendorProfileId: string;
}

interface AiSuggestionResponse {
  message: string;
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number;
    onWatchlist: boolean;
  };
  costAnalysis: {
    unitCost: number;
    hasRecipe: boolean;
  };
  aiSuggestion: {
    suggestedPrice: number;
    note: string;
    volatilityDetected: boolean;
    confidence: number;
    priceDifference: number;
    percentageChange: number;
  };
  watchlistUpdate: {
    addedToWatchlist: boolean;
    reason: string;
  };
}

const VendorWatchlistPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Fetch watchlist products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/products');
      // Filter to only show products on watchlist
      return response.data.products.filter((product: Product) => product.onWatchlist);
    },
  });

  // AI suggestion mutation
  const aiSuggestionMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await axios.post(`/api/vendor/products/${productId}/ai-suggest`);
      return response.data as AiSuggestionResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast.success('AI suggestion updated successfully');
    },
    onError: (error) => {
      console.error('Error updating AI suggestion:', error);
      toast.error('Failed to update AI suggestion');
    },
  });

  const getMarginColor = (margin: number) => {
    if (margin < 20) return 'text-red-600';
    if (margin < 35) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMarginStatus = (margin: number) => {
    if (margin < 20) return 'danger';
    if (margin < 35) return 'warning';
    return 'safe';
  };

  const calculateMargin = (price: number, unitCost: number) => {
    if (unitCost === 0) return 0;
    return ((price - unitCost) / price) * 100;
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading watchlist...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="responsive-subheading text-gray-900 mb-2">Error Loading Watchlist</h2>
            <p className="text-gray-600 mb-4">Failed to load products on watchlist</p>
            <button
              onClick={() => window.location.reload()}
              className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <DashboardHeader
            title="Product Watchlist"
            description="Monitoring products for price volatility and margin issues"
            currentView="Watchlist"
            icon={Eye}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('leadership').quote}
            author={getQuoteByCategory('leadership').author}
            icon={getQuoteByCategory('leadership').icon}
            variant={getQuoteByCategory('leadership').variant}
          />

        {/* Watchlist Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Total Watchlist Items</p>
                <p className="responsive-heading text-gray-900">{products?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">High Risk Items</p>
                <p className="responsive-heading text-gray-900">
                  {products?.filter((p: Product) => p.lastAiSuggestion && 
                    Math.abs(p.lastAiSuggestion - p.price) / p.price > 0.15).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {products?.filter((p: Product) => p.lastAiSuggestion).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => {
              const priceDifference = product.lastAiSuggestion 
                ? product.lastAiSuggestion - product.price 
                : 0;
              const percentageChange = product.lastAiSuggestion 
                ? ((product.lastAiSuggestion - product.price) / product.price) * 100 
                : 0;
              const isHighRisk = Math.abs(percentageChange) > 15;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-600 responsive-text font-medium">Watchlist</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Current Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* AI Suggestion */}
                      {product.lastAiSuggestion && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">AI Suggested:</span>
                            <span className={`font-semibold ${
                              priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${product.lastAiSuggestion.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Difference:</span>
                            <div className="flex items-center gap-1">
                              {priceDifference > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`font-medium ${
                                priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(2)} 
                                ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Target Margin */}
                      {product.targetMargin && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Target Margin:</span>
                          <span className="font-semibold text-blue-600">
                            {product.targetMargin}%
                          </span>
                        </div>
                      )}

                      {/* AI Note */}
                      {product.aiSuggestionNote && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>AI Note:</strong> {product.aiSuggestionNote}
                          </p>
                        </div>
                      )}

                      {/* Risk Indicator */}
                      {isHighRisk && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="responsive-text font-medium text-red-800">
                              High Price Volatility Detected
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => aiSuggestionMutation.mutate(product.id)}
                        disabled={aiSuggestionMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 responsive-button bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aiSuggestionMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Recalculate
                          </>
                        )}
                      </button>
                      
                      <Link href={`/dashboard/vendor/products`}>
                        <button className="responsive-button border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow text-center">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="responsive-subheading text-gray-900 mb-2">No Products on Watchlist</h3>
            <p className="text-gray-600 mb-6">
              Products will be automatically added to the watchlist when AI detects price volatility, 
              low confidence in suggestions, or significant price differences.
            </p>
            <Link href="/dashboard/vendor/products">
              <button className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Manage Products
              </button>
            </Link>
          </div>
        )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorWatchlistPage; 
