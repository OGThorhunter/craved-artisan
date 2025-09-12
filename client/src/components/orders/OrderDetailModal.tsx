import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  X, 
  Edit, 
  Printer, 
  Download, 
  Calendar,
  User,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Tag,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

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
  isPreOrder?: boolean;
  salesWindowId?: string;
}

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

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onEdit?: (order: Order) => void;
  onSave?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
  onAssign?: (orderId: string, assignedTo: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onEdit,
  onSave,
  onStatusUpdate,
  onAssign
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Order>>({});
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{product: any, quantity: number}>>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  // Mock customer data
  const mockCustomers = [
    { id: 'cust-1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567' },
    { id: 'cust-2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678' },
    { id: 'cust-3', name: 'Mike Wilson', email: 'mike.wilson@email.com', phone: '(555) 345-6789' },
    { id: 'cust-4', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890' },
    { id: 'cust-5', name: 'David Brown', email: 'david.brown@email.com', phone: '(555) 567-8901' },
    { id: 'stock', name: 'Stock for Event', email: 'stock@event.com', phone: '(555) 000-0000' },
  ];

  // Mock product data
  const mockProducts = [
    { id: 'prod-1', name: 'Artisan Bread Loaf', price: 8.50, category: 'Bread', inStock: true },
    { id: 'prod-2', name: 'Chocolate Croissant', price: 4.25, category: 'Pastry', inStock: true },
    { id: 'prod-3', name: 'Sourdough Starter Kit', price: 15.00, category: 'Kit', inStock: false },
    { id: 'prod-4', name: 'Cinnamon Roll', price: 3.75, category: 'Pastry', inStock: true },
    { id: 'prod-5', name: 'French Baguette', price: 6.00, category: 'Bread', inStock: true },
    { id: 'prod-6', name: 'Cheese Danish', price: 4.50, category: 'Pastry', inStock: true },
  ];

  // Mock sales window data
  const mockSalesWindows = [
    { id: 'window-1', name: 'Holiday Market 2024', status: 'active', startDate: '2024-12-01', endDate: '2024-12-24' },
    { id: 'window-2', name: 'Spring Festival 2025', status: 'active', startDate: '2025-03-15', endDate: '2025-03-30' },
    { id: 'window-3', name: 'Summer Pop-up', status: 'scheduled', startDate: '2025-06-01', endDate: '2025-06-15' },
    { id: 'window-4', name: 'Farmers Market Weekly', status: 'active', startDate: '2025-01-01', endDate: '2025-12-31' },
  ];

  // Product selection functions
  const addProductToSelection = (product: any, quantity: number) => {
    const existingIndex = selectedProducts.findIndex(p => p.product.id === product.id);
    if (existingIndex >= 0) {
      // Update existing product quantity
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = quantity;
      setSelectedProducts(updated);
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, { product, quantity }]);
    }
    setProductQuantities(prev => ({ ...prev, [product.id]: quantity }));
  };

  const removeProductFromSelection = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.product.id !== productId));
    setProductQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setProductQuantities(prev => ({ ...prev, [productId]: quantity }));
    setSelectedProducts(prev => 
      prev.map(p => p.product.id === productId ? { ...p, quantity } : p)
    );
  };

  const addSelectedProductsToOrder = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Convert selected products to order items
    const newItems = selectedProducts.map(({ product, quantity }, index) => ({
      id: `item-${Date.now()}-${index}`,
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      specifications: product.category,
      status: 'pending' as const,
      notes: ''
    }));

    // Update the order with new items
    const updatedOrder = {
      ...order,
      items: [...(order?.items || []), ...newItems]
    };

    // Update edit data if in editing mode
    if (isEditing || order?.id === 'new') {
      setEditData(prev => ({
        ...prev,
        items: [...(prev.items || []), ...newItems]
      }));
    }

    // Close modal and show success
    setShowProductModal(false);
    setSelectedProducts([]);
    setProductQuantities({});
    toast.success(`Added ${selectedProducts.length} products to order`);
  };

  if (!order) return null;

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    in_production: { label: 'In Production', color: 'bg-orange-100 text-orange-800', icon: Package },
    ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-purple-100 text-purple-800', icon: Truck },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    setEditData(order);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (order?.id === 'new') {
      // Creating a new order
      const newOrder: Order = {
        id: `order-${Date.now()}`, // Generate a unique ID
        orderNumber: `ORD-${String(Date.now()).slice(-6)}`, // Generate order number
        customerId: editData.customerId || '',
        customerName: editData.customerName || '',
        customerEmail: editData.customerEmail || '',
        customerPhone: editData.customerPhone || '',
        status: editData.status || 'pending',
        priority: editData.priority || 'medium',
        totalAmount: editData.totalAmount || 0,
        items: editData.items || [],
        shippingAddress: editData.shippingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        billingAddress: editData.billingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: editData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedDeliveryDate: editData.expectedDeliveryDate || '',
        actualDeliveryDate: editData.actualDeliveryDate,
        productionStartDate: editData.productionStartDate,
        productionEndDate: editData.productionEndDate,
        assignedTo: editData.assignedTo,
        tags: editData.tags || [],
        orderType: editData.orderType || 'preorder',
        isPreOrder: editData.isPreOrder !== false,
        salesWindowId: editData.salesWindowId
      };
      onSave?.(newOrder);
    } else {
      // Editing existing order
      setIsEditing(false);
      onEdit?.(editData as Order);
    }
    onClose();
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate?.(order.id, newStatus);
  };

  const handleAssign = (assignedTo: string) => {
    onAssign?.(order.id, assignedTo);
  };

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {order.id === 'new' ? 'Create New Order' : `Order ${order.orderNumber}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.id === 'new' ? 'Fill out the form below to create a new order' : `Created ${formatDate(order.createdAt)}`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isEditing || order.id === 'new' ? (
                  <>
                    <select
                      value={editData.status || order.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value as any})}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      title="Select order status"
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <select
                      value={editData.priority || order.priority}
                      onChange={(e) => setEditData({...editData, priority: e.target.value as any})}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      title="Select order priority"
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[order.status].label}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority].color}`}>
                  {priorityConfig[order.priority].label}
                </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && order.id !== 'new' && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Edit order"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Close order details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Order Type and Pre-order Settings */}
            {(isEditing || order.id === 'new') && (
              <div className="bg-[#F7F2EC] rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Order Type & Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Order Type</label>
                    <select
                      value={editData.orderType || 'preorder'}
                      onChange={(e) => {
                        const orderType = e.target.value as any;
                        const updatedData = {...editData, orderType};
                        
                        // If "Stock for Event" is selected, automatically select stock customer and fill details
                        if (orderType === 'stock') {
                          const stockCustomer = mockCustomers.find(c => c.id === 'stock');
                          if (stockCustomer) {
                            updatedData.customerId = stockCustomer.id;
                            updatedData.customerName = stockCustomer.name;
                            updatedData.customerEmail = stockCustomer.email;
                            updatedData.customerPhone = stockCustomer.phone;
                            updatedData.shippingAddress = {
                              street: '123 Event Center Drive',
                              city: 'Event City',
                              state: 'EC',
                              zipCode: '12345',
                              country: 'USA'
                            };
                            updatedData.billingAddress = {
                              street: '123 Event Center Drive',
                              city: 'Event City',
                              state: 'EC',
                              zipCode: '12345',
                              country: 'USA'
                            };
                          }
                        }
                        
                        setEditData(updatedData);
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      title="Select order type"
                    >
                      <option value="preorder">Pre-order (Customer Order)</option>
                      <option value="stock">Stock for Event</option>
                      <option value="inventory">Inventory Restock</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sales Window</label>
                    <select
                      value={editData.salesWindowId || ''}
                      onChange={(e) => setEditData({...editData, salesWindowId: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      title="Select sales window"
                    >
                      <option value="">No sales window</option>
                      {mockSalesWindows.filter(window => window.status === 'active').map((window) => (
                        <option key={window.id} value={window.id}>
                          {window.name} ({window.startDate} - {window.endDate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.isPreOrder !== false}
                        onChange={(e) => setEditData({...editData, isPreOrder: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pre-order</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  {isEditing || order.id === 'new' ? (
                    <div className="mt-1 space-y-2">
                      <select
                        value={editData.customerId || ''}
                        onChange={(e) => {
                          const selectedCustomer = mockCustomers.find(c => c.id === e.target.value);
                          if (selectedCustomer) {
                            const updatedData = {
                              ...editData,
                              customerId: selectedCustomer.id,
                              customerName: selectedCustomer.name,
                              customerEmail: selectedCustomer.email,
                              customerPhone: selectedCustomer.phone
                            };

                            // If stock customer is selected, fill in default address information
                            if (selectedCustomer.id === 'stock') {
                              updatedData.shippingAddress = {
                                street: '123 Event Center Drive',
                                city: 'Event City',
                                state: 'EC',
                                zipCode: '12345',
                                country: 'USA'
                              };
                              updatedData.billingAddress = {
                                street: '123 Event Center Drive',
                                city: 'Event City',
                                state: 'EC',
                                zipCode: '12345',
                                country: 'USA'
                              };
                            }

                            setEditData(updatedData);
                          }
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select existing customer"
                      >
                        <option value="">Select existing customer...</option>
                        {mockCustomers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowCustomerModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        + Create new customer
                      </button>
                    </div>
                  ) : (
                  <p className="text-sm text-gray-900">{order.customerName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  {isEditing || order.id === 'new' ? (
                    <input
                      type="email"
                      value={editData.customerEmail || ''}
                      onChange={(e) => setEditData({...editData, customerEmail: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer email"
                    />
                  ) : (
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {order.customerEmail}
                  </p>
                  )}
                </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                  {isEditing || order.id === 'new' ? (
                    <input
                      type="tel"
                      value={editData.customerPhone || ''}
                      onChange={(e) => setEditData({...editData, customerPhone: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer phone"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.customerPhone || 'Not provided'}
                    </p>
                  )}
                  </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer ID</label>
                  {isEditing || order.id === 'new' ? (
                    <input
                      type="text"
                      value={editData.customerId || ''}
                      onChange={(e) => setEditData({...editData, customerId: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer ID"
                    />
                  ) : (
                  <p className="text-sm text-gray-900">{order.customerId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </h4>
                {(isEditing || order.id === 'new') && (
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(isEditing || order.id === 'new' ? editData.items || [] : order.items).map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            {item.specifications && (
                              <div className="text-sm text-gray-500">
                                {item.specifications}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_production' ? 'bg-orange-100 text-orange-800' :
                            item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-lg font-medium text-gray-900">
                  Total: {formatCurrency(order.totalAmount)}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h4>
                {isEditing || order.id === 'new' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Street</label>
                      <input
                        type="text"
                        value={editData.shippingAddress?.street || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          shippingAddress: {...editData.shippingAddress, street: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={editData.shippingAddress?.city || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            shippingAddress: {...editData.shippingAddress, city: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={editData.shippingAddress?.state || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            shippingAddress: {...editData.shippingAddress, state: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={editData.shippingAddress?.zipCode || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            shippingAddress: {...editData.shippingAddress, zipCode: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="ZIP Code"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={editData.shippingAddress?.country || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            shippingAddress: {...editData.shippingAddress, country: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="text-sm text-gray-900">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
                )}
              </div>

              {/* Billing Address */}
              <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Billing Address
                </h4>
                {isEditing || order.id === 'new' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Street</label>
                      <input
                        type="text"
                        value={editData.billingAddress?.street || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          billingAddress: {...editData.billingAddress, street: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={editData.billingAddress?.city || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            billingAddress: {...editData.billingAddress, city: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={editData.billingAddress?.state || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            billingAddress: {...editData.billingAddress, state: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={editData.billingAddress?.zipCode || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            billingAddress: {...editData.billingAddress, zipCode: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="ZIP Code"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={editData.billingAddress?.country || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            billingAddress: {...editData.billingAddress, country: e.target.value}
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="text-sm text-gray-900">
                  <p>{order.billingAddress.street}</p>
                  <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Order Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm text-gray-900">Order Created</div>
                  <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
                {order.productionStartDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="text-sm text-gray-900">Production Started</div>
                    <div className="text-sm text-gray-500">{formatDate(order.productionStartDate)}</div>
                  </div>
                )}
                {order.productionEndDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm text-gray-900">Production Completed</div>
                    <div className="text-sm text-gray-500">{formatDate(order.productionEndDate)}</div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="text-sm text-gray-900">Expected Delivery</div>
                  <div className="text-sm text-gray-500">{formatDate(order.expectedDeliveryDate)}</div>
                </div>
                {order.actualDeliveryDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm text-gray-900">Delivered</div>
                    <div className="text-sm text-gray-500">{formatDate(order.actualDeliveryDate)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notes
                    </h4>
                {isEditing || order.id === 'new' ? (
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows={3}
                    placeholder="Enter order notes..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    {order.notes || 'No notes provided'}
                  </p>
                )}
              </div>
                {order.tags.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {order.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            {/* Assignment */}
            {order.assignedTo && (
              <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Assigned To</h4>
                <p className="text-sm text-gray-700">{order.assignedTo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-[#F7F2EC] flex-shrink-0">
          <div className="flex items-center justify-end">
            {isEditing || order.id === 'new' ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({});
                    if (order.id === 'new') {
                      onClose();
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {order.id === 'new' ? 'Create Order' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    title="Update order status"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_production">In Production</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Creation Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Create New Customer</h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close customer creation modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer email"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer phone"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, this would create the customer
                  setShowCustomerModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add Products to Order</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close product selection modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-lg font-bold text-gray-900 mb-3">${product.price.toFixed(2)}</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={productQuantities[product.id] || 1}
                        onChange={(e) => updateProductQuantity(product.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => addProductToSelection(product, productQuantities[product.id] || 1)}
                        disabled={!product.inStock}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add to Selection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              {/* Selected Products Summary */}
              {selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Products ({selectedProducts.length})</h4>
                  <div className="space-y-2">
                    {selectedProducts.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-900">{product.name}</span>
                          <span className="text-blue-600">x{quantity}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">${(product.price * quantity).toFixed(2)}</span>
                          <button
                            onClick={() => removeProductFromSelection(product.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove product"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProducts([]);
                    setProductQuantities({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addSelectedProductsToOrder}
                  disabled={selectedProducts.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add {selectedProducts.length} Products to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
