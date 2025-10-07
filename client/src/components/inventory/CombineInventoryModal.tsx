import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Package,
  Calculator
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { InventoryItem } from '../../hooks/useInventory';

interface CombineInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryItem: InventoryItem;
  duplicateItems: InventoryItem[];
  onCombine: (primaryItemId: string, duplicateItemIds: string[], combinedData: Partial<InventoryItem>) => void;
}

const CombineInventoryModal: React.FC<CombineInventoryModalProps> = ({
  isOpen,
  onClose,
  primaryItem,
  duplicateItems,
  onCombine
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>(duplicateItems.map(item => item.id));
  const [combinedStock, setCombinedStock] = useState(primaryItem.currentStock);
  const [combinedValue, setCombinedValue] = useState(primaryItem.totalValue);
  const [isCombining, setIsCombining] = useState(false);

  // Calculate totals for selected duplicates
  const selectedItems = [primaryItem, ...duplicateItems.filter(item => selectedDuplicates.includes(item.id))];
  const totalStock = selectedItems.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = selectedItems.reduce((sum, item) => sum + item.totalValue, 0);

  const handleToggleDuplicate = (itemId: string) => {
    setSelectedDuplicates(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCombine = async () => {
    if (selectedDuplicates.length === 0) return;
    
    setIsCombining(true);
    
    try {
      // Calculate combined data
      const combinedData: Partial<InventoryItem> = {
        currentStock: combinedStock,
        totalValue: combinedValue,
        // Use the primary item's data as base, but could allow editing
        name: primaryItem.name,
        description: primaryItem.description,
        category: primaryItem.category,
        unit: primaryItem.unit,
        supplier: primaryItem.supplier,
        location: primaryItem.location,
        reorderPoint: primaryItem.reorderPoint,
        unitPrice: primaryItem.unitPrice
      };

      await onCombine(primaryItem.id, selectedDuplicates, combinedData);
      onClose();
    } catch (error) {
      console.error('Error combining items:', error);
    } finally {
      setIsCombining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Combine Duplicate Inventory</h2>
              <p className="text-white/90 mt-1">Merge similar inventory items and remove duplicates</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Warning */}
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Important Notice</h3>
                  <p className="text-yellow-800 text-sm mt-1">
                    Combining inventory items will merge their stock quantities and delete the duplicate entries. 
                    This action cannot be undone. Make sure you want to combine these items before proceeding.
                  </p>
                </div>
              </div>
            </Card>

            {/* Primary Item */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Primary Item (Will be kept)</h3>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">{primaryItem.name}</h4>
                    <p className="text-green-700 text-sm">{primaryItem.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                      <span>Stock: {primaryItem.currentStock} {primaryItem.unit}</span>
                      <span>Value: ${primaryItem.totalValue.toFixed(2)}</span>
                      <span>Category: {primaryItem.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Duplicate Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Duplicate Items (Will be merged and deleted)</h3>
              <div className="space-y-3">
                {duplicateItems.map((item) => (
                  <Card 
                    key={item.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedDuplicates.includes(item.id)
                        ? 'bg-red-50 border-red-200 ring-2 ring-red-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-200'
                    }`}
                    onClick={() => handleToggleDuplicate(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.includes(item.id)}
                        onChange={() => handleToggleDuplicate(item.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-gray-700 text-sm">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Stock: {item.currentStock} {item.unit}</span>
                          <span>Value: ${item.totalValue.toFixed(2)}</span>
                          <span>Category: {item.category}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Combined Totals */}
            {selectedDuplicates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Combined Result</h3>
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Stock Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Total Items:</span>
                          <span className="font-semibold">{selectedItems.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Combined Stock:</span>
                          <span className="font-semibold">{totalStock} {primaryItem.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Combined Value:</span>
                          <span className="font-semibold">${totalValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Adjust Final Values
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Final Stock Quantity
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCombinedStock(Math.max(0, combinedStock - 1))}
                              className="p-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-100"
                              title="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={combinedStock}
                              onChange={(e) => setCombinedStock(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-20 px-2 py-1 border border-blue-300 rounded text-center"
                              min="0"
                              title="Final stock quantity"
                            />
                            <button
                              onClick={() => setCombinedStock(combinedStock + 1)}
                              className="p-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-100"
                              title="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-blue-600">{primaryItem.unit}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Final Value
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={combinedValue}
                              onChange={(e) => setCombinedValue(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="flex-1 px-2 py-1 border border-blue-300 rounded"
                              min="0"
                              title="Final value"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedDuplicates.length > 0 && (
                <span>
                  {selectedDuplicates.length} duplicate{selectedDuplicates.length !== 1 ? 's' : ''} will be deleted
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isCombining}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleCombine}
                disabled={selectedDuplicates.length === 0 || isCombining}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isCombining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Combining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Combine Items
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CombineInventoryModal;
