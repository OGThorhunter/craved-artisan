import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle,
  User,
  Calendar,
  DollarSign,
  Tag,
  Edit,
  Trash2
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  expectedDeliveryDate: string;
  assignedTo?: string;
  tags: string[];
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    status: 'pending' | 'in_production' | 'completed' | 'cancelled';
  }>;
}

interface OrderKanbanBoardProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
  onOrderEdit?: (order: Order) => void;
  onOrderDelete?: (orderId: string) => void;
}

const OrderKanbanBoard: React.FC<OrderKanbanBoardProps> = ({
  orders,
  onOrderClick,
  onStatusUpdate,
  onOrderEdit,
  onOrderDelete
}) => {
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

  const columns = [
    {
      id: 'pending',
      title: 'Pending',
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-100 text-blue-800',
      icon: CheckCircle
    },
    {
      id: 'in_production',
      title: 'In Production',
      color: 'bg-orange-50 border-orange-200',
      headerColor: 'bg-orange-100 text-orange-800',
      icon: Package
    },
    {
      id: 'ready_for_pickup',
      title: 'Ready for Pickup',
      color: 'bg-purple-50 border-purple-200',
      headerColor: 'bg-purple-100 text-purple-800',
      icon: Truck
    },
    {
      id: 'shipped',
      title: 'Shipped',
      color: 'bg-indigo-50 border-indigo-200',
      headerColor: 'bg-indigo-100 text-indigo-800',
      icon: Truck
    },
    {
      id: 'delivered',
      title: 'Delivered',
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  ];

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const handleDragStart = (e: React.DragEvent, order: Order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedOrder && draggedOrder.status !== newStatus) {
      onStatusUpdate?.(draggedOrder.id, newStatus);
    }
    setDraggedOrder(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressPercentage = (order: Order) => {
    const totalItems = order.items.length;
    const completedItems = order.items.filter(item => item.status === 'completed').length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Order Pipeline</h3>
          <div className="text-sm text-gray-500">
            {orders.length} total orders
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnOrders = getOrdersByStatus(column.id);
            const ColumnIcon = column.icon;
            
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={`${column.headerColor} rounded-lg p-3 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ColumnIcon className="h-5 w-5" />
                      <h4 className="font-medium">{column.title}</h4>
                    </div>
                    <span className="text-sm font-medium">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className={`${column.color} rounded-lg border-2 border-dashed min-h-96 p-3`}>
                  <div className="space-y-3">
                    {columnOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                        onClick={() => onOrderClick?.(order)}
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {order.orderNumber}
                            </h5>
                            <p className="text-sm text-gray-500 truncate">
                              {order.customerName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[order.priority].color}`}>
                              {priorityConfig[order.priority].label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOrderEdit?.(order);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit order"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Total</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Delivery</span>
                            <span className="text-gray-900">
                              {formatDate(order.expectedDeliveryDate)}
                            </span>
                          </div>

                          {order.assignedTo && (
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              <span className="truncate">{order.assignedTo}</span>
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(getProgressPercentage(order))}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage(order)}%` }}
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          {order.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {order.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                                >
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </span>
                              ))}
                              {order.tags.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{order.tags.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Items Summary */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    item.status === 'completed' ? 'bg-green-400' :
                                    item.status === 'in_production' ? 'bg-orange-400' :
                                    item.status === 'cancelled' ? 'bg-red-400' :
                                    'bg-gray-300'
                                  }`}
                                  title={`${item.productName} - ${item.status}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {columnOrders.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <ColumnIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No orders in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-gray-700">Legend:</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-gray-600">In Production</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Drag orders between columns to update status
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderKanbanBoard;












