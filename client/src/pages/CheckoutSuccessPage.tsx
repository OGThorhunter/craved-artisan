import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';

interface OrderDetails {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export default function CheckoutSuccessPage() {
  const [location] = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse orderId from URL query parameters
  const orderId = new URLSearchParams(location.split('?')[1] || '').get('orderId');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    // TODO: Fetch order details from API
    // For now, show mock data
    setOrderDetails({
      id: orderId,
      total: 29.99,
      status: 'paid',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          quantity: 2,
          unitPrice: 14.99,
          subtotal: 29.98
        }
      ]
    });
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Order not found'}
          </div>
          <a 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for your order. Here are your order details:</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order #{orderDetails.id}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            orderDetails.status === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {orderDetails.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order Date:</span>
            <span>{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order Time:</span>
            <span>{new Date(orderDetails.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium mb-3">Order Items:</h3>
          <div className="space-y-2">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>Qty {item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          A confirmation email has been sent to your email address.
        </p>
        <div className="space-x-4">
          <a 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </a>
          <button 
            onClick={() => window.print()}
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
