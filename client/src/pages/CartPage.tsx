'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  ShoppingCart, Plus, Minus, Trash, MapPin, Clock, Calendar,
  CreditCard, Wallet, Gift, AlertTriangle, CheckCircle, Info,
  X, ChevronDown, ChevronUp, Star, Heart, Share2, Copy,
  MessageCircle, Bell, Shield, Lock, Eye, EyeOff, Truck,
  Package, Users, DollarSign, Percent, Tag, Sparkles,
  Brain, Zap, Target, TrendingUp, ArrowRight, ArrowLeft,
  Filter, Search, Settings, HelpCircle, Phone, Mail,
  Camera, QrCode, Receipt, Download, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  modifiers: Array<{
    name: string;
    price: number;
  }>;
  fulfillmentType: 'pickup' | 'delivery' | 'ship' | 'event';
  pickupLocation?: string;
  deliveryZone?: string;
  maxDeliveryDistance?: number;
  isAvailable: boolean;
  stockLevel: number;
  reservedUntil?: string;
  notes?: string;
}

interface Vendor {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  isOnVacation: boolean;
  vacationEndDate?: string;
  deliveryFee: number;
  pickupFee: number;
  minOrderAmount: number;
  deliveryZones: string[];
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    hours: string;
  }>;
  availability: Array<{
    day: string;
    pickupSlots: string[];
    deliverySlots: string[];
  }>;
  tips: {
    enabled: boolean;
    suggested: number[];
    custom: boolean;
  };
}

interface CartState {
  items: CartItem[];
  vendors: { [key: string]: Vendor };
  zipCode: string;
  deliveryAddress?: string;
  selectedFulfillment: { [key: string]: 'pickup' | 'delivery' };
  selectedPickupLocation: { [key: string]: string };
  selectedDateTime: { [key: string]: { date: string; time: string } };
  appliedDiscounts: Array<{
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    vendorId?: string;
  }>;
  tips: { [key: string]: number };
  paymentMethod: 'card' | 'wallet' | 'mixed';
  walletBalance: number;
  savedCarts: Array<{
    id: string;
    name: string;
    items: CartItem[];
    createdAt: string;
  }>;
}

