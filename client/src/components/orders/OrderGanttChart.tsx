import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Tag
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  productionStartDate?: string;
  productionEndDate?: string;
  assignedTo?: string;
  tags: string[];
}

interface OrderGanttChartProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
  onOrderClick?: (order: Order) => void;
}

const OrderGanttChart: React.FC<OrderGanttChartProps> = ({ 
  orders, 
  startDate, 
  endDate,
  onOrderClick 
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate date range
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }

    const allDates = orders.flatMap(order => [
      new Date(order.createdAt),
      new Date(order.expectedDeliveryDate),
      ...(order.productionStartDate ? [new Date(order.productionStartDate)] : []),
      ...(order.productionEndDate ? [new Date(order.productionEndDate)] : []),
      ...(order.actualDeliveryDate ? [new Date(order.actualDeliveryDate)] : [])
    ]);

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add some padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { start: minDate, end: maxDate };
  }, [orders, startDate, endDate]);

  // Generate timeline
  const timeline = useMemo(() => {
    const days: Date[] = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [dateRange]);

  // Calculate order positions and durations
  const orderTimeline = useMemo(() => {
    return orders.map(order => {
      const start = new Date(order.createdAt);
      const end = new Date(order.expectedDeliveryDate);
      const productionStart = order.productionStartDate ? new Date(order.productionStartDate) : null;
      const productionEnd = order.productionEndDate ? new Date(order.productionEndDate) : null;
      
      // Calculate positions relative to timeline
      const startIndex = Math.max(0, Math.floor((start.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
      const endIndex = Math.min(timeline.length - 1, Math.ceil((end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
      const productionStartIndex = productionStart ? Math.max(0, Math.floor((productionStart.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))) : null;
      const productionEndIndex = productionEnd ? Math.min(timeline.length - 1, Math.ceil((productionEnd.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))) : null;

      return {
        ...order,
        startIndex,
        endIndex,
        productionStartIndex,
        productionEndIndex,
        duration: endIndex - startIndex + 1,
        productionDuration: productionStartIndex && productionEndIndex ? productionEndIndex - productionStartIndex + 1 : 0
      };
    });
  }, [orders, dateRange, timeline]);

  // Status configuration
  const statusConfig = {
    pending: { color: 'bg-yellow-400', textColor: 'text-yellow-800' },
    confirmed: { color: 'bg-blue-400', textColor: 'text-blue-800' },
    in_production: { color: 'bg-orange-400', textColor: 'text-orange-800' },
    ready_for_pickup: { color: 'bg-purple-400', textColor: 'text-purple-800' },
    shipped: { color: 'bg-indigo-400', textColor: 'text-indigo-800' },
    delivered: { color: 'bg-green-400', textColor: 'text-green-800' },
    cancelled: { color: 'bg-red-400', textColor: 'text-red-800' },
  };

  const priorityConfig = {
    low: { borderColor: 'border-gray-300' },
    medium: { borderColor: 'border-blue-300' },
    high: { borderColor: 'border-orange-300' },
    urgent: { borderColor: 'border-red-300' },
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'in_production': return <Package className="h-3 w-3" />;
      case 'ready_for_pickup': return <Truck className="h-3 w-3" />;
      case 'shipped': return <Truck className="h-3 w-3" />;
      case 'delivered': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Order Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">Visual progress tracking for all orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{orders.length}</span> orders
            </div>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B6E02] focus:border-[#5B6E02]"
              title="Select view mode"
            >
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="quarter">Quarter View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Date Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-64 px-4 py-3 bg-gray-50 border-r border-gray-200">
              <span className="text-sm font-medium text-gray-700">Order</span>
            </div>
            <div className="flex-1 flex">
              {timeline.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-16 px-2 py-3 text-center border-r border-gray-200"
                >
                  <div className="text-xs text-gray-600">
                    {formatDate(date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Rows */}
          {orderTimeline.map((order, orderIndex) => (
            <div key={order.id} className="flex border-b border-gray-200 hover:bg-gray-50">
              {/* Order Info */}
              <div className="w-64 px-4 py-3 border-r border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${statusConfig[order.status].color}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {order.customerName}
                    </div>
                    {order.assignedTo && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <User className="h-3 w-3 mr-1" />
                        {order.assignedTo}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative py-3">
                <div className="relative h-8">
                  {/* Order Duration Bar */}
                  <div
                    className={`absolute top-1 h-6 rounded-lg shadow-sm ${statusConfig[order.status].color} ${priorityConfig[order.priority].borderColor} border-2 cursor-pointer hover:opacity-80 hover:shadow-md transition-all duration-200`}
                    style={{
                      left: `${(order.startIndex / timeline.length) * 100}%`,
                      width: `${(order.duration / timeline.length) * 100}%`,
                    }}
                    onClick={() => {
                      setSelectedOrder(order);
                      onOrderClick?.(order);
                    }}
                    title={`${order.orderNumber} - ${order.customerName} (${order.status})`}
                  >
                    <div className="flex items-center justify-center h-full px-2">
                      <span className={`text-xs font-medium ${statusConfig[order.status].textColor} truncate`}>
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Production Bar */}
                  {order.productionStartIndex !== null && order.productionEndIndex !== null && (
                    <div
                      className="absolute top-5 h-2 bg-orange-300 rounded opacity-75"
                      style={{
                        left: `${(order.productionStartIndex / timeline.length) * 100}%`,
                        width: `${(order.productionDuration / timeline.length) * 100}%`,
                      }}
                    />
                  )}

                  {/* Milestone Markers */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    {/* Created Date Marker */}
                    <div
                      className="absolute top-0 w-1 h-8 bg-blue-500 rounded-full"
                      style={{
                        left: `${(order.startIndex / timeline.length) * 100}%`,
                      }}
                    />
                    
                    {/* Expected Delivery Marker */}
                    <div
                      className="absolute top-0 w-1 h-8 bg-green-500 rounded-full"
                      style={{
                        left: `${(order.endIndex / timeline.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="text-sm font-medium text-gray-700">Legend:</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Expected Delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-orange-300 rounded"></div>
            <span className="text-sm text-gray-600">Production Period</span>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close order details"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].color} ${statusConfig[selectedOrder.status].textColor}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[selectedOrder.priority].borderColor} border`}>
                    {selectedOrder.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="text-sm text-gray-900">{selectedOrder.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(new Date(selectedOrder.createdAt))}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Delivery</label>
                  <p className="text-sm text-gray-900">{formatDate(new Date(selectedOrder.expectedDeliveryDate))}</p>
                </div>
              </div>
              {selectedOrder.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedOrder.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderGanttChart;
