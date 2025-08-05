import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { 
  MapPin, 
  Package, 
  User, 
  CheckCircle, 
  Camera, 
  Truck, 
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  Loader2,
  Route
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  productName: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingZip: string;
  shippingCity: string;
  shippingState: string;
  shippingAddress: string;
  items: OrderItem[];
  fulfillmentStatus: string;
  etaLabel: string | null;
  deliveredAt?: string;
  deliveryPhoto?: string;
  deliveryNotes?: string;
}

interface DeliveryBatch {
  batchId: string;
  deliveryDay: string;
  status: string;
  driverInfo: {
    assignedDriver: string;
    driverPhone: string;
    vehicleId: string;
    routeNumber: string;
  };
  orders: Order[];
  summary: {
    totalOrders: number;
    deliveredOrders: number;
    remainingOrders: number;
    completionPercentage: number;
  };
}

const VendorDeliveryPage: React.FC = () => {
  const { batchId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [optimizeRoute, setOptimizeRoute] = useState(false);
  const [optimizedOrders, setOptimizedOrders] = useState<Order[]>([]);
  const [routeOptimization, setRouteOptimization] = useState<any>(null);

  // Fetch delivery batch data
  const { data: batch, isLoading, error } = useQuery<DeliveryBatch>({
    queryKey: ['delivery-batch', batchId],
    queryFn: async () => {
      const res = await fetch(`/api/vendor/orders/delivery-batches/${batchId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch delivery batch');
      }
      return res.json();
    }
  });

  // Mark order as delivered mutation
  const markDeliveredMutation = useMutation({
    mutationFn: async ({ orderId, photo, notes }: { 
      orderId: string; 
      photo?: File; 
      notes?: string; 
    }) => {
      // Handle photo upload if provided
      let photoUrl: string | undefined;
      if (photo) {
        // In a real app, you would upload to a cloud storage service
        // For now, we'll create a mock URL
        photoUrl = `https://example.com/delivery-photos/${orderId}-${Date.now()}.jpg`;
        console.log('ðŸ“¸ Photo uploaded:', photoUrl);
      }

      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl,
          notes
        })
      });
      
      if (!res.ok) throw new Error('Failed to confirm delivery');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Delivery confirmed successfully! Customer notified.');
      queryClient.invalidateQueries({ queryKey: ['delivery-batch', batchId] });
      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setDeliveryPhoto(null);
      setDeliveryNotes('');
    },
    onError: () => {
      toast.error('Failed to confirm delivery');
    }
  });

  // Route optimization mutation
  const optimizeRouteMutation = useMutation({
    mutationFn: async (orders: Order[]) => {
      const stops = orders.map(order => ({
        zip: order.shippingZip,
        orderId: order.id,
        address: order.shippingAddress,
        customerName: order.customerName
      }));

      const res = await fetch('/api/route/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: '97201', // Default origin (vendor location)
          stops
        })
      });

      if (!res.ok) throw new Error('Failed to optimize route');
      return res.json();
    },
    onSuccess: (data) => {
      setRouteOptimization(data.optimizedRoute.summary);
      // Reorder orders based on optimized route
      const optimizedOrderIds = data.optimizedRoute.stops.map((stop: any) => stop.orderId);
      const reorderedOrders = optimizedOrderIds.map((id: string) => 
        batch?.orders.find(order => order.id === id)
      ).filter(Boolean) as Order[];
      setOptimizedOrders(reorderedOrders);
      toast.success('Route optimized successfully');
    },
    onError: () => {
      toast.error('Failed to optimize route');
    }
  });

  // Handle route optimization toggle
  const handleRouteOptimization = () => {
    if (!batch?.orders) return;
    
    if (optimizeRoute) {
      // Reset to original order
      setOptimizedOrders([]);
      setRouteOptimization(null);
      setOptimizeRoute(false);
    } else {
      // Optimize route
      optimizeRouteMutation.mutate(batch.orders);
      setOptimizeRoute(true);
    }
  };

  // Handle photo capture
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDeliveryPhoto(file);
    }
  };

  // Handle delivery completion
  const handleMarkDelivered = (order: Order) => {
    setSelectedOrder(order);
    setShowDeliveryModal(true);
  };

  // Submit delivery
  const handleSubmitDelivery = () => {
    if (!selectedOrder) return;
    
    markDeliveredMutation.mutate({
      orderId: selectedOrder.id,
      photo: deliveryPhoto || undefined,
      notes: deliveryNotes || undefined
    });
  };

  // Group orders by ZIP code (use optimized orders if available)
  const ordersToGroup = optimizeRoute && optimizedOrders.length > 0 ? optimizedOrders : batch?.orders || [];
  const groupedOrders = ordersToGroup.reduce((acc, order) => {
    const zip = order.shippingZip;
    if (!acc[zip]) {
      acc[zip] = [];
    }
    acc[zip].push(order);
    return acc;
  }, {} as Record<string, Order[]>) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading delivery batch: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">Delivery batch not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
                              onClick={() => setLocation('/vendor/delivery-batching')}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Go back to delivery batching"
              title="Go back to delivery batching"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Delivery Route</h1>
              <p className="responsive-text text-gray-600">Batch {batch.batchId}</p>
            </div>
            <div className="text-right">
              <div className="responsive-text font-medium text-gray-900">
                {batch.summary.deliveredOrders}/{batch.summary.totalOrders}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${batch.summary.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="p-4 bg-blue-50 border-b">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="responsive-text font-medium text-blue-900">{batch.driverInfo.assignedDriver}</p>
            <p className="text-xs text-blue-700">Vehicle: {batch.driverInfo.vehicleId} â€¢ Route: {batch.driverInfo.routeNumber}</p>
          </div>
        </div>
      </div>

      {/* Route Optimization Toggle */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Route className="h-5 w-5 text-green-600" />
            <div>
              <p className="responsive-text font-medium text-gray-900">Route Optimization</p>
              <p className="text-xs text-gray-600">Optimize delivery order for efficiency</p>
            </div>
          </div>
          <button
            onClick={handleRouteOptimization}
            disabled={optimizeRouteMutation.isPending}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg responsive-text font-medium transition-colors ${
              optimizeRoute
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {optimizeRouteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Route className="h-4 w-4" />
            )}
            {optimizeRoute ? 'Optimized' : 'Sort by Optimal Route'}
          </button>
        </div>
        
        {/* Route Optimization Summary */}
        {routeOptimization && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-800 font-medium">Total Distance</p>
                <p className="text-green-700">{routeOptimization.totalDistance} miles</p>
              </div>
              <div>
                <p className="text-green-800 font-medium">Estimated Time</p>
                <p className="text-green-700">{routeOptimization.estimatedTimeHours} hours</p>
              </div>
              <div>
                <p className="text-green-800 font-medium">Fuel Cost</p>
                <p className="text-green-700">${routeOptimization.fuelCost}</p>
              </div>
              <div>
                <p className="text-green-800 font-medium">Method</p>
                <p className="text-green-700">{routeOptimization.optimizationMethod}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Stops */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedOrders).map(([zipCode, orders]) => (
          <div key={zipCode} className="space-y-3">
            {/* ZIP Code Header */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">ZIP {zipCode}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {orders.length} stop{orders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Orders in this ZIP */}
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className={`rounded-xl p-4 shadow-sm bg-white border-2 transition-all ${
                    order.deliveredAt 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                      <p className="responsive-text text-gray-600">Order #{order.orderNumber}</p>
                    </div>
                    {order.deliveredAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Delivered</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                    <p className="responsive-text text-gray-600">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {order.customerPhone && (
                      <a 
                        href={`tel:${order.customerPhone}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="h-3 w-3" />
                        {order.customerPhone}
                      </a>
                    )}
                    <a 
                      href={`mailto:${order.customerEmail}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </a>
                  </div>

                  {/* Items */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="responsive-text font-medium text-gray-700">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </div>
                    <ul className="responsive-text text-gray-600 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          {item.productName} Ã— {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="responsive-text text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
                  </div>

                  {/* Delivery Button */}
                  {!order.deliveredAt ? (
                    <button
                      onClick={() => handleMarkDelivered(order)}
                      disabled={markDeliveredMutation.isPending}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {markDeliveredMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Mark as Delivered
                    </button>
                  ) : (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="responsive-text font-medium">Delivered at {new Date(order.deliveredAt).toLocaleTimeString()}</span>
                      </div>
                      {order.deliveryNotes && (
                        <p className="text-xs text-green-700 mt-1">"{order.deliveryNotes}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Complete Delivery</h3>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  âœ•
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  <p className="responsive-text text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    <Camera className="h-4 w-4 inline mr-1" />
                    Delivery Photo (Optional)
                  </label>
                                     <input
                     type="file"
                     accept="image/*"
                     capture="environment"
                     onChange={handlePhotoCapture}
                     className="w-full responsive-text text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     aria-label="Upload delivery photo"
                     title="Upload delivery photo"
                   />
                  {deliveryPhoto && (
                    <p className="text-xs text-green-600 mt-1">âœ“ Photo selected</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special delivery instructions or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="flex-1 responsive-button border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDelivery}
                    disabled={markDeliveredMutation.isPending}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {markDeliveredMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Complete Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDeliveryPage; 
