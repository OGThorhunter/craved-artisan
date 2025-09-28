import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'wouter';
import { Plus, Minus, X, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice, 
    clearCart 
  } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to get started!</p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-brand-cream rounded-lg shadow-md">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.vendorName}</p>
                      <p className="text-lg font-bold text-brand-green">{formatCurrency(item.price)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-lg font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-brand-cream rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({getTotalItems()})</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(getTotalPrice() * 0.08)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(getTotalPrice() * 1.08)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    href="/checkout"
                    className="block w-full bg-brand-green text-white py-3 px-4 rounded-lg hover:bg-brand-green/80 transition-colors text-center font-semibold"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-semibold"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}