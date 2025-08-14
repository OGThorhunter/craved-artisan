'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Clock, Truck, Package, Calendar, X, Plus, Minus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  fulfillmentType: 'pickup' | 'delivery' | 'event';
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryFee?: number;
  deliveryInstructions?: string;
  maxQuantity?: number;
  stockLevel: number;
}

interface VendorGroup {
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  items: CartItem[];
  fulfillmentType: 'pickup' | 'delivery' | 'event';
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    hours: string;
  }>;
  deliveryZones: string[];
  deliveryFee: number;
  minOrderAmount: number;
  pickupInstructions: string;
  deliveryInstructions: string;
  eventHandoff?: {
    eventId: string;
    eventName: string;
    eventDate: string;
    eventLocation: string;
  };
}

interface MultiVendorCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateFulfillment: (vendorId: string, fulfillmentType: 'pickup' | 'delivery' | 'event') => void;
  onUpdatePickupLocation: (vendorId: string, locationId: string) => void;
  onUpdatePickupDate: (vendorId: string, date: string) => void;
  onUpdatePickupTime: (vendorId: string, time: string) => void;
  onUpdateDeliveryInstructions: (vendorId: string, instructions: string) => void;
  onProceedToCheckout: () => void;
}

export default function MultiVendorCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateFulfillment,
  onUpdatePickupLocation,
  onUpdatePickupDate,
  onUpdatePickupTime,
  onUpdateDeliveryInstructions,
  onProceedToCheckout
}: MultiVendorCartProps) {
  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());

  // Group items by vendor
  useEffect(() => {
    const groups = items.reduce((acc, item) => {
      const existingGroup = acc.find(group => group.vendorId === item.vendorId);
      
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        acc.push({
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          vendorLogo: item.vendorLogo,
          items: [item],
          fulfillmentType: item.fulfillmentType,
          pickupLocations: [
            {
              id: 'pickup1',
              name: 'Downtown Market',
              address: '123 Main St, McDonough, GA 30248',
              hours: 'Mon-Sat 8AM-6PM'
            },
            {
              id: 'pickup2',
              name: 'Vendor Store',
              address: '456 Oak Ave, McDonough, GA 30248',
              hours: 'Tue-Sun 7AM-7PM'
            }
          ],
          deliveryZones: ['30248', '30249'],
          deliveryFee: 3.99,
          minOrderAmount: 15,
          pickupInstructions: 'Please bring your order confirmation. Items will be ready 15 minutes after order placement.',
          deliveryInstructions: 'Leave at door if no answer. Please call 15 minutes before arrival.'
        });
      }
      
      return acc;
    }, [] as VendorGroup[]);

    setVendorGroups(groups);
  }, [items]);

  const toggleVendorExpansion = (vendorId: string) => {
    const newExpanded = new Set(expandedVendors);
    if (newExpanded.has(vendorId)) {
      newExpanded.delete(vendorId);
    } else {
      newExpanded.add(vendorId);
    }
    setExpandedVendors(newExpanded);
  };

  const getVendorSubtotal = (vendorGroup: VendorGroup) => {
    return vendorGroup.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getVendorTotal = (vendorGroup: VendorGroup) => {
    const subtotal = getVendorSubtotal(vendorGroup);
    const deliveryFee = vendorGroup.fulfillmentType === 'delivery' ? vendorGroup.deliveryFee : 0;
    return subtotal + deliveryFee;
  };

  const getCartTotal = () => {
    return vendorGroups.reduce((sum, group) => sum + getVendorTotal(group), 0);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFulfillmentIcon = (type: 'pickup' | 'delivery' | 'event') => {
    switch (type) {
      case 'pickup':
        return <Package className="w-4 h-4" />;
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getFulfillmentLabel = (type: 'pickup' | 'delivery' | 'event') => {
    switch (type) {
      case 'pickup':
        return 'Pickup';
      case 'delivery':
        return 'Delivery';
      case 'event':
        return 'Event Handoff';
    }
  };

  return (
    <>
      {/* Cart Toggle Button */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="fixed bottom-6 right-6 bg-brand-green text-white p-4 rounded-full shadow-lg hover:bg-brand-green/90 transition-colors z-40"
        aria-label={`Shopping cart with ${getTotalItems()} items`}
      >
        <ShoppingCart className="w-6 h-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto">
                {vendorGroups.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-600">Start shopping to add items to your cart</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                    {vendorGroups.map((vendorGroup) => (
                      <div key={vendorGroup.vendorId} className="border rounded-lg overflow-hidden">
                        {/* Vendor Header */}
                        <div className="bg-gray-50 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={vendorGroup.vendorLogo}
                              alt={vendorGroup.vendorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{vendorGroup.vendorName}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {getFulfillmentIcon(vendorGroup.fulfillmentType)}
                                <span>{getFulfillmentLabel(vendorGroup.fulfillmentType)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleVendorExpansion(vendorGroup.vendorId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className={`w-4 h-4 transform transition-transform ${
                                expandedVendors.has(vendorGroup.vendorId) ? 'rotate-45' : ''
                              }`} />
                            </button>
                          </div>

                          {/* Fulfillment Options */}
                          <div className="flex gap-2">
                            {['pickup', 'delivery', 'event'].map((type) => (
                              <button
                                key={type}
                                onClick={() => onUpdateFulfillment(vendorGroup.vendorId, type as any)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border ${
                                  vendorGroup.fulfillmentType === type
                                    ? 'bg-brand-green text-white border-brand-green'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {getFulfillmentIcon(type as any)}
                                {getFulfillmentLabel(type as any)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="p-4 space-y-3">
                          {vendorGroup.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                                {item.stockLevel <= 3 && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600">
                                    <AlertTriangle className="w-3 h-3" />
                                    Only {item.stockLevel} left
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                  disabled={item.quantity >= (item.maxQuantity || 99)}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500"
                                aria-label="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Vendor Subtotal */}
                        <div className="bg-gray-50 p-4 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>${getVendorSubtotal(vendorGroup).toFixed(2)}</span>
                          </div>
                          {vendorGroup.fulfillmentType === 'delivery' && (
                            <div className="flex justify-between text-sm">
                              <span>Delivery Fee:</span>
                              <span>${vendorGroup.deliveryFee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                            <span>Total:</span>
                            <span>${getVendorTotal(vendorGroup).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Expanded Vendor Options */}
                        <AnimatePresence>
                          {expandedVendors.has(vendorGroup.vendorId) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t overflow-hidden"
                            >
                              <div className="p-4 space-y-4">
                                {/* Pickup Options */}
                                {vendorGroup.fulfillmentType === 'pickup' && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Pickup Location</h4>
                                    <select
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                                      onChange={(e) => onUpdatePickupLocation(vendorGroup.vendorId, e.target.value)}
                                    >
                                      {vendorGroup.pickupLocations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                          {location.name} - {location.address}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* Delivery Instructions */}
                                {vendorGroup.fulfillmentType === 'delivery' && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Delivery Instructions</h4>
                                    <textarea
                                      placeholder="Any special delivery instructions..."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                                      rows={3}
                                      onChange={(e) => onUpdateDeliveryInstructions(vendorGroup.vendorId, e.target.value)}
                                    />
                                  </div>
                                )}

                                {/* Event Handoff */}
                                {vendorGroup.fulfillmentType === 'event' && vendorGroup.eventHandoff && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Event Handoff</h4>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-sm text-blue-900">
                                        <strong>{vendorGroup.eventHandoff.eventName}</strong>
                                      </p>
                                      <p className="text-sm text-blue-700">
                                        {vendorGroup.eventHandoff.eventDate} at {vendorGroup.eventHandoff.eventLocation}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {vendorGroups.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={onProceedToCheckout}
                    className="w-full bg-brand-green text-white py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
