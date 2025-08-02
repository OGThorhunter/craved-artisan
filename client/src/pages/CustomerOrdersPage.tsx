import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, Truck, AlertCircle, Eye, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// TypeScript interfaces
interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
}

interface Fulfillment {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  type: 'SHIPPING' | 'PICKUP' | 'DELIVERY';
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  notes: string | null;
}

interface ShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  fulfillment: Fulfillment | null;
  shippingAddress: ShippingAddress | null;
}

interface OrderHistoryResponse {
  orders: Order[];
}

// Helper function to get status icon and color
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    case 'IN_PROGRESS':
      return { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'COMPLETED':
      return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
    case 'CANCELLED':
    case 'FAILED':
      return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
    default:
      return { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to generate PDF invoice
const generateInvoicePDF = async (order: Order) => {
  try {
    const element = document.getElementById(`order-${order.id}`);
    if (!element) {
      console.error('Order element not found');
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`invoice-${order.orderNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to simple text download
    const invoiceContent = `
INVOICE

Order Number: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}

BILL TO:
${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}
${order.shippingAddress?.address1}
${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}

ITEMS:
${order.items.map(item => 
  `${item.product.name} x${item.quantity} - $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`
).join('\n')}

SUBTOTAL: $${order.subtotal.toFixed(2)}
TAX: $${order.tax.toFixed(2)}
SHIPPING: $${order.shipping.toFixed(2)}
TOTAL: $${order.total.toFixed(2)}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, isOpen, onClose }: { order: Order | null; isOpen: boolean; onClose: () => void }) => {
  if (!order || !isOpen) return null;

  const StatusIcon = getStatusInfo(order.fulfillment?.status || 'PENDING').icon;
  const statusColor = getStatusInfo(order.fulfillment?.status || 'PENDING').color;
  const statusBgColor = getStatusInfo(order.fulfillment?.status || 'PENDING').bgColor;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Download Invoice"
            >
              <Download className="h-4 w-4" />
              Invoice
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                <StatusIcon className="h-4 w-4" />
                {order.fulfillment?.status || 'PENDING'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.fulfillment?.trackingNumber && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Tracking Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tracking Number:</span> {order.fulfillment.trackingNumber}</p>
                {order.fulfillment.carrier && (
                  <p><span className="font-medium">Carrier:</span> {order.fulfillment.carrier}</p>
                )}
                {order.fulfillment.estimatedDelivery && (
                  <p><span className="font-medium">Estimated Delivery:</span> {formatDate(order.fulfillment.estimatedDelivery)}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  {order.shippingAddress.company && `, ${order.shippingAddress.company}`}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Fulfillment Notes */}
          {order.fulfillment?.notes && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Vendor Notes</h3>
              <p className="text-blue-800">{order.fulfillment.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerOrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ordersPerPage = 5;

  const { data, isLoading, error } = useQuery<OrderHistoryResponse>({
    queryKey: ['orderHistory'],
    queryFn: async () => {
      const response = await axios.get('/api/orders/history');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 bg-gray-50">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600">Unable to load your order history. Please try again later.</p>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View your order history and track your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentOrders.map((order) => {
              const StatusIcon = getStatusInfo(order.fulfillment?.status || 'PENDING').icon;
              const statusColor = getStatusInfo(order.fulfillment?.status || 'PENDING').color;
              const statusBgColor = getStatusInfo(order.fulfillment?.status || 'PENDING').bgColor;

              return (
                                                  <div key={order.id} id={`order-${order.id}`} className="border rounded p-4 mb-4">
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900">
                         Order #{order.orderNumber}
                       </h3>
                       <p className="text-sm text-gray-600">
                         Placed on {formatDate(order.createdAt)}
                       </p>
                       {order.fulfillment?.trackingNumber && (
                         <p className="text-sm text-gray-700">Tracking #: {order.fulfillment.trackingNumber}</p>
                       )}
                       {order.fulfillment?.notes && (
                         <p className="text-sm italic text-gray-600 mt-1">Notes: {order.fulfillment.notes}</p>
                       )}
                     </div>
                     <div className="text-right">
                       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                         <StatusIcon className="h-4 w-4" />
                         {order.fulfillment?.status || 'PENDING'}
                       </span>
                       <p className="text-lg font-bold text-gray-900 mt-2">
                         ${order.total.toFixed(2)}
                       </p>
                     </div>
                   </div>

                   <div className="space-y-2 mb-4">
                     {order.items.slice(0, 3).map((item) => (
                       <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                         {item.product.imageUrl ? (
                           <img 
                             src={item.product.imageUrl} 
                             alt={item.product.name} 
                             className="w-12 h-12 object-cover rounded" 
                           />
                         ) : (
                           <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                             <Package className="h-6 w-6 text-gray-400" />
                           </div>
                         )}
                         <div className="flex-1">
                           <span>{item.product.name} x {item.quantity}</span>
                         </div>
                         <div>${(item.price * item.quantity).toFixed(2)}</div>
                       </div>
                     ))}
                     {order.items.length > 3 && (
                       <p className="text-sm text-gray-500 text-center">
                         +{order.items.length - 3} more items
                       </p>
                     )}
                   </div>

                   <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => openOrderModal(order)}
                         className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                         title="View order details"
                       >
                         <Eye className="h-4 w-4" />
                         View Details
                       </button>
                       <button
                         onClick={() => generateInvoicePDF(order)}
                         className="text-sm text-blue-600 underline"
                         title="Download invoice"
                       >
                         Download Invoice
                       </button>
                     </div>
                     <div className="text-sm text-gray-600">
                       {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                     </div>
                   </div>
                 </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeOrderModal}
      />
    </div>
  );
};

export default CustomerOrdersPage; 