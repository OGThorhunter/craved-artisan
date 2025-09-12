import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  GripVertical, 
  X, 
  Save,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  MoreVertical,
  Grid3X3,
  List
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  status: 'pending' | 'in_production' | 'completed' | 'cancelled';
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  productionStartDate?: string;
  productionEndDate?: string;
  assignedTo?: string;
  tags: string[];
  orderType?: 'preorder' | 'stock' | 'inventory';
  salesWindowId?: string;
}

interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface OrderTrackerProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  onOrderEdit?: (order: Order) => void;
  onOrderDuplicate?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onOrderClick,
  onOrderEdit,
  onOrderDuplicate,
  onStatusUpdate
}) => {
  // CSS classes for column colors
  const getColumnStyle = (color: string) => ({
    backgroundColor: color
  });
  const [columns, setColumns] = useState<Column[]>([]);
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#3B82F6');
  const [showOrderActions, setShowOrderActions] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Default columns
  const defaultColumns: Column[] = [
    { id: 'start', name: 'Start', color: '#EF4444', order: 0 },
    { id: 'middle', name: 'Middle', color: '#F59E0B', order: 1 },
    { id: 'end', name: 'End', color: '#10B981', order: 2 },
    { id: 'finished', name: 'Finished', color: '#6B7280', order: 3 }
  ];

  // Load columns from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('order-tracker-columns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      setColumns(defaultColumns);
    }
  }, []);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem('order-tracker-columns', JSON.stringify(columns));
    }
  }, [columns]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOrderActions(null);
    };
    
    if (showOrderActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOrderActions]);

  const getOrderStatus = (order: Order): string => {
    // Map order status to column IDs
    const statusMap: Record<string, string> = {
      'pending': 'start',
      'confirmed': 'start',
      'in_production': 'middle',
      'ready_for_pickup': 'end',
      'shipped': 'end',
      'delivered': 'finished',
      'cancelled': 'finished'
    };
    return statusMap[order.status] || 'start';
  };

  const getStatusFromColumn = (columnId: string): string => {
    // Map column IDs back to order statuses
    const columnMap: Record<string, string> = {
      'start': 'pending',
      'middle': 'in_production',
      'end': 'ready_for_pickup',
      'finished': 'delivered'
    };
    return columnMap[columnId] || 'pending';
  };

  const getNextColumn = (currentColumnId: string): string | null => {
    const currentIndex = columns.findIndex(col => col.id === currentColumnId);
    return currentIndex < columns.length - 1 ? columns[currentIndex + 1].id : null;
  };

  const getPreviousColumn = (currentColumnId: string): string | null => {
    const currentIndex = columns.findIndex(col => col.id === currentColumnId);
    return currentIndex > 0 ? columns[currentIndex - 1].id : null;
  };

  const moveOrderToColumn = (orderId: string, columnId: string) => {
    if (onStatusUpdate) {
      const newStatus = getStatusFromColumn(columnId);
      onStatusUpdate(orderId, newStatus);
    }
  };

  const getOrdersForColumn = (columnId: string): Order[] => {
    return orders.filter(order => getOrderStatus(order) === columnId);
  };

  const addColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: `column-${Date.now()}`,
        name: newColumnName.trim(),
        color: newColumnColor,
        order: columns.length
      };
      setColumns([...columns, newColumn]);
      setNewColumnName('');
    }
  };

  const removeColumn = (columnId: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter(col => col.id !== columnId));
    }
  };

  const updateColumnName = (columnId: string, newName: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, name: newName } : col
    ));
  };

  const updateColumnColor = (columnId: string, newColor: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, color: newColor } : col
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Order Tracker</h3>
            <p className="text-sm text-gray-600">Customize your workflow columns</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'card' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Card view"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsEditingColumns(!isEditingColumns)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Settings className="h-4 w-4" />
              <span>{isEditingColumns ? 'Done' : 'Customize'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Column Customization Panel */}
      {isEditingColumns && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Manage Columns</h4>
              
              {/* Add New Column */}
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="sr-only">Column color</label>
                <input
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  title="Column color"
                  aria-label="Column color"
                />
                <button
                  onClick={addColumn}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Column List */}
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div key={column.id} className="flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={getColumnStyle(column.color)}
                    />
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumnName(column.id, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      aria-label={`Column name for ${column.name}`}
                    />
                    <input
                      type="color"
                      value={column.color}
                      onChange={(e) => updateColumnColor(column.id, e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Column color"
                    />
                    {columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(column.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove column"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracker Content */}
      {viewMode === 'card' ? (
        <div className="overflow-x-auto">
          <div className="flex min-w-full">
            {columns.map((column) => (
              <div key={column.id} className="flex-1 min-w-0">
                {/* Column Header */}
                <div 
                  className="px-4 py-3 text-center font-medium text-white text-sm"
                  style={getColumnStyle(column.color)}
                >
                  {column.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({getOrdersForColumn(column.id).length})
                  </span>
                </div>

                {/* Column Content */}
                <div className="min-h-96 p-2 bg-gray-50">
                  {getOrdersForColumn(column.id).map((order) => (
                    <div
                      key={order.id}
                      className="mb-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group min-h-[120px] flex flex-col"
                      onClick={() => onOrderClick?.(order)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* Navigation Buttons - Always Visible */}
                          {getPreviousColumn(column.id) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const prevColumn = getPreviousColumn(column.id);
                                if (prevColumn) {
                                  moveOrderToColumn(order.id, prevColumn);
                                }
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                              title="Move to previous stage"
                              type="button"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                          )}
                          {getNextColumn(column.id) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const nextColumn = getNextColumn(column.id);
                                if (nextColumn) {
                                  moveOrderToColumn(order.id, nextColumn);
                                }
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                              title="Move to next stage"
                              type="button"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowOrderActions(showOrderActions === order.id ? null : order.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Order actions"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </button>
                            
                            {showOrderActions === order.id && (
                              <div className="absolute right-0 top-6 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOrderClick?.(order);
                                    setShowOrderActions(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOrderEdit?.(order);
                                    setShowOrderActions(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit Order
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOrderDuplicate?.(order);
                                    setShowOrderActions(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate Order
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        {/* Order Total */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                        </div>
                        
                        {/* Products */}
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Products:</p>
                            <div className="space-y-1">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 truncate flex-1">
                                    {item.productName || `Product ${index + 1}`}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    {item.quantity}x
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{order.items.length - 3} more products
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No products added</p>
                        )}
                        
                        {/* Tags */}
                        {order.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {order.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                            {order.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{order.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {getOrdersForColumn(column.id).length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      No orders in this stage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-6">
          <div className="space-y-4">
            {columns.map((column) => {
              const columnOrders = getOrdersForColumn(column.id);
              if (columnOrders.length === 0) return null;
              
              return (
                <div key={column.id} className="space-y-3">
                  <div 
                    className="px-4 py-2 rounded-lg text-white font-medium text-sm inline-block"
                    style={getColumnStyle(column.color)}
                  >
                    {column.name} ({columnOrders.length})
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {columnOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow group"
                          onClick={() => onOrderClick?.(order)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <span className="font-medium text-gray-900">
                                {order.orderNumber}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                {order.priority}
                              </span>
                              {order.items && order.items.length > 0 && (
                                <span className="text-gray-500">
                                  {order.items.length} product{order.items.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Navigation Buttons - Always Visible */}
                            <div className="flex items-center space-x-1">
                              {getPreviousColumn(column.id) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const prevColumn = getPreviousColumn(column.id);
                                    if (prevColumn) {
                                      moveOrderToColumn(order.id, prevColumn);
                                    }
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                  title="Move to previous stage"
                                  type="button"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                              )}
                              {getNextColumn(column.id) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const nextColumn = getNextColumn(column.id);
                                    if (nextColumn) {
                                      moveOrderToColumn(order.id, nextColumn);
                                    }
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                  title="Move to next stage"
                                  type="button"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            
                            {/* Actions Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOrderActions(showOrderActions === order.id ? null : order.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Order actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              
                              {showOrderActions === order.id && (
                                <div className="absolute right-0 top-6 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOrderClick?.(order);
                                      setShowOrderActions(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOrderEdit?.(order);
                                      setShowOrderActions(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit Order
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOrderDuplicate?.(order);
                                      setShowOrderActions(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate Order
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
