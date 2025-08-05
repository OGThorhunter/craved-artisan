import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import StripePaymentForm from '../components/StripePaymentForm';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Lock,
  Clock,
  Package,
  TrendingUp,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CheckoutPage = () => {
  const { state: { items }, removeItem, updateQuantity, getSubtotal, getTax, getShipping, getTotal, checkout } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('shipping');
  const [customerZip, setCustomerZip] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return await checkout(user.id, prediction);
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setShowPaymentForm(true);
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  });

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to complete your order');
      setLocation('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    checkoutMutation.mutate();
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast.success('Payment successful! Order confirmed.');
    setLocation(`/orders/${orderId}/confirmation`);
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Fetch fulfillment prediction
  useEffect(() => {
    if (items.length === 0) {
      setPrediction(null);
      return;
    }

    const fetchPrediction = async () => {
      setIsLoadingPrediction(true);
      try {
        const response = await axios.post('/api/fulfillment/predict', {
          vendorId: 'mock-vendor-id', // In a real app, this would come from the cart/items
          items: items.map(item => ({
            quantity: item.quantity,
            productId: item.product.id
          })),
          shippingMethod: selectedShippingMethod,
          customerZip: customerZip || undefined
        });
        setPrediction(response.data);
      } catch (error) {
        console.error('Error fetching prediction:', error);
        setPrediction(null);
      } finally {
        setIsLoadingPrediction(false);
      }
    };

    fetchPrediction();
  }, [items, selectedShippingMethod, customerZip]);

  if (items.length === 0) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="responsive-subheading text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart to continue</p>
          <button
            onClick={() => setLocation('/')}
            className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Continue Shopping
            </button>
          </div>
          <h1 className="responsive-heading text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="responsive-subheading text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Order Items ({items.length})
              </h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                      <p className="responsive-text text-gray-600">${item.product.price.toFixed(2)} each</p>
                    </div>

                                         {/* Quantity Controls */}
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                         className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                         disabled={item.quantity <= 1}
                         title="Decrease quantity"
                       >
                         <Minus className="h-4 w-4" />
                       </button>
                       <span className="w-8 text-center font-medium">{item.quantity}</span>
                       <button
                         onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                         className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                         title="Increase quantity"
                       >
                         <Plus className="h-4 w-4" />
                       </button>
                     </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                                         {/* Remove Button */}
                     <button
                       onClick={() => removeItem(item.product.id)}
                       className="p-1 text-red-500 hover:text-red-700 transition-colors"
                       title="Remove item from cart"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="responsive-subheading text-gray-900 mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Method Selection */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Shipping Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="shipping"
                      checked={selectedShippingMethod === 'shipping'}
                      onChange={(e) => setSelectedShippingMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Standard Shipping</span>
                      </div>
                      <p className="responsive-text text-gray-600">3-5 business days</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="local_pickup"
                      checked={selectedShippingMethod === 'local_pickup'}
                      onChange={(e) => setSelectedShippingMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Local Pickup</span>
                      </div>
                      <p className="responsive-text text-gray-600">Same day pickup available</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ZIP Code Input for Shipping */}
              {selectedShippingMethod === 'shipping' && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Delivery ZIP Code</h3>
                  <input
                    type="text"
                    placeholder="Enter ZIP code for accurate delivery estimate"
                    value={customerZip}
                    onChange={(e) => setCustomerZip(e.target.value)}
                    className="w-full responsive-button border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Providing your ZIP code helps us give you a more accurate delivery estimate
                  </p>
                </div>
              )}

              {/* Fulfillment Prediction */}
              {isLoadingPrediction && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="responsive-text text-gray-600">Calculating fulfillment time...</span>
                  </div>
                </div>
              )}

              {prediction && !isLoadingPrediction && (
                <div className="mb-6 space-y-4">
                  {/* Fulfillment Prediction */}
                  <div className="p-4 border rounded-lg bg-blue-50 text-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Estimated Fulfillment</span>
                    </div>
                    <p className="text-sm">
                      <strong>{prediction.predictedFulfillmentTime}</strong>
                    </p>
                    <p className="text-sm mt-1">
                      <strong>{prediction.label}</strong>
                    </p>
                    {prediction.prepTime > 0 && (
                      <p className="text-xs mt-1 text-blue-600">
                        Prep time: {prediction.prepTime} min
                        {prediction.shippingTime > 0 && ` â€¢ Shipping: ${prediction.shippingTime} hrs`}
                      </p>
                    )}
                  </div>

                  {/* Margin Prediction */}
                  {prediction.predictedMargin && (
                    <div className="p-4 border rounded-lg bg-green-50 text-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Margin Prediction</span>
                      </div>
                      <p className="text-sm">
                        <strong>{prediction.predictedMargin}%</strong>
                      </p>
                      <p className="text-sm mt-1">
                        <strong>{prediction.marginLabel}</strong>
                      </p>
                      <p className="text-xs mt-1 text-green-600">
                        Based on {selectedShippingMethod === 'local_pickup' ? 'local pickup' : 'shipping'} method
                      </p>
                    </div>
                  )}

                  {/* ZIP Adjustment Info */}
                  {prediction.zipAdjustment && (
                    <div className="p-3 border rounded-lg bg-blue-50 text-blue-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-medium">{prediction.zipAdjustment}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Notice */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Secure Checkout</span>
                </div>
                <p className="text-sm text-green-700">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Payment Form or Checkout Button */}
              {showPaymentForm && orderId ? (
                <StripePaymentForm
                  orderId={orderId}
                  amount={getTotal()}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </button>
              )}

              {/* Error Display */}
              {checkoutMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      {checkoutMutation.error instanceof Error 
                        ? checkoutMutation.error.message 
                        : 'An error occurred during checkout'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 
