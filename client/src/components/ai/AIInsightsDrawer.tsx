import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Eye, CheckCircle, AlertCircle, DollarSign, Package, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PricingInsight {
  productId: string;
  productName: string;
  currentPrice: number;
  baseCost: number;
  feesEst: number;
  marginPct: number;
  sales_30d: number;
  competitorMedian?: number;
  competitorRange?: { min: number; max: number };
  recPrice: number;
  confidencePct: number;
  rationale: string[];
  actions: {
    applyPrice: boolean;
    floorWarning?: boolean;
    inventoryNote?: string;
  };
}

interface InventoryInsight {
  inventoryItemId: string;
  name: string;
  currentQty: number;
  reorderPoint: number;
  leadTimeDays: number;
  dailyRunRate: number;
  stockoutRiskPct: number;
  recOrderQty: number;
  bestOffer?: {
    supplier: string;
    unitCost: number;
    pack: number;
    bulkBreak?: number;
    bulkUnitCost?: number;
  };
  savingsVsLastCostPct: number;
  confidencePct: number;
  rationale: string[];
  actions: {
    createPO: boolean;
  };
}

interface AIInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'products' | 'orders' | 'inventory';
  onApplyPrice?: (productId: string, newPrice: number, rationale: string[]) => void;
  onCreatePO?: (lines: Array<{ inventoryItemId: string; qty: number; unit_cost_est: number; supplier_name: string }>) => void;
}

export const AIInsightsDrawer: React.FC<AIInsightsDrawerProps> = ({
  isOpen,
  onClose,
  type,
  onApplyPrice,
  onCreatePO,
}) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'price_up' | 'price_down' | 'watchlist'>('all');
  const [pricingInsights, setPricingInsights] = useState<PricingInsight[]>([]);
  const [inventoryInsights, setInventoryInsights] = useState<InventoryInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<{ product: PricingInsight } | null>(null);

  // Load insights when drawer opens
  useEffect(() => {
    if (isOpen && user?.vendorProfileId) {
      loadInsights();
    }
  }, [isOpen, type, user?.vendorProfileId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      if (type === 'products') {
        const response = await fetch('/api/pricing-insights?range=30d', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPricingInsights(data);
        }
      } else if (type === 'inventory') {
        const response = await fetch('/api/inventory-insights?horizon=30d', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setInventoryInsights(data);
        }
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPrice = async (product: PricingInsight) => {
    try {
      const response = await fetch('/api/apply-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.productId,
          newPrice: product.recPrice,
          rationale: product.rationale.join(', '),
        }),
      });

      if (response.ok) {
        // Refresh insights
        loadInsights();
        // Notify parent component
        onApplyPrice?.(product.productId, product.recPrice, product.rationale);
        setShowApplyModal(null);
      }
    } catch (error) {
      console.error('Error applying price:', error);
    }
  };

  const handleCreatePO = async () => {
    const poLines = inventoryInsights
      .filter(insight => insight.actions.createPO)
      .map(insight => ({
        inventoryItemId: insight.inventoryItemId,
        qty: insight.recOrderQty,
        unit_cost_est: insight.bestOffer?.unitCost || 0,
        supplier_name: insight.bestOffer?.supplier || 'Unknown',
      }));

    if (poLines.length === 0) return;

    try {
      const response = await fetch('/api/create-po', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ lines: poLines }),
      });

      if (response.ok) {
        // Refresh insights
        loadInsights();
        // Notify parent component
        onCreatePO?.(poLines);
      }
    } catch (error) {
      console.error('Error creating PO:', error);
    }
  };

  const getFilteredPricingInsights = () => {
    switch (activeFilter) {
      case 'price_up':
        return pricingInsights.filter(insight => insight.recPrice > insight.currentPrice);
      case 'price_down':
        return pricingInsights.filter(insight => insight.recPrice < insight.currentPrice);
      case 'watchlist':
        return pricingInsights.filter(insight => insight.actions.applyPrice);
      default:
        return pricingInsights;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStockoutRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 bg-red-100';
    if (risk >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {type === 'products' ? (
                  <DollarSign className="w-5 h-5 text-blue-600" />
                ) : type === 'inventory' ? (
                  <Package className="w-5 h-5 text-blue-600" />
                ) : (
                  <Target className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
                <p className="text-sm text-gray-500 capitalize">{type} recommendations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters for Products */}
        {type === 'products' && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'price_up', label: 'Price ↑' },
                { id: 'price_down', label: 'Price ↓' },
                { id: 'watchlist', label: 'Watchlist' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : type === 'products' ? (
            <div className="space-y-4">
              {getFilteredPricingInsights().map((insight) => (
                <div key={insight.productId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{insight.productName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">${insight.currentPrice}</span>
                        {insight.recPrice !== insight.currentPrice && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className={`font-medium ${
                              insight.recPrice > insight.currentPrice ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${insight.recPrice}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(insight.confidencePct)}`}>
                      {insight.confidencePct}%
                    </span>
                  </div>

                  {/* Key Drivers */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Why this?</div>
                    <div className="space-y-1">
                      {insight.rationale.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="text-xs text-gray-700 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Math */}
                  <div className="text-xs text-gray-600 mb-3 bg-white rounded p-2">
                    Base Cost ${insight.baseCost.toFixed(2)} + Fees ${insight.feesEst.toFixed(2)} → 
                    Margin {insight.marginPct.toFixed(1)}% (target 35-45%)
                  </div>

                  {/* Actions */}
                  {insight.actions.applyPrice && (
                    <button
                      onClick={() => setShowApplyModal({ product: insight })}
                      className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply New Price
                    </button>
                  )}

                  {insight.actions.floorWarning && (
                    <div className="mt-2 text-xs text-orange-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Near minimum price floor
                    </div>
                  )}
                </div>
              ))}

              {getFilteredPricingInsights().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No insights available</p>
                </div>
              )}
            </div>
          ) : type === 'inventory' ? (
            <div className="space-y-4">
              {/* At Risk of Stockout */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  At Risk of Stockout
                </h3>
                <div className="space-y-3">
                  {inventoryInsights
                    .filter(insight => insight.stockoutRiskPct > 50)
                    .sort((a, b) => b.stockoutRiskPct - a.stockoutRiskPct)
                    .map((insight) => (
                      <div key={insight.inventoryItemId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.name}</h4>
                            <p className="text-sm text-gray-600">Current: {insight.currentQty} units</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStockoutRiskColor(insight.stockoutRiskPct)}`}>
                            {insight.stockoutRiskPct.toFixed(0)}% risk
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          Recommended: {insight.recOrderQty} units
                        </div>
                        <button
                          onClick={() => handleCreatePO()}
                          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Add to Draft PO
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Cheaper Alternatives */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2 text-green-500" />
                  Cheaper Alternatives
                </h3>
                <div className="space-y-3">
                  {inventoryInsights
                    .filter(insight => insight.bestOffer && insight.savingsVsLastCostPct > 5)
                    .sort((a, b) => b.savingsVsLastCostPct - a.savingsVsLastCostPct)
                    .map((insight) => (
                      <div key={insight.inventoryItemId} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.name}</h4>
                            <p className="text-sm text-gray-600">{insight.bestOffer?.supplier}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            {insight.savingsVsLastCostPct.toFixed(1)}% savings
                          </span>
                        </div>
                          <div className="text-sm text-gray-700">
                            ${insight.bestOffer?.unitCost.toFixed(2)}/unit vs ${((insight.bestOffer?.unitCost || 0) / (1 - insight.savingsVsLastCostPct / 100)).toFixed(2)}
                          </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Create PO Button */}
              {inventoryInsights.some(insight => insight.actions.createPO) && (
                <button
                  onClick={handleCreatePO}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Draft Purchase Order</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Orders insights coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Price Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apply New Price
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{showApplyModal.product.productName}</strong>
              </p>
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Price:</span>
                  <span className="font-medium">${showApplyModal.product.currentPrice}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">New Price:</span>
                  <span className="font-medium text-blue-600">${showApplyModal.product.recPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Margin:</span>
                  <span className="font-medium">
                    {(((showApplyModal.product.recPrice - showApplyModal.product.baseCost - showApplyModal.product.feesEst) / showApplyModal.product.recPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApplyModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyPrice(showApplyModal.product)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Price
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
