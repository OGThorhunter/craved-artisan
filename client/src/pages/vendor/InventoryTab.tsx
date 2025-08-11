import React, { useState } from 'react';
import { Plus, Package, TrendingUp, Link, Filter } from 'lucide-react';
import { 
  useIngredients, 
  useInventoryTransactions, 
  useCreateIngredient, 
  usePurchase, 
  useLinkRecipe 
} from '@/hooks/inventory';
import { useRestockSuggestions, useCreatePO } from '@/hooks/restock';
import { flags } from '@/lib/flags';

interface InventoryTabProps {
  vendorId: string;
}

export default function InventoryTab({ vendorId }: InventoryTabProps) {
  const [showPurchaseDrawer, setShowPurchaseDrawer] = useState(false);
  const [showCreateIngredient, setShowCreateIngredient] = useState(false);
  const [showLinkRecipe, setShowLinkRecipe] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState<number>(0);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'purchase' | 'sale' | 'adjustment' | 'waste'>('all');

  // Data fetching
  const ingredientsQuery = useIngredients(vendorId);
  const transactionsQuery = useInventoryTransactions(vendorId, {
    type: transactionFilter === 'all' ? undefined : transactionFilter
  });

  // Mutations
  const createIngredientMutation = useCreateIngredient();
  const purchaseMutation = usePurchase();
  const linkRecipeMutation = useLinkRecipe();

  // Extract data with safe defaults
  const ingredients = ingredientsQuery.data || [];
  const transactions = transactionsQuery.data || [];

  const isLoading = ingredientsQuery.isLoading || transactionsQuery.isLoading;

  // Form handlers
  const handleCreateIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      costPerUnit: Number(formData.get('costPerUnit')),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      await createIngredientMutation.mutateAsync({ vendorId, data });
      setShowCreateIngredient(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data = {
      ingredientId: selectedIngredient,
      quantity: purchaseQuantity,
      unitCost: purchaseUnitCost
    };

    try {
      await purchaseMutation.mutateAsync({ vendorId, data });
      setShowPurchaseDrawer(false);
      setSelectedIngredient('');
      setPurchaseQuantity(0);
      setPurchaseUnitCost(0);
    } catch (error) {
      console.error('Failed to record purchase:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading inventory data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track ingredients, purchases, and recipe costs</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {flags.INVENTORY ? 'Live Data' : 'Mock Data'}
          </span>
        </div>
      </div>

      {/* On Hand Table */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">On Hand Inventory</h3>
          <button
            onClick={() => setShowCreateIngredient(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ingredient</span>
          </button>
        </div>

        {ingredients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Basis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                        <div className="text-sm text-gray-500">
                          ${ingredient.costPerUnit.toFixed(4)} per {ingredient.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ingredient.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ingredient.inventory?.quantity.toFixed(4) || '0.0000'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${ingredient.inventory?.costBasis.toFixed(4) || '0.0000'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ingredient.inventory?.updatedAt 
                        ? new Date(ingredient.inventory.updatedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedIngredient(ingredient.id);
                          setShowPurchaseDrawer(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Purchase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Ingredients Found</h3>
            <p className="text-gray-600">
              Get started by adding your first ingredient to track inventory and costs.
            </p>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Filter transactions by type"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchases</option>
              <option value="sale">Sales</option>
              <option value="adjustment">Adjustments</option>
              <option value="waste">Waste</option>
            </select>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.type === 'purchase' ? 'bg-green-500' :
                    tx.type === 'sale' ? 'bg-red-500' :
                    tx.type === 'adjustment' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {tx.ingredient.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {tx.type} • {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    tx.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.quantity > 0 ? '+' : ''}{tx.quantity.toFixed(4)} {tx.ingredient.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${tx.unitCost.toFixed(4)} per unit
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>

      {/* Create Ingredient Modal */}
      {showCreateIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Ingredient</h3>
              <button
                onClick={() => setShowCreateIngredient(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateIngredient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  name="unit"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Select ingredient unit"
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="l">Liters (l)</option>
                  <option value="unit">Units</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost per Unit</label>
                <input
                  type="number"
                  name="costPerUnit"
                  step="0.0001"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="organic, local, premium"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateIngredient(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createIngredientMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createIngredientMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Drawer */}
      {showPurchaseDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Record Purchase</h3>
              <button
                onClick={() => setShowPurchaseDrawer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePurchase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ingredient</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Select ingredient for purchase"
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  step="0.0001"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
                <input
                  type="number"
                  value={purchaseUnitCost}
                  onChange={(e) => setPurchaseUnitCost(Number(e.target.value))}
                  step="0.0001"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPurchaseDrawer(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {purchaseMutation.isPending ? 'Recording...' : 'Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Restock Section */}
      {flags.SMART_RESTOCK && (
        <SmartRestockSection vendorId={vendorId} />
      )}
    </div>
  );
}

// Smart Restock Component
function SmartRestockSection({ vendorId }: { vendorId: string }) {
  const [lookbackDays, setLookbackDays] = useState(30);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const suggestionsQuery = useRestockSuggestions(vendorId, lookbackDays);
  const createPOMutation = useCreatePO(vendorId);
  
  const suggestions = suggestionsQuery.data || [];
  
  const handleItemToggle = (ingredientId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedItems(newSelected);
  };
  
  const handleCreatePO = async () => {
    if (selectedItems.size === 0) return;
    
    const lines = suggestions
      .filter(s => selectedItems.has(s.ingredientId))
      .map(s => ({
        ingredientId: s.ingredientId,
        quantity: s.suggestedQty,
        unitCost: 0 // This would need to be filled in with actual costs
      }));
    
    try {
      const po = await createPOMutation.mutateAsync({ lines });
      alert(`Purchase Order created: ${po.poNumber}`);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to create PO:', error);
      alert('Failed to create purchase order');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Smart Restock</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Lookback Period:</label>
            <select
              value={lookbackDays}
              onChange={(e) => setLookbackDays(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </div>
          <button
            onClick={handleCreatePO}
            disabled={selectedItems.size === 0 || createPOMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {createPOMutation.isPending ? 'Creating...' : `Create PO (${selectedItems.size} items)`}
          </button>
        </div>
      </div>
      
      {suggestionsQuery.isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Calculating restock suggestions...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === suggestions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(suggestions.map(s => s.ingredientId)));
                      } else {
                        setSelectedItems(new Set());
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On Hand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Velocity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Point
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suggested Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suggestions.map((suggestion) => (
                <tr key={suggestion.ingredientId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(suggestion.ingredientId)}
                      onChange={() => handleItemToggle(suggestion.ingredientId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {suggestion.onHand.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {suggestion.dailyVelocity.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {suggestion.leadTimeDays} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {suggestion.reorderPoint.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {suggestion.suggestedQty.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suggestion.preferredSupplierId || 'Any'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No restock suggestions found. All ingredients are well-stocked!
        </div>
      )}
    </div>
  );
}