interface AISuggestion {
  id: string;
  type: 'vendor_vacation' | 'combine_pickup' | 'cross_sell' | 'stock_warning' | 'delivery_zone';
  title: string;
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  vendorId?: string;
  productId?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    vendors: {},
    zipCode: '',
    selectedFulfillment: {},
    selectedPickupLocation: {},
    selectedDateTime: {},
    appliedDiscounts: [],
    tips: {},
    paymentMethod: 'card',
    walletBalance: 150.00,
    savedCarts: []
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartTimer, setCartTimer] = useState(600); // 10 minutes
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: 'item1',
        productId: 'prod1',
        vendorId: 'vendor1',
        vendorName: 'Rose Creek Bakery',
        productName: 'Artisan Sourdough Bread',
        productImage: '/images/sourdough.jpg',
        price: 8.50,
        quantity: 2,
        modifiers: [
          { name: 'Extra Crispy', price: 1.00 }
        ],
        fulfillmentType: 'pickup',
        pickupLocation: 'Downtown Market',
        isAvailable: true,
        stockLevel: 15
      },
      {
        id: 'item2',
        productId: 'prod2',
        vendorId: 'vendor2',
        vendorName: 'Sweet Dreams Pastry',
        productName: 'Chocolate Croissant',
        productImage: '/images/croissant.jpg',
        price: 4.50,
        quantity: 1,
        modifiers: [],
        fulfillmentType: 'delivery',
        deliveryZone: '30248',
        maxDeliveryDistance: 10,
        isAvailable: true,
        stockLevel: 8
      }
    ];

    const mockVendors: { [key: string]: Vendor } = {
      vendor1: {
        id: 'vendor1',
        name: 'Rose Creek Bakery',
        logo: '/images/rosecreek-logo.jpg',
        rating: 4.8,
        reviewCount: 127,
        isOnVacation: false,
        deliveryFee: 3.50,
        pickupFee: 0,
        minOrderAmount: 15.00,
        deliveryZones: ['30248', '30249', '30250'],
        pickupLocations: [
          {
            id: 'pickup1',
            name: 'Downtown Market',
            address: '123 Main St, McDonough, GA 30248',
            hours: 'Mon-Sat 8AM-6PM'
          }
        ],
        availability: [
          {
            day: 'Monday',
            pickupSlots: ['8:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'],
            deliverySlots: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM']
          }
        ],
        tips: {
          enabled: true,
          suggested: [10, 15, 20],
          custom: true
        }
      },
      vendor2: {
        id: 'vendor2',
        name: 'Sweet Dreams Pastry',
        logo: '/images/sweetdreams-logo.jpg',
        rating: 4.6,
        reviewCount: 89,
        isOnVacation: false,
        deliveryFee: 2.50,
        pickupFee: 0,
        minOrderAmount: 10.00,
        deliveryZones: ['30248', '30249'],
        pickupLocations: [
          {
            id: 'pickup2',
            name: 'Sweet Dreams Store',
            address: '456 Oak Ave, McDonough, GA 30248',
            hours: 'Tue-Sun 7AM-7PM'
          }
        ],
        availability: [
          {
            day: 'Monday',
            pickupSlots: ['7:00 AM', '9:00 AM', '1:00 PM', '3:00 PM'],
            deliverySlots: ['8:00 AM - 10:00 AM', '1:00 PM - 3:00 PM']
          }
        ],
        tips: {
          enabled: true,
          suggested: [10, 15, 20],
          custom: true
        }
      }
    };

    const mockSuggestions: AISuggestion[] = [
      {
        id: 'sugg1',
        type: 'cross_sell',
        title: 'Add a dip?',
        message: '64% of customers who bought this bread also added our artisanal olive oil dip.',
        action: 'Add to cart',
        priority: 'medium',
        vendorId: 'vendor1',
        productId: 'dip1'
      },
      {
        id: 'sugg2',
        type: 'combine_pickup',
        title: 'Combine pickup?',
        message: 'Both vendors have pickup available on Tuesday. Save on delivery fees!',
        action: 'View options',
        priority: 'high'
      }
    ];

    setCart(prev => ({
      ...prev,
      items: mockCartItems,
      vendors: mockVendors
    }));
    setAiSuggestions(mockSuggestions);
  }, []);

  // Cart timer countdown
  useEffect(() => {
    if (cartTimer > 0 && cart.items.length > 0) {
      const timer = setInterval(() => {
        setCartTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cartTimer, cart.items.length]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => {
      const itemTotal = (item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateVendorFees = () => {
    const vendorFees: { [key: string]: number } = {};
    
    cart.items.forEach(item => {
      const vendor = cart.vendors[item.vendorId];
      if (vendor) {
        const fulfillmentType = cart.selectedFulfillment[item.vendorId] || item.fulfillmentType;
        const fee = fulfillmentType === 'delivery' ? vendor.deliveryFee : vendor.pickupFee;
        vendorFees[item.vendorId] = (vendorFees[item.vendorId] || 0) + fee;
      }
    });
    
    return vendorFees;
  };

  const calculateTips = () => {
    return Object.values(cart.tips).reduce((total, tip) => total + tip, 0);
  };

  const calculateDiscounts = () => {
    return cart.appliedDiscounts.reduce((total, discount) => {
      if (discount.type === 'percentage') {
        return total + (calculateSubtotal() * discount.value / 100);
      }
      return total + discount.value;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vendorFees = Object.values(calculateVendorFees()).reduce((sum, fee) => sum + fee, 0);
    const tips = calculateTips();
    const discounts = calculateDiscounts();
    const tax = (subtotal - discounts) * 0.07; // 7% tax
    
    return subtotal + vendorFees + tips - discounts + tax;
  };

  const handleZipCodeChange = (zip: string) => {
    setCart(prev => ({ ...prev, zipCode: zip }));
    
    // Check delivery zones and update suggestions
    const newSuggestions: AISuggestion[] = [];
    
    cart.items.forEach(item => {
      const vendor = cart.vendors[item.vendorId];
      if (vendor && !vendor.deliveryZones.includes(zip)) {
        newSuggestions.push({
          id: `zone_${item.vendorId}`,
          type: 'delivery_zone',
          title: 'Outside delivery zone',
          message: `${vendor.name} doesn't deliver to ${zip}. Remove or save for later?`,
          action: 'Remove item',
          priority: 'high',
          vendorId: item.vendorId
        });
      }
    });
    
    setAiSuggestions(prev => [...prev, ...newSuggestions]);
  };

  const handleAISuggestion = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'vendor_vacation':
        // Remove items from vacation vendor
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.vendorId !== suggestion.vendorId)
        }));
        break;
      case 'cross_sell':
        // Add suggested product
        console.log('Adding cross-sell product:', suggestion.productId);
        break;
      case 'combine_pickup':
        setShowFulfillmentModal(true);
        break;
      case 'delivery_zone':
        // Remove items from vendor outside delivery zone
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.vendorId !== suggestion.vendorId)
        }));
        break;
    }
    
    // Remove the suggestion
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const groupItemsByVendor = () => {
    const groups: { [key: string]: CartItem[] } = {};
    cart.items.forEach(item => {
      if (!groups[item.vendorId]) {
        groups[item.vendorId] = [];
      }
      groups[item.vendorId].push(item);
    });
    return groups;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate checkout process
    setTimeout(() => {
      setShowCheckout(true);
      setIsProcessing(false);
    }, 2000);
  };

  const applyDiscountCode = () => {
    if (!discountCode.trim()) return;
    
    // Mock discount application
    const newDiscount = {
      code: discountCode,
      type: 'percentage' as const,
      value: 10
    };
    
    setCart(prev => ({
      ...prev,
      appliedDiscounts: [...prev.appliedDiscounts, newDiscount]
    }));
    
    setDiscountCode('');
  };

  const saveCart = () => {
    const cartName = `Cart ${new Date().toLocaleDateString()}`;
    const newSavedCart = {
      id: Date.now().toString(),
      name: cartName,
      items: cart.items,
      createdAt: new Date().toISOString()
    };
    
    setCart(prev => ({
      ...prev,
      savedCarts: [...prev.savedCarts, newSavedCart]
    }));
  };

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-gray-600">
                {cart.items.length} items from {Object.keys(groupItemsByVendor()).length} vendors
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveCart}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Heart className="w-4 h-4" />
                Save Cart
              </button>
              <button
                onClick={() => setShowLiveChat(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
              >
                <MessageCircle className="w-4 h-4" />
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ZIP Code Input */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Delivery ZIP:</span>
            </div>
            <input
              ref={zipInputRef}
              type="text"
              value={cart.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              placeholder="Enter ZIP code"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              maxLength={5}
            />
            {cart.zipCode && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Valid delivery area
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {showAISuggestions && aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.message}</p>
                  </div>
                  <button
                    onClick={() => handleAISuggestion(suggestion)}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-600/90"
                  >
                    {suggestion.action}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Timer Warning */}
      {cartTimer < 300 && cart.items.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                Complete checkout in {Math.floor(cartTimer / 60)}:{(cartTimer % 60).toString().padStart(2, '0')} to secure your items
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                <Link href="/">
                  <button className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    Browse Products
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupItemsByVendor()).map(([vendorId, items]) => {
                  const vendor = cart.vendors[vendorId];
                  if (!vendor) return null;

                  return (
                    <div key={vendorId} className="bg-white rounded-lg border overflow-hidden">
                      {/* Vendor Header */}
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span>{vendor.rating}</span>
                                <span>({vendor.reviewCount} reviews)</span>
                              </div>
                            </div>
                          </div>
                          {vendor.isOnVacation && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">On vacation</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vendor Items */}
                      <div className="divide-y">
                        {items.map((item) => (
                          <div key={item.id} className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                    <p className="text-sm text-gray-600">{vendor.name}</p>
                                    {item.modifiers.length > 0 && (
                                      <div className="mt-1">
                                        {item.modifiers.map((mod, index) => (
                                          <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-1">
                                            {mod.name} (+${mod.price.toFixed(2)})
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                      ${((item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      ${(item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)).toFixed(2)} each
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </div>

                                {!item.isAvailable && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    Currently unavailable
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Vendor Fulfillment Options */}
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                setSelectedVendor(vendorId);
                                setShowFulfillmentModal(true);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Calendar className="w-4 h-4" />
                              Schedule {cart.selectedFulfillment[vendorId] || 'pickup'}
                            </button>
                            <span className="text-sm text-gray-600">
                              {cart.selectedFulfillment[vendorId] === 'delivery' ? 
                                `Delivery fee: $${vendor.deliveryFee.toFixed(2)}` :
                                'Free pickup'
                              }
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Vendor total</p>
                            <p className="font-semibold text-gray-900">
                              ${items.reduce((total, item) => {
                                const itemTotal = (item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity;
                                return total + itemTotal;
                              }, 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {Object.entries(calculateVendorFees()).map(([vendorId, fee]) => {
                  const vendor = cart.vendors[vendorId];
                  return (
                    <div key={vendorId} className="flex justify-between text-sm">
                      <span>{vendor?.name} fees</span>
                      <span>${fee.toFixed(2)}</span>
                    </div>
                  );
                })}
                
                {calculateTips() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tips</span>
                    <span>${calculateTips().toFixed(2)}</span>
                  </div>
                )}
                
                {cart.appliedDiscounts.length > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discounts</span>
                    <span>-${calculateDiscounts().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${((calculateSubtotal() - calculateDiscounts()) * 0.07).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                  <button
                    onClick={applyDiscountCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Cost Breakdown Toggle */}
              <button
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="w-full mb-6 text-left text-sm text-gray-600 hover:text-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {showCostBreakdown ? 'Hide' : 'Show'} fee breakdown
                </div>
              </button>

              {showCostBreakdown && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">Fee Breakdown</h4>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Platform service fee</span>
                      <span>2.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment processing</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery insurance</span>
                      <span>Included</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.items.length === 0 || isProcessing}
                className="w-full py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {showFulfillmentModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Schedule Fulfillment</h2>
                <button
                  onClick={() => setShowFulfillmentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Fulfillment Type */}
                <div>
                  <h3 className="font-semibold mb-3">Fulfillment Type</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      onClick={() => setCart(prev => ({
                        ...prev,
                        selectedFulfillment: { ...prev.selectedFulfillment, [selectedVendor]: 'pickup' }
                      }))}
                      className={`p-4 border rounded-lg text-left ${
                        cart.selectedFulfillment[selectedVendor] === 'pickup' ? 'border-brand-green bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <Package className="w-5 h-5 mb-2" />
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-600">Free pickup at vendor location</div>
                    </button>
                    <button
                      onClick={() => setCart(prev => ({
                        ...prev,
                        selectedFulfillment: { ...prev.selectedFulfillment, [selectedVendor]: 'delivery' }
                      }))}
                      className={`p-4 border rounded-lg text-left ${
                        cart.selectedFulfillment[selectedVendor] === 'delivery' ? 'border-brand-green bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <Truck className="w-5 h-5 mb-2" />
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-600">Delivered to your address</div>
                    </button>
                  </div>
                </div>

                {/* Pickup Location */}
                {cart.selectedFulfillment[selectedVendor] === 'pickup' && (
                  <div>
                    <h3 className="font-semibold mb-3">Pickup Location</h3>
                    <div className="space-y-2">
                      {cart.vendors[selectedVendor]?.pickupLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => setCart(prev => ({
                            ...prev,
                            selectedPickupLocation: { ...prev.selectedPickupLocation, [selectedVendor]: location.id }
                          }))}
                          className={`w-full p-3 border rounded-lg text-left ${
                            cart.selectedPickupLocation[selectedVendor] === location.id ? 'border-brand-green bg-green-50' : 'border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-600">{location.address}</div>
                          <div className="text-sm text-gray-500">{location.hours}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date & Time Selection */}
                <div>
                  <h3 className="font-semibold mb-3">Date & Time</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={cart.selectedDateTime[selectedVendor]?.date || ''}
                        onChange={(e) => setCart(prev => ({
                          ...prev,
                          selectedDateTime: {
                            ...prev.selectedDateTime,
                            [selectedVendor]: { ...prev.selectedDateTime[selectedVendor], date: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <select
                        value={cart.selectedDateTime[selectedVendor]?.time || ''}
                        onChange={(e) => setCart(prev => ({
                          ...prev,
                          selectedDateTime: {
                            ...prev.selectedDateTime,
                            [selectedVendor]: { ...prev.selectedDateTime[selectedVendor], time: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      >
                        <option value="">Select time</option>
                        {cart.vendors[selectedVendor]?.availability[0]?.pickupSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowFulfillmentModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowFulfillmentModal(false)}
                  className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Widget */}
      {showLiveChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg border shadow-lg z-40">
          <div className="p-4 border-b bg-brand-green text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Live Chat</span>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="h-64 overflow-y-auto p-4">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Need help with your order?</p>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <button className="px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <Gift className="w-12 h-12 text-brand-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wait! Don't go yet</h3>
              <p className="text-gray-600 mb-4">Take 10% off your next order when you complete checkout today!</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowExitIntent(false);
                    handleCheckout();
                  }}
                  className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Continue Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
