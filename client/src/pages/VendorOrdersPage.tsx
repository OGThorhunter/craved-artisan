import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';
import {
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  BarChart3,
  FileText,
  Tag,
  CreditCard
} from 'lucide-react';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import OrderTracker from '../components/orders/OrderTracker';
import OrderKanbanBoard from '../components/orders/OrderKanbanBoard';
import OrderAnalytics from '../components/orders/OrderAnalytics';
import SimpleLabelPrintModal from '../components/labels/SimpleLabelPrintModal';
import OrderListPrintModal from '../components/orders/OrderListPrintModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';

// Types
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

// Dummy data
const dummyOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2025-001',
    customerId: 'cust-1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@restaurantgroup.com',
    customerPhone: '(555) 123-4567',
    status: 'in_production',
    priority: 'high',
    totalAmount: 1250.00,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Custom Logo Aprons',
        quantity: 50,
        unitPrice: 15.00,
        totalPrice: 750.00,
        specifications: 'Red aprons with white logo, size M-L',
        status: 'in_production'
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Chef Hats',
        quantity: 25,
        unitPrice: 20.00,
        totalPrice: 500.00,
        specifications: 'White chef hats with embroidered logo',
        status: 'pending'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    notes: 'Rush order for grand opening event',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
    expectedDeliveryDate: '2025-02-01',
    productionStartDate: '2025-01-18T09:00:00Z',
    assignedTo: 'Production Team A',
    tags: ['rush', 'restaurant', 'grand-opening']
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2025-002',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@deliveryapp.com',
    customerPhone: '(555) 987-6543',
    status: 'confirmed',
    priority: 'medium',
    totalAmount: 850.00,
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        productName: 'Delivery Bags',
        quantity: 100,
        unitPrice: 8.50,
        totalPrice: 850.00,
        specifications: 'Insulated delivery bags with company logo',
        status: 'pending'
      }
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    billingAddress: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    notes: 'Standard delivery timeline',
    createdAt: '2025-01-18T14:20:00Z',
    updatedAt: '2025-01-18T14:20:00Z',
    expectedDeliveryDate: '2025-02-15',
    assignedTo: 'Production Team B',
    tags: ['delivery', 'bags', 'standard']
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2025-003',
    customerId: 'cust-3',
    customerName: 'Emma Rodriguez',
    customerEmail: 'emma@boutiquestyle.com',
    customerPhone: '(555) 456-7890',
    status: 'ready_for_pickup',
    priority: 'low',
    totalAmount: 320.00,
    items: [
      {
        id: 'item-4',
        productId: 'prod-4',
        productName: 'Custom T-Shirts',
        quantity: 20,
        unitPrice: 16.00,
        totalPrice: 320.00,
        specifications: 'Black t-shirts with pink logo, sizes S-XL',
        status: 'completed'
      }
    ],
    shippingAddress: {
      street: '789 Pine St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    billingAddress: {
      street: '789 Pine St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    notes: 'Customer prefers pickup over shipping',
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2025-01-22T16:45:00Z',
    expectedDeliveryDate: '2025-01-25',
    actualDeliveryDate: '2025-01-22T16:45:00Z',
    productionStartDate: '2025-01-12T08:00:00Z',
    productionEndDate: '2025-01-20T17:00:00Z',
    assignedTo: 'Production Team A',
    tags: ['t-shirts', 'pickup', 'completed']
  }
];

const VendorOrdersPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'expectedDeliveryDate' | 'totalAmount' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tracker' | 'kanban' | 'analytics'>('tracker');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showLabelPrinting, setShowLabelPrinting] = useState(false);
  const [showLabelTemplateManager, setShowLabelTemplateManager] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    salesWindowId: '',
    items: [] as Array<{productId: string; productName: string; quantity: number; unitPrice: number; specifications: string}>,
    specialInstructions: ''
  });
  const [showOrderListPrinting, setShowOrderListPrinting] = useState(false);
  const [selectedOrdersForLabels, setSelectedOrdersForLabels] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Fetch orders from API
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  const orders = ordersResponse?.data || [];

  // Fetch products for order creation
  const { data: productsResponse } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/products', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const products = productsResponse || [];

  // Fetch sales windows for order creation
  const { data: salesWindowsResponse } = useQuery({
    queryKey: ['sales-windows'],
    queryFn: async () => {
      const response = await fetch('/api/sales-windows', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sales windows');
      }
      return response.json();
    },
  });

  const salesWindows = salesWindowsResponse?.data || [];

  const queryClient = useQueryClient();

  // Create new order function
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: typeof newOrderForm) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      toast.success('Order created successfully!');
      setShowNewOrderModal(false);
      
      // Add the new order to the cache
      queryClient.setQueryData(['orders'], (oldData: any) => {
        if (!oldData) return { success: true, data: [data.data] };
        return {
          ...oldData,
          data: [...oldData.data, data.data]
        };
      });
      
      // Reset form
      setNewOrderForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        status: 'pending' as const,
        priority: 'medium' as const,
        salesWindowId: '',
        items: [],
        specialInstructions: ''
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });

  // Form helper functions
  const updateFormField = (field: string, value: any) => {
    setNewOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const addOrderItem = () => {
    setNewOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 1, unitPrice: 0, specifications: '' }]
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeOrderItem = (index: number) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreateOrder = () => {
    if (!newOrderForm.customerName || !newOrderForm.customerEmail || newOrderForm.items.length === 0) {
      toast.error('Please fill in all required fields and add at least one item');
      return;
    }

    // Validate items
    const hasValidItems = newOrderForm.items.every(item => 
      item.productName && item.quantity > 0 && item.unitPrice > 0
    );

    if (!hasValidItems) {
      toast.error('Please ensure all items have valid product name, quantity, and price');
      return;
    }

    createOrderMutation.mutate(newOrderForm);
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'expectedDeliveryDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Customizable order status configuration
  // This would typically come from vendor settings/preferences
  // Vendors can customize their order workflow to match their business process
  // Example: "Start" → "Middle" → "End" → "Finished"
  const vendorOrderStatuses = [
    { id: 'pending', label: 'Start', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'confirmed', label: 'Middle', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { id: 'in_production', label: 'End', color: 'bg-orange-100 text-orange-800', icon: Package },
    { id: 'ready_for_pickup', label: 'Finished', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    { id: 'delivered', label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: Truck },
    { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  // Convert array to object for backward compatibility
  const statusConfig = vendorOrderStatuses.reduce((acc, status) => {
    acc[status.id] = { label: status.label, color: status.color, icon: status.icon };
    return acc;
  }, {} as Record<string, { label: string; color: string; icon: any }>);

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
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
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handlePrintLabels = () => {
    if (selectedOrders.length > 0) {
      setSelectedOrdersForLabels(selectedOrders);
    setShowLabelPrinting(true);
    } else {
      // If no orders selected, show all orders
      setSelectedOrdersForLabels(filteredOrders.map(order => order.id));
      setShowLabelPrinting(true);
    }
  };

  const handleManageTemplates = () => {
    alert('Label template management will be available in a future update. For now, you can use the basic label printing feature.');
  };

  const handlePrintSelectedLabels = (orderIds: string[]) => {
    setSelectedOrdersForLabels(orderIds);
    setShowLabelPrinting(true);
  };

  const handlePrintOrderList = () => {
    setShowOrderListPrinting(true);
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    // In a real app, this would update the backend
    console.log(`Updating order ${orderId} status to ${status}`);
    
    // Update the order status in the query cache
    queryClient.setQueryData(['orders'], (oldData: any) => {
      if (!oldData) return oldData;
      const updatedOrders = oldData.data.map((order: any) => 
        order.id === orderId 
          ? { ...order, status: status as any, updatedAt: new Date().toISOString() }
          : order
      );
      console.log('Updated orders:', updatedOrders.find((o: any) => o.id === orderId));
      return { ...oldData, data: updatedOrders };
    });
  };

  const handleAssign = (orderId: string, assignedTo: string) => {
    // In a real app, this would update the backend
    console.log(`Assigning order ${orderId} to ${assignedTo}`);
  };

  const handleOrderEdit = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleNewOrder = () => {
    // Create a new empty order object for editing
    const newOrder: Order = {
      id: 'new',
      orderNumber: '',
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'pending',
      priority: 'medium',
      totalAmount: 0,
      items: [],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedDeliveryDate: '',
      productionStartDate: '',
      assignedTo: '',
      tags: []
    };
    setSelectedOrder(newOrder);
  };

  const handleOrderSave = (order: Order) => {
    // In a real app, this would save to the backend
    console.log('Saving new order:', order);
    // For now, just close the modal
    setSelectedOrder(null);
  };

  const handleOrderDuplicate = (order: Order) => {
    // Create a duplicate order with a new ID and order number
    const duplicatedOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Clear delivery dates for the duplicate
      expectedDeliveryDate: '',
      actualDeliveryDate: undefined,
      productionStartDate: undefined,
      productionEndDate: undefined,
    };
    
    // Open the modal with the duplicated order for editing
    setSelectedOrder(duplicatedOrder);
    console.log('Duplicating order:', duplicatedOrder);
  };

  const handleOrderDelete = (orderId: string) => {
    // In a real app, this would delete from the backend
    console.log(`Deleting order ${orderId}`);
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-2">
                  {viewMode === 'gantt' 
                    ? 'Visual timeline showing order progress from creation to delivery' 
                    : 'Track and manage customer orders from production to delivery'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    // Open new order creation form for vendor to sell
                    setShowNewOrderModal(true);
                    toast.success('Opening new order creation form...');
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  New Order
                </button>
                <button 
                  onClick={() => {
                    setShowLabelPrinting(true);
                    toast.success('Opening label printing interface...');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Print Labels
                </button>
                <button 
                  onClick={() => {
                    // Print current order list
                    setShowOrderListPrinting(true);
                    toast.success('Opening order list printing...');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Print List
                </button>
                <button 
                  onClick={() => {
                    // Show templates modal/interface
                    setShowLabelTemplateManager(true);
                    toast.success('Opening template manager...');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Templates
                </button>
                <button 
                  onClick={() => {
                    try {
                      // Export orders to CSV
                      const csvContent = "data:text/csv;charset=utf-8," + 
                        "Order ID,Customer,Status,Total,Date\n" +
                        orders.map(order => 
                          `${order.id},${order.customerName},${order.status},$${order.totalAmount.toFixed(2)},${new Date(order.createdAt).toLocaleDateString()}`
                        ).join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success('Orders exported successfully!');
                    } catch (error) {
                      console.error('Export error:', error);
                      toast.error('Failed to export orders. Please try again.');
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Export
                </button>
                <button 
                  onClick={() => {
                    // Navigate to credits management (not financials)
                    setShowCreditsModal(true);
                    toast.success('Opening credits management...');
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Credits
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{statusConfig.in_production.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'in_production').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{statusConfig.delivered.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{statusConfig.ready_for_pickup.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'ready_for_pickup').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Filters and Controls */}
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                {vendorOrderStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by priority"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
                      </div>
                      
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
                      <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="List view"
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  List
                      </button>
                      <button
                  onClick={() => setViewMode('tracker')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'tracker' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Customizable order tracker - Drag and drop workflow management"
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Tracker
                      </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Kanban board view"
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Board
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'analytics' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Analytics view"
                >
                  <Package className="h-4 w-4 inline mr-1" />
                  Analytics
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title="Sort by field"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="expectedDeliveryDate">Delivery Date</option>
                  <option value="totalAmount">Total Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Content */}
        {viewMode === 'tracker' ? (
          <OrderTracker
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onOrderEdit={handleOrderEdit}
            onOrderDuplicate={handleOrderDuplicate}
            onOrderPrint={(order) => handlePrintSelectedLabels([order.id])}
            onStatusUpdate={handleStatusUpdate}
          />
        ) : viewMode === 'kanban' ? (
          <OrderKanbanBoard
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onStatusUpdate={handleStatusUpdate}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
          />
        ) : viewMode === 'analytics' ? (
          <OrderAnalytics
            orders={orders}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        ) : (
          /* Orders List */
          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Orders ({filteredOrders.length})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  title="Select all orders"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
              </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" title="Select all orders" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title={`Select order ${order.orderNumber}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority].color}`}>
                          {priorityConfig[order.priority].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.expectedDeliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        -
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>


        </div>
      )}


        {/* Modals */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onSave={handleOrderSave}
            onStatusUpdate={handleStatusUpdate}
            onAssign={handleAssign}
          />
        )}

        {/* {showLabelPrinting && (
          <LabelPrinting
            orders={orders.filter(order => selectedOrders.includes(order.id))}
            onClose={() => setShowLabelPrinting(false)}
          />
        )} */}

        {/* Credits & Discounts Modal */}
        {showCreditsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Customer Credits & Discounts</h3>
                  <button
                    onClick={() => setShowCreditsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Close credits modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select customer">
                      <option value="">Choose a customer...</option>
                      <option value="cust-1">John Smith (john.smith@email.com)</option>
                      <option value="cust-2">Sarah Johnson (sarah.j@email.com)</option>
                      <option value="cust-3">Mike Wilson (mike.wilson@email.com)</option>
                      <option value="cust-4">Emily Davis (emily.davis@email.com)</option>
                      <option value="cust-5">David Brown (david.brown@email.com)</option>
                    </select>
                  </div>

                  {/* Current Credit Balance */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Current Credit Balance</h4>
                    <p className="text-2xl font-bold text-green-600">$0.00</p>
                    <p className="text-sm text-gray-600">Available for this customer</p>
                  </div>

                  {/* Add Credits */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Add Credits</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reason</label>
                        <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select credit reason">
                          <option value="">Select reason...</option>
                          <option value="refund">Refund</option>
                          <option value="compensation">Compensation</option>
                          <option value="promotion">Promotion</option>
                          <option value="loyalty">Loyalty Reward</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Optional notes about this credit..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Codes */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Create Discount Code</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Code</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter discount code"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select discount type">
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Value</label>
                          <input
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expiration Date</label>
                        <input
                          type="date"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          title="Select expiration date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCreditsModal(false);
                    // In a real app, this would apply credits/discounts
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Credits/Discounts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Label Print Modal */}
        <SimpleLabelPrintModal
          isOpen={showLabelPrinting}
          onClose={() => setShowLabelPrinting(false)}
          orders={orders.filter(order => selectedOrdersForLabels.includes(order.id))}
        />

        {/* Label Template Manager Modal */}
        {/* <LabelTemplateManager
          isOpen={showLabelTemplateManager}
          onClose={() => setShowLabelTemplateManager(false)}
          onSelectTemplate={(template) => {
            setShowLabelTemplateManager(false);
            // Could open print modal with selected template
          }}
        /> */}

        {/* Order List Print Modal */}
        <OrderListPrintModal
          isOpen={showOrderListPrinting}
          onClose={() => setShowOrderListPrinting(false)}
          orders={orders}
          selectedOrderIds={selectedOrders}
        />
      </div>
    </div>

    {/* New Order Modal */}
    {showNewOrderModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                  value={newOrderForm.customerName}
                  onChange={(e) => updateFormField('customerName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@example.com"
                  value={newOrderForm.customerEmail}
                  onChange={(e) => updateFormField('customerEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newOrderForm.orderDate}
                  onChange={(e) => updateFormField('orderDate', e.target.value)}
                  aria-label="Order Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newOrderForm.expectedDeliveryDate}
                  onChange={(e) => updateFormField('expectedDeliveryDate', e.target.value)}
                  aria-label="Expected Delivery Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newOrderForm.status}
                  onChange={(e) => updateFormField('status', e.target.value)}
                  aria-label="Order Status"
                >
                  {vendorOrderStatuses.filter(status => status.id !== 'cancelled').map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newOrderForm.priority}
                  onChange={(e) => updateFormField('priority', e.target.value)}
                  aria-label="Order Priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Items
              </label>
              <div className="space-y-4">
                {newOrderForm.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.productId}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              // Handle custom product
                              updateOrderItem(index, 'productId', 'custom');
                              updateOrderItem(index, 'productName', '');
                              updateOrderItem(index, 'unitPrice', 0);
                            } else {
                              const selectedProduct = products.find(p => p.id === e.target.value);
                              updateOrderItem(index, 'productId', e.target.value);
                              updateOrderItem(index, 'productName', selectedProduct?.name || '');
                              updateOrderItem(index, 'unitPrice', selectedProduct?.price || 0);
                            }
                          }}
                          aria-label="Select product"
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price}
                            </option>
                          ))}
                          <option value="custom">+ Add Custom Order</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={item.productId === 'custom' ? 'Enter custom product name' : 'Product name'}
                          value={item.productName}
                          onChange={(e) => updateOrderItem(index, 'productName', e.target.value)}
                          disabled={item.productId !== 'custom' && item.productId !== ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          disabled={item.productId !== 'custom' && item.productId !== ''}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove Product
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  + Add Product
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Window
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newOrderForm.salesWindowId}
                onChange={(e) => updateFormField('salesWindowId', e.target.value)}
                aria-label="Select sales window"
              >
                <option value="">No sales window</option>
                {salesWindows.filter(window => window.status === 'active').map((window) => (
                  <option key={window.id} value={window.id}>
                    {window.name} ({window.startDate} - {window.endDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special instructions for this order..."
                value={newOrderForm.specialInstructions}
                onChange={(e) => updateFormField('specialInstructions', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Credits Modal */}
    {showCreditsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Credits Management</h3>
          <p className="text-gray-600 mb-4">
            Manage customer credits, refunds, and account adjustments.
          </p>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Credit History
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Issue Refund
            </button>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Adjust Account Balance
            </button>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowCreditsModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Label Template Manager Modal */}
    {showLabelTemplateManager && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Label Templates</h3>
          <p className="text-gray-600 mb-4">
            Manage your label printing templates for orders and products.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900">Order Labels</h4>
                <p className="text-sm text-gray-600">Standard order shipping labels</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900">Product Labels</h4>
                <p className="text-sm text-gray-600">Individual product labels</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900">Custom Labels</h4>
                <p className="text-sm text-gray-600">Create custom label templates</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900">Bulk Labels</h4>
                <p className="text-sm text-gray-600">Print multiple labels at once</p>
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowLabelTemplateManager(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage; 