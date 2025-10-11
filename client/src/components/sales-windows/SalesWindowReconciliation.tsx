import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingDown, Heart, CheckCircle, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReconciliationProduct {
  productId: string;
  productName: string;
  plannedQuantity: number;
  soldQuantity: number;
  unsoldQuantity: number;
  unitPrice: number;
}

interface SalesWindowReconciliationProps {
  isOpen: boolean;
  onClose: () => void;
  salesWindow: {
    id: string;
    name: string;
    products: Array<{
      productId: string;
      name: string;
      holdQuantity: number;
      priceOverride?: number;
      price?: number;
    }>;
  };
  onComplete: (reconciliationData: {
    salesWindowId: string;
    products: Array<{
      productId: string;
      productName: string;
      plannedQuantity: number;
      soldQuantity: number;
      unsoldQuantity: number;
      disposition: {
        dayOld: number;
        charity: number;
        waste: number;
      };
    }>;
  }) => void;
}

const SalesWindowReconciliation: React.FC<SalesWindowReconciliationProps> = ({
  isOpen,
  onClose,
  salesWindow,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'sold' | 'disposition'>('sold');
  const [products, setProducts] = useState<ReconciliationProduct[]>(
    salesWindow.products.map(p => ({
      productId: p.productId,
      productName: p.name,
      plannedQuantity: p.holdQuantity,
      soldQuantity: 0,
      unsoldQuantity: p.holdQuantity,
      unitPrice: p.priceOverride || p.price || 0
    }))
  );
  const [dispositions, setDispositions] = useState<Record<string, { dayOld: number; charity: number; waste: number }>>(
    Object.fromEntries(salesWindow.products.map(p => [p.productId, { dayOld: 0, charity: 0, waste: 0 }]))
  );

  const handleSoldQuantityChange = (productId: string, soldQty: number) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const newSoldQty = Math.max(0, Math.min(soldQty, p.plannedQuantity));
        return {
          ...p,
          soldQuantity: newSoldQty,
          unsoldQuantity: p.plannedQuantity - newSoldQty
        };
      }
      return p;
    }));
  };

  const handleDispositionChange = (productId: string, type: 'dayOld' | 'charity' | 'waste', value: number) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    const currentDisposition = dispositions[productId];
    const otherTotal = Object.entries(currentDisposition)
      .filter(([key]) => key !== type)
      .reduce((sum, [, val]) => sum + val, 0);
    
    const maxAllowed = product.unsoldQuantity - otherTotal;
    const newValue = Math.max(0, Math.min(value, maxAllowed));

    setDispositions(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: newValue
      }
    }));
  };

  const getUnaccountedQuantity = (productId: string): number => {
    const product = products.find(p => p.productId === productId);
    if (!product) return 0;
    
    const disposition = dispositions[productId];
    const totalDisposed = disposition.dayOld + disposition.charity + disposition.waste;
    return product.unsoldQuantity - totalDisposed;
  };

  const canProceed = (): boolean => {
    if (currentStep === 'sold') {
      return true; // Can always proceed from sold step
    }
    // Check if all unsold quantities are accounted for
    return products.every(p => getUnaccountedQuantity(p.productId) === 0);
  };

  const handleComplete = () => {
    const reconciliationData = {
      salesWindowId: salesWindow.id,
      products: products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        plannedQuantity: p.plannedQuantity,
        soldQuantity: p.soldQuantity,
        unsoldQuantity: p.unsoldQuantity,
        disposition: dispositions[p.productId]
      }))
    };

    // Calculate totals for summary
    const totalRevenue = products.reduce((sum, p) => sum + (p.soldQuantity * p.unitPrice), 0);
    const totalCharity = products.reduce((sum, p) => sum + dispositions[p.productId].charity, 0);
    const totalDayOld = products.reduce((sum, p) => sum + dispositions[p.productId].dayOld, 0);
    const totalWaste = products.reduce((sum, p) => sum + dispositions[p.productId].waste, 0);

    // Store reconciliation data
    const existingReconciliations = JSON.parse(localStorage.getItem('salesWindowReconciliations') || '[]');
    existingReconciliations.push({
      ...reconciliationData,
      reconciledAt: new Date().toISOString(),
      summary: {
        totalRevenue,
        totalWaste,
        totalCharity,
        totalDayOld
      }
    });
    localStorage.setItem('salesWindowReconciliations', JSON.stringify(existingReconciliations));

    toast.success(
      `Sales window reconciled! Revenue: $${totalRevenue.toFixed(2)} | ` +
      `Charity: ${totalCharity} units | Day-old: ${totalDayOld} units | Waste: ${totalWaste} units`
    );

    onComplete(reconciliationData);
    onClose();
  };

  const totalSold = products.reduce((sum, p) => sum + p.soldQuantity, 0);
  const totalUnsold = products.reduce((sum, p) => sum + p.unsoldQuantity, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.soldQuantity * p.unitPrice), 0);
  const totalCharity = Object.values(dispositions).reduce((sum, d) => sum + d.charity, 0);
  const totalDayOld = Object.values(dispositions).reduce((sum, d) => sum + d.dayOld, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Sales Window Reconciliation</h2>
              <p className="text-blue-100">{salesWindow.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 border-b">
          <div className={`flex items-center gap-2 ${currentStep === 'sold' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'sold' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>Record Sales</span>
          </div>
          <div className="h-px w-12 bg-gray-300" />
          <div className={`flex items-center gap-2 ${currentStep === 'disposition' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'disposition' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>Handle Unsold</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Sold</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
            <p className="text-xs text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Unsold</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalUnsold}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-600">Charity</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalCharity}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Day-Old</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalDayOld}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'sold' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Record Actual Sales</h3>
                <p className="text-sm text-gray-600">Enter how many units of each product were actually sold during this sales window.</p>
              </div>

              {products.map((product) => (
                <div key={product.productId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{product.productName}</h4>
                      <p className="text-sm text-gray-600">Planned: {product.plannedQuantity} units | ${product.unitPrice} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Unsold: {product.unsoldQuantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <span className="block text-sm font-medium text-gray-700 mb-1">Units Sold</span>
                      <input
                        type="number"
                        min="0"
                        max={product.plannedQuantity}
                        value={product.soldQuantity}
                        onChange={(e) => handleSoldQuantityChange(product.productId, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </label>
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-lg font-bold text-green-600">${(product.soldQuantity * product.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'disposition' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Handle Unsold Inventory</h3>
                <p className="text-sm text-gray-600">Allocate unsold items to day-old sales, charity donations, or waste. All unsold items must be accounted for.</p>
              </div>

              {products.filter(p => p.unsoldQuantity > 0).map((product) => {
                const unaccounted = getUnaccountedQuantity(product.productId);
                const disposition = dispositions[product.productId];
                
                return (
                  <div key={product.productId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                        <p className="text-sm text-gray-600">Unsold: {product.unsoldQuantity} units</p>
                      </div>
                      {unaccounted > 0 && (
                        <div className="flex items-center gap-2 text-orange-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{unaccounted} unaccounted</span>
                        </div>
                      )}
                      {unaccounted === 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <label>
                        <span className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-blue-600" />
                          Day-Old Sales
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={product.unsoldQuantity}
                          value={disposition.dayOld}
                          onChange={(e) => handleDispositionChange(product.productId, 'dayOld', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Discounted resale</p>
                      </label>
                      
                      <label>
                        <span className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Heart className="h-3 w-3 text-pink-600" />
                          Charity Donation
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={product.unsoldQuantity}
                          value={disposition.charity}
                          onChange={(e) => handleDispositionChange(product.productId, 'charity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tax deductible</p>
                      </label>
                      
                      <label>
                        <span className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <X className="h-3 w-3 text-red-600" />
                          Waste/Discard
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={product.unsoldQuantity}
                          value={disposition.waste}
                          onChange={(e) => handleDispositionChange(product.productId, 'waste', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Unable to use</p>
                      </label>
                    </div>
                  </div>
                );
              })}

              {products.every(p => p.unsoldQuantity === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>All inventory was sold! No disposition needed.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep === 'disposition' && (
              <button
                onClick={() => setCurrentStep('sold')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            
            {currentStep === 'sold' ? (
              <button
                onClick={() => setCurrentStep('disposition')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Next: Handle Unsold
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-5 w-5" />
                Complete Reconciliation
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SalesWindowReconciliation;

