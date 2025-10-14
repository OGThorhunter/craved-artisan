import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, Trash2, Search, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  status: string;
  madeQty: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    canShipNationally?: boolean;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  status: string;
  priority: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus?: string;
  orderItems: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  canShipNationally?: boolean;
  active: boolean;
}

interface ModificationItem {
  id?: string;
  orderItemId?: string;
  productId: string;
  productName: string;
  action: 'ADD' | 'REMOVE' | 'UPDATE_QUANTITY' | 'UPDATE_PRICE';
  originalQuantity?: number;
  newQuantity?: number;
  originalPrice?: number;
  newPrice?: number;
  priceImpact: number;
  notes?: string;
}

interface OrderEditModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSave: (modifications: any) => void;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, isOpen, onClose, onSave }) => {
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [modifications, setModifications] = useState<ModificationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
  const [modificationHistory, setModificationHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Financial calculations
  const [newSubtotal, setNewSubtotal] = useState(order.subtotal);
  const [newTax, setNewTax] = useState(order.tax);
  const [newShipping, setNewShipping] = useState(order.shipping);
  const [newTotal, setNewTotal] = useState(order.total);
  const [taxOverride, setTaxOverride] = useState<number | null>(null);
  const [shippingOverride, setShippingOverride] = useState<number | null>(null);
  const [paymentAdjustment, setPaymentAdjustment] = useState(0);

  // Initialize edited items from order
  useEffect(() => {
    if (order) {
      setEditedItems([...order.orderItems]);
      calculateTotals(order.orderItems);
      loadModificationHistory();
    }
  }, [order]);

  // Load modification history
  const loadModificationHistory = async () => {
    if (!order?.id) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`/api/orders/${order.id}/modifications`);
      setModificationHistory(response.data);
    } catch (error) {
      console.error('Error loading modification history:', error);
      toast.error('Failed to load modification history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Calculate new totals when items change
  const calculateTotals = useCallback((items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.0875; // 8.75% - should match CartContext
    const calculatedTax = subtotal * taxRate;
    const calculatedShipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    
    const finalTax = taxOverride !== null ? taxOverride : calculatedTax;
    const finalShipping = shippingOverride !== null ? shippingOverride : calculatedShipping;
    const total = subtotal + finalTax + finalShipping;
    
    setNewSubtotal(subtotal);
    setNewTax(finalTax);
    setNewShipping(finalShipping);
    setNewTotal(total);
    setPaymentAdjustment(total - order.total);
  }, [order.total, taxOverride, shippingOverride]);

  // Recalculate when overrides change
  useEffect(() => {
    calculateTotals(editedItems);
  }, [editedItems, taxOverride, shippingOverride, calculateTotals]);

  // Search for products
  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setAvailableProducts([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/products/search?q=${encodeURIComponent(term)}&active=true`);
      setAvailableProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setEditedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice
        };
        
        // Track modification
        const originalItem = order.orderItems.find(orig => orig.id === itemId);
        if (originalItem && originalItem.quantity !== newQuantity) {
          const modification: ModificationItem = {
            orderItemId: itemId,
            productId: item.productId,
            productName: item.productName,
            action: 'UPDATE_QUANTITY',
            originalQuantity: originalItem.quantity,
            newQuantity,
            originalPrice: originalItem.unitPrice,
            newPrice: item.unitPrice,
            priceImpact: (newQuantity - originalItem.quantity) * item.unitPrice
          };
          
          setModifications(prev => {
            const filtered = prev.filter(mod => mod.orderItemId !== itemId || mod.action !== 'UPDATE_QUANTITY');
            return [...filtered, modification];
          });
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Update item price
  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return;
    
    setEditedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          unitPrice: newPrice,
          total: item.quantity * newPrice
        };
        
        // Track modification
        const originalItem = order.orderItems.find(orig => orig.id === itemId);
        if (originalItem && originalItem.unitPrice !== newPrice) {
          const modification: ModificationItem = {
            orderItemId: itemId,
            productId: item.productId,
            productName: item.productName,
            action: 'UPDATE_PRICE',
            originalQuantity: originalItem.quantity,
            newQuantity: item.quantity,
            originalPrice: originalItem.unitPrice,
            newPrice,
            priceImpact: item.quantity * (newPrice - originalItem.unitPrice)
          };
          
          setModifications(prev => {
            const filtered = prev.filter(mod => mod.orderItemId !== itemId || mod.action !== 'UPDATE_PRICE');
            return [...filtered, modification];
          });
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (itemId: string) => {
    const itemToRemove = editedItems.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    setEditedItems(prev => prev.filter(item => item.id !== itemId));
    
    // Track modification
    const modification: ModificationItem = {
      orderItemId: itemId,
      productId: itemToRemove.productId,
      productName: itemToRemove.productName,
      action: 'REMOVE',
      originalQuantity: itemToRemove.quantity,
      originalPrice: itemToRemove.unitPrice,
      priceImpact: -itemToRemove.total
    };
    
    setModifications(prev => [...prev, modification]);
  };

  // Add new item
  const addProduct = (product: Product, quantity: number = 1) => {
    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: quantity * product.price,
      status: 'QUEUED',
      madeQty: 0,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        canShipNationally: product.canShipNationally
      }
    };
    
    setEditedItems(prev => [...prev, newItem]);
    
    // Track modification
    const modification: ModificationItem = {
      productId: product.id,
      productName: product.name,
      action: 'ADD',
      newQuantity: quantity,
      newPrice: product.price,
      priceImpact: quantity * product.price
    };
    
    setModifications(prev => [...prev, modification]);
    setShowProductSearch(false);
    setSearchTerm('');
  };

  // Handle save
  const handleSave = async () => {
    try {
      const modificationData = {
        orderId: order.id,
        originalSubtotal: order.subtotal,
        originalTax: order.tax,
        originalShipping: order.shipping,
        originalTotal: order.total,
        newSubtotal,
        newTax,
        newShipping,
        newTotal,
        paymentAdjustment,
        reason: 'Order modification via admin panel',
        items: modifications
      };
      
      await onSave(modificationData);
      onClose();
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error saving order modifications:', error);
      toast.error('Failed to save order modifications');
    }
  };

  if (!isOpen) return null;

  const hasChanges = modifications.length > 0 || taxOverride !== null || shippingOverride !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Order {order.orderNumber}</h2>
            <p className="text-sm text-gray-600">{order.customerName} • {order.customerEmail}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit Order
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Modification History ({modificationHistory.length})
            </button>
          </div>

          {activeTab === 'edit' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Button
                  variant="secondary"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Product Search */}
              {showProductSearch && (
                <Card className="p-4 mb-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products to add..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchProducts(e.target.value);
                      }}
                      className="flex-1"
                    />
                  </div>
                  
                  {isSearching && (
                    <div className="text-center py-4 text-gray-500">Searching...</div>
                  )}
                  
                  {availableProducts.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                                {product.canShipNationally && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Ships Nationally
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {editedItems.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            {item.variantName && (
                              <p className="text-sm text-gray-600">{item.variantName}</p>
                            )}
                            {item.product.canShipNationally && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800 mt-1">
                                Ships Nationally
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant="secondary"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="secondary"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 border-0"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="text-center border-0 px-2"
                                min="0"
                              />
                              <Button
                                variant="secondary"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 border-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Unit Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Price
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="pl-8"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          
                          {/* Total */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                {/* Original vs New Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <div className="text-right">
                      <div className="line-through text-gray-400">${order.subtotal.toFixed(2)}</div>
                      <div className="font-medium">${newSubtotal.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <div className="text-right">
                      <div className="line-through text-gray-400">${order.tax.toFixed(2)}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={taxOverride !== null ? taxOverride : newTax}
                          onChange={(e) => setTaxOverride(parseFloat(e.target.value) || 0)}
                          className="w-20 h-6 text-xs text-right"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <div className="text-right">
                      <div className="line-through text-gray-400">
                        {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={shippingOverride !== null ? shippingOverride : newShipping}
                          onChange={(e) => setShippingOverride(parseFloat(e.target.value) || 0)}
                          className="w-20 h-6 text-xs text-right"
                          step="0.01"
                          min="0"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => setShippingOverride(0)}
                          className="text-xs px-2 py-1 h-6"
                          title="Zero out shipping for customer service"
                        >
                          $0
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <div className="text-right">
                        <div className="line-through text-gray-400 text-sm">${order.total.toFixed(2)}</div>
                        <div>${newTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Adjustment */}
                {paymentAdjustment !== 0 && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    paymentAdjustment > 0 
                      ? 'bg-orange-50 border border-orange-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {paymentAdjustment > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {paymentAdjustment > 0 ? 'Additional Charge' : 'Refund Due'}
                        </p>
                        <p className="text-lg font-bold">
                          ${Math.abs(paymentAdjustment).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Modification Summary */}
                {modifications.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Changes Made</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {modifications.map((mod, index) => (
                        <div key={index}>
                          {mod.action === 'ADD' && `+ Added ${mod.productName} (${mod.newQuantity})`}
                          {mod.action === 'REMOVE' && `- Removed ${mod.productName}`}
                          {mod.action === 'UPDATE_QUANTITY' && 
                            `• ${mod.productName}: ${mod.originalQuantity} → ${mod.newQuantity}`}
                          {mod.action === 'UPDATE_PRICE' && 
                            `• ${mod.productName}: $${mod.originalPrice?.toFixed(2)} → $${mod.newPrice?.toFixed(2)}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
          ) : (
          /* History Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Modification History</h3>
              <Button
                variant="secondary"
                onClick={loadModificationHistory}
                disabled={isLoadingHistory}
                className="text-sm"
              >
                {isLoadingHistory ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-8 text-gray-500">
                Loading modification history...
              </div>
            ) : modificationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No modifications have been made to this order.
              </div>
            ) : (
              <div className="space-y-4">
                {modificationHistory.map((modification) => (
                  <Card key={modification.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={`${
                              modification.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800' 
                                : modification.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {modification.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(modification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {modification.reason && (
                          <p className="text-sm text-gray-700">{modification.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          modification.paymentAdjustment > 0 
                            ? 'text-orange-600' 
                            : modification.paymentAdjustment < 0
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}>
                          {modification.paymentAdjustment > 0 && '+'}
                          ${modification.paymentAdjustment.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {modification.paymentAdjustment > 0 ? 'Additional Charge' : 
                           modification.paymentAdjustment < 0 ? 'Refund' : 'No Change'}
                        </div>
                      </div>
                    </div>

                    {/* Total Changes */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Original Totals</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${modification.originalSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${modification.originalTax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>${modification.originalShipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>${modification.originalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">New Totals</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${modification.newSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${modification.newTax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>${modification.newShipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>${modification.newTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item Changes */}
                    {modification.items && modification.items.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Item Changes</h5>
                        <div className="space-y-2">
                          {modification.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    item.action === 'ADD' ? 'bg-green-100 text-green-800' :
                                    item.action === 'REMOVE' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {item.action}
                                </Badge>
                                <span className="text-sm font-medium">{item.productName}</span>
                              </div>
                              <div className="text-right text-sm">
                                {item.action === 'ADD' && (
                                  <div>
                                    <div>Qty: {item.newQuantity}</div>
                                    <div>Price: ${item.newPrice?.toFixed(2)}</div>
                                  </div>
                                )}
                                {item.action === 'REMOVE' && (
                                  <div>
                                    <div>Qty: {item.originalQuantity}</div>
                                    <div>Price: ${item.originalPrice?.toFixed(2)}</div>
                                  </div>
                                )}
                                {item.action === 'UPDATE_QUANTITY' && (
                                  <div>
                                    <div>Qty: {item.originalQuantity} → {item.newQuantity}</div>
                                  </div>
                                )}
                                {item.action === 'UPDATE_PRICE' && (
                                  <div>
                                    <div>Price: ${item.originalPrice?.toFixed(2)} → ${item.newPrice?.toFixed(2)}</div>
                                  </div>
                                )}
                                <div className={`text-xs font-medium ${
                                  item.priceImpact > 0 ? 'text-orange-600' : 
                                  item.priceImpact < 0 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {item.priceImpact > 0 && '+'}${item.priceImpact.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {modification.notes && (
                      <div className="mt-4 pt-3 border-t">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
                        <p className="text-sm text-gray-600">{modification.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal;
