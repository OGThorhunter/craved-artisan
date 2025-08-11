import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@/lib/http";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ 
  clientSecret, 
  orderId, 
  onSuccess 
}: { 
  clientSecret: string; 
  orderId: string; 
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    const { error } = await stripe.confirmPayment({ 
      elements, 
      confirmParams: { 
        return_url: window.location.origin + "/checkout/success?orderId=" + orderId 
      } 
    });
    
    if (error) { 
      console.error(error);
      setError(error.message || 'Payment failed');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <PaymentElement />
        </div>
        
        <button 
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}

export default function CartPage() {
  const [clientSecret, setClientSecret] = useState<string>();
  const [orderId, setOrderId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: get real cartId/customerId/email from context
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/api/checkout/create-intent', {
          cartId: "dev-cart-id",
          customerId: "dev-customer-id",
          zip: "30248",
          email: "dev@local.test"
        });
        
        const data = response.data;
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
      } catch (err: any) {
        console.error('Failed to create payment intent:', err);
        setError(err.response?.data?.error || 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          Unable to load checkout. Please try again.
        </div>
      </div>
    );
  }

  return (
    <Elements options={{ clientSecret }} stripe={stripePromise}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        orderId={orderId} 
        onSuccess={(id) => {
          window.location.href = "/checkout/success?orderId=" + id;
        }} 
      />
    </Elements>
  );
}
