import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, DollarSign, Users, Calendar, Package } from 'lucide-react';
import { SalesWindowsManager } from '@/components/sales/SalesWindowsManager';
import { OrdersManager } from '@/components/sales/OrdersManager';
import { CheckoutForm } from '@/components/sales/CheckoutForm';
import type { SalesWindow, Order, Stall } from '@/lib/api/sales';

interface SalesPageProps {
  eventId: string;
}

export default function SalesPage({ eventId }: SalesPageProps) {
  const [activeTab, setActiveTab] = useState<'windows' | 'orders' | 'checkout'>('windows');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedStalls, setSelectedStalls] = useState<Stall[]>([]);
  const [selectedSalesWindow, setSelectedSalesWindow] = useState<SalesWindow | null>(null);

  // Mock data - replace with React Query
  const [salesWindows, setSalesWindows] = useState<SalesWindow[]>([
    {
      id: 'window_1',
      eventId,
      name: 'Early Bird Sales',
      description: 'Early bird pricing for vendors',
      opensAt: '2024-03-01T09:00:00Z',
      closesAt: '2024-03-10T23:59:59Z',
      maxCapacity: 60,
      perCustomerLimit: 3,
      earlyBirdPrice: 65.00,
      earlyBirdEnds: '2024-03-05T23:59:59Z',
      lastMinutePrice: 85.00,
      lastMinuteStarts: '2024-03-08T00:00:00Z',
      isActive: true,
      autoClose: false,
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
      orderCount: 45,
      waitlistCount: 12
    },
    {
      id: 'window_2',
      eventId,
      name: 'General Sales',
      description: 'General public sales',
      opensAt: '2024-03-11T09:00:00Z',
      closesAt: '2024-03-14T23:59:59Z',
      maxCapacity: 60,
      perCustomerLimit: 2,
      isActive: true,
      autoClose: false,
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
      orderCount: 8,
      waitlistCount: 3
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order_1',
      orderNumber: 'ORD-2024-001',
      userId: 'user_1',
      salesWindowId: 'window_1',
      status: 'CONFIRMED',
      subtotal: 150.00,
      tax: 12.00,
      fees: 5.00,
      total: 167.00,
      paymentStatus: 'SUCCEEDED',
      paymentMethod: 'card',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '(555) 123-4567',
      paidAt: '2024-02-15T10:30:00Z',
      createdAt: '2024-02-15T10:25:00Z',
      updatedAt: '2024-02-15T10:30:00Z',
      orderItems: [],
      tickets: []
    }
  ]);

  const handleCreateWindow = (windowData: any) => {
    console.log('Creating window:', windowData);
    // TODO: Implement API call
  };

  const handleUpdateWindow = (windowId: string, updates: any) => {
    console.log('Updating window:', windowId, updates);
    // TODO: Implement API call
  };

  const handleDeleteWindow = (windowId: string) => {
    console.log('Deleting window:', windowId);
    setSalesWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const handleOpenWindow = (windowId: string) => {
    console.log('Opening window:', windowId);
    setSalesWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isActive: true } : w
    ));
  };

  const handleCloseWindow = (windowId: string) => {
    console.log('Closing window:', windowId);
    setSalesWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isActive: false } : w
    ));
  };

  const handleRefreshOrders = () => {
    console.log('Refreshing orders');
    // TODO: Implement API call
  };

  const handleViewOrder = (order: Order) => {
    console.log('Viewing order:', order);
    // TODO: Open order details modal
  };

  const handleExportOrders = () => {
    console.log('Exporting orders');
    // TODO: Implement export functionality
  };

  const handleCheckout = (orderData: any) => {
    console.log('Processing checkout:', orderData);
    // TODO: Implement checkout API call
    setShowCheckout(false);
    setSelectedStalls([]);
    setSelectedSalesWindow(null);
  };

  const handleStartCheckout = (stalls: Stall[], window: SalesWindow) => {
    setSelectedStalls(stalls);
    setSelectedSalesWindow(window);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events/${eventId}/layout`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Layout
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
              <p className="text-gray-600">Manage sales windows, orders, and checkout</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/event-coordinator/events/${eventId}/inventory`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Package className="w-4 h-4" />
                  Inventory Ops
                </button>
              </Link>
              <button
                onClick={() => handleStartCheckout([], salesWindows[0])}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Test Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'windows', label: 'Sales Windows', icon: Calendar },
              { id: 'orders', label: 'Orders', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'windows' && (
          <SalesWindowsManager
            windows={salesWindows}
            onCreateWindow={handleCreateWindow}
            onUpdateWindow={handleUpdateWindow}
            onDeleteWindow={handleDeleteWindow}
            onOpenWindow={handleOpenWindow}
            onCloseWindow={handleCloseWindow}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersManager
            orders={orders}
            onRefresh={handleRefreshOrders}
            onViewOrder={handleViewOrder}
            onExportOrders={handleExportOrders}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Analytics</h2>
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Sales analytics and reporting features coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedSalesWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CheckoutForm
              salesWindow={selectedSalesWindow}
              selectedStalls={selectedStalls}
              onCheckout={handleCheckout}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
