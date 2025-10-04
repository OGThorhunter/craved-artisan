import React, { useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Search, Calendar, MapPin, Package, TrendingUp, Clock, ExternalLink, QrCode, Copy, Edit2 } from 'lucide-react';
import { Link } from 'wouter';

// Mock data for demonstration
const mockSalesWindows = [
  {
    id: 'sw1',
    vendorId: 'vendor-user-id',
    type: 'PARK_PICKUP',
    name: 'Downtown Farmers Market Pickup',
    description: 'Weekly pickup at the farmers market.',
    status: 'OPEN',
    location_name: 'Downtown Market',
    address_text: '123 Market St, Anytown, USA',
    static_map_mode: 'UPLOAD',
    static_map_image_url: 'https://via.placeholder.com/150/E8CBAE/333333?text=Map',
    static_map_tile_url_template: null,
    vendor_vehicle_image_url: 'https://via.placeholder.com/100/5B6E02/FFFFFF?text=Vehicle',
    vendor_vehicle_plate: 'ABC-123',
    preorder_open_at: new Date('2025-10-01T08:00:00Z'),
    preorder_close_at: new Date('2025-10-04T17:00:00Z'),
    fulfill_start_at: new Date('2025-10-05T09:00:00Z'),
    fulfill_end_at: new Date('2025-10-05T12:00:00Z'),
    is_always_on: false,
    max_items_total: 100,
    auto_close_when_full: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [{ id: 'p1', productId: 'prod1', salesWindowId: 'sw1', active: true }],
    metrics: { id: 'm1', salesWindowId: 'sw1', orders_count: 15, items_count: 75, gross: 750.00, refunds: 0, net: 750.00 },
  },
  {
    id: 'sw2',
    vendorId: 'vendor-user-id',
    type: 'SERVICE_GREENFIELD',
    name: 'Custom Cake Consultations',
    description: 'Always-on consultations for custom cake orders.',
    status: 'OPEN',
    is_always_on: true,
    scheduling_mode: 'VENDOR_CONTACT',
    static_map_mode: 'NONE',
    static_map_image_url: null,
    static_map_tile_url_template: null,
    vendor_vehicle_image_url: null,
    vendor_vehicle_plate: null,
    epicenter_address: null,
    radius_miles: null,
    delivery_fee_mode: null,
    preorder_open_at: null,
    preorder_close_at: null,
    fulfill_start_at: null,
    fulfill_end_at: null,
    max_items_total: null,
    auto_close_when_full: false,
    porch_instructions: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    metrics: { id: 'm2', salesWindowId: 'sw2', orders_count: 5, items_count: 5, gross: 250.00, refunds: 0, net: 250.00 },
  },
  {
    id: 'sw3',
    vendorId: 'vendor-user-id',
    type: 'DELIVERY',
    name: 'Weekly Local Delivery',
    description: 'Deliveries within 10-mile radius.',
    status: 'SCHEDULED',
    epicenter_address: '456 Main St, Anytown, USA',
    radius_miles: 10,
    delivery_fee_mode: 'FLAT',
    static_map_mode: 'NONE',
    static_map_image_url: null,
    static_map_tile_url_template: null,
    vendor_vehicle_image_url: null,
    vendor_vehicle_plate: null,
    scheduling_mode: null,
    porch_instructions: null,
    preorder_open_at: new Date('2025-10-06T09:00:00Z'),
    preorder_close_at: new Date('2025-10-08T17:00:00Z'),
    fulfill_start_at: new Date('2025-10-09T14:00:00Z'),
    fulfill_end_at: new Date('2025-10-09T18:00:00Z'),
    is_always_on: false,
    max_items_total: 50,
    auto_close_when_full: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    metrics: { id: 'm3', salesWindowId: 'sw3', orders_count: 0, items_count: 0, gross: 0, refunds: 0, net: 0 },
  },
  {
    id: 'sw4',
    vendorId: 'vendor-user-id',
    type: 'PORCH_PICKUP',
    name: 'Home Porch Pickup',
    description: 'Pickup from vendor\'s home porch.',
    status: 'DRAFT',
    location_name: 'Vendor Home',
    address_text: '789 Oak Ave, Anytown, USA',
    porch_instructions: 'Items will be in a cooler by the front door.',
    static_map_mode: 'NONE',
    static_map_image_url: null,
    static_map_tile_url_template: null,
    vendor_vehicle_image_url: null,
    vendor_vehicle_plate: null,
    epicenter_address: null,
    radius_miles: null,
    delivery_fee_mode: null,
    scheduling_mode: null,
    preorder_open_at: null,
    preorder_close_at: null,
    fulfill_start_at: null,
    fulfill_end_at: null,
    max_items_total: null,
    auto_close_when_full: false,
    is_always_on: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    metrics: { id: 'm4', salesWindowId: 'sw4', orders_count: 0, items_count: 0, gross: 0, refunds: 0, net: 0 },
  },
];

interface SalesWindow {
  id: string;
  vendorId: string;
  type: string;
  name: string;
  description: string | null;
  status: string;
  location_name: string | null;
  address_text: string | null;
  static_map_mode: string;
  static_map_image_url: string | null;
  static_map_tile_url_template: string | null;
  vendor_vehicle_image_url: string | null;
  vendor_vehicle_plate: string | null;
  epicenter_address: string | null;
  radius_miles: number | null;
  delivery_fee_mode: string | null;
  preorder_open_at: Date | null;
  preorder_close_at: Date | null;
  fulfill_start_at: Date | null;
  fulfill_end_at: Date | null;
  is_always_on: boolean;
  scheduling_mode: string | null;
  max_items_total: number | null;
  auto_close_when_full: boolean;
  porch_instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
  products: Array<{ id: string; productId: string; salesWindowId: string; active: boolean }>;
  metrics: { id: string; salesWindowId: string; orders_count: number; items_count: number; gross: number; refunds: number; net: number };
}

const SalesWindowsIndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'upcoming' | 'drafts' | 'closed' | 'always-on'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Using mock data for now
  const windows: SalesWindow[] = mockSalesWindows;
  const isLoading = false;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PARK_PICKUP: 'bg-blue-100 text-blue-800 border-blue-200',
      DELIVERY: 'bg-green-100 text-green-800 border-green-200',
      CONSIGNMENT: 'bg-purple-100 text-purple-800 border-purple-200',
      WHOLESALE: 'bg-orange-100 text-orange-800 border-orange-200',
      MARKET: 'bg-pink-100 text-pink-800 border-pink-200',
      PORCH_PICKUP: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      KIOSK_PICKUP: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SERVICE_GREENFIELD: 'bg-[#5B6E02]/10 text-[#5B6E02] border-[#5B6E02]/20',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PARK_PICKUP: 'Park & Pickup',
      DELIVERY: 'Delivery',
      CONSIGNMENT: 'Consignment',
      WHOLESALE: 'Wholesale',
      MARKET: 'Market',
      PORCH_PICKUP: 'Porch Pickup',
      KIOSK_PICKUP: 'Kiosk Pickup',
      SERVICE_GREENFIELD: 'Service – Greenfield',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      OPEN: 'bg-[#5B6E02]/10 text-[#5B6E02] border-[#5B6E02]/20',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
      FULFILLED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Sales Windows"
          description="Manage your sales channels and fulfillment types"
        />

        <MotivationalQuote 
          quote="Success is not final, failure is not fatal: it is the courage to continue that counts."
          author="Winston Churchill"
        />

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#E8CBAE] shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Windows</span>
                <Calendar className="h-5 w-5 text-[#5B6E02]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {windows.filter(w => w.status === 'OPEN').length}
              </div>
            </div>
          </Card>

          <Card className="bg-[#E8CBAE] shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Orders</span>
                <Package className="h-5 w-5 text-[#5B6E02]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {windows.reduce((sum, w) => sum + (w.metrics?.orders_count || 0), 0)}
              </div>
            </div>
          </Card>

          <Card className="bg-[#E8CBAE] shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                <TrendingUp className="h-5 w-5 text-[#5B6E02]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${windows.reduce((sum, w) => sum + (w.metrics?.gross || 0), 0).toFixed(2)}
              </div>
            </div>
          </Card>

          <Card className="bg-[#E8CBAE] shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Always-On Services</span>
                <Clock className="h-5 w-5 text-[#5B6E02]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {windows.filter(w => w.is_always_on).length}
              </div>
            </div>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search windows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
              />
            </div>
          </div>
          <Link href="/dashboard/vendor/sales-windows/create">
            <Button className="bg-[#7F232E] hover:bg-[#7F232E]/90 text-white">
              <Plus className="h-5 w-5 mr-2" />
              Create Window
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'drafts', label: 'Drafts' },
              { id: 'closed', label: 'Closed' },
              { id: 'always-on', label: 'Always-On' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#5B6E02] text-[#5B6E02]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Windows Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#E8CBAE] shadow-sm border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded" />
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : windows.length === 0 ? (
          <Card className="bg-[#E8CBAE] shadow-sm border border-gray-200">
            <div className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales windows found</h3>
              <p className="text-gray-600 mb-6">
                Create your first sales window to start selling
              </p>
              <Link href="/dashboard/vendor/sales-windows/create">
                <Button className="bg-[#7F232E] hover:bg-[#7F232E]/90 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Window
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {windows.map((window) => (
              <Card key={window.id} className="bg-[#E8CBAE] shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Static Map Thumbnail */}
                {(window.static_map_image_url || window.static_map_tile_url_template) && (
                  <div className="h-32 bg-gray-200 rounded-t-lg overflow-hidden">
                    {window.static_map_image_url ? (
                      <img
                        src={window.static_map_image_url}
                        alt="Map"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <MapPin className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(window.type)}`}>
                          {getTypeLabel(window.type)}
                        </span>
                        {window.is_always_on && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5B6E02]/10 text-[#5B6E02] border border-[#5B6E02]/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Always-On
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{window.name}</h3>
                      {window.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{window.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(window.status)}`}>
                      {window.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {window.location_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {window.location_name}
                      </div>
                    )}
                    {!window.is_always_on && window.fulfill_start_at && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(window.fulfill_start_at)}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      {window.products?.length || 0} products
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  {window.max_items_total && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Capacity</span>
                        <span>{window.metrics?.items_count || 0} / {window.max_items_total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#5B6E02] h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((window.metrics?.items_count || 0) / window.max_items_total) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {window.metrics && (
                    <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-300">
                      <div>
                        <div className="text-xs text-gray-600">Orders</div>
                        <div className="text-sm font-semibold text-gray-900">{window.metrics.orders_count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Items</div>
                        <div className="text-sm font-semibold text-gray-900">{window.metrics.items_count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Revenue</div>
                        <div className="text-sm font-semibold text-gray-900">${window.metrics.gross.toFixed(0)}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/vendor/sales-windows/${window.id}/edit`} className="flex-1">
                      <Button variant="secondary" className="w-full" title="Edit window">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="secondary" className="flex-1" title="Duplicate window">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="secondary" title="View QR codes">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" title="Public link">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default SalesWindowsIndexPage;

