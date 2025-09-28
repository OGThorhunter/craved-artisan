import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';

export const CartDropdown: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice, 
    isOpen, 
    setIsOpen 
  } = useCart();
  
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handle hover events to keep dropdown open
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 500); // Increased timeout to 500ms
    setHoverTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Close cart"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {/* Item Image */}
                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.vendorName}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Increase quantity"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-gray-100 mt-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">
                Total ({getTotalItems()} items)
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <Link 
                href="/checkout"
                className="block w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors text-center font-medium"
                onClick={() => setIsOpen(false)}
              >
                Checkout
              </Link>
              <Link 
                href="/cart"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                onClick={() => setIsOpen(false)}
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
