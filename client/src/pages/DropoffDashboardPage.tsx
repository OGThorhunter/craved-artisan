'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Calendar, MapPin, Users, DollarSign, MessageCircle, Settings, 
  Plus, Edit, Copy, Trash2, Eye, Download, Upload, Filter,
  Search, Grid, List, ChevronDown, ChevronUp, X, Bell, Zap,
  Award, Target, Gift, Tag, Globe, Camera, Video, FileText,
  PieChart, Activity, ArrowUpRight, ArrowDownRight, Sparkles,
  Brain, Lightbulb, Shield, Info, CheckCircle, AlertCircle,
  Clock, Star, Heart, Share2, ExternalLink, Download as DownloadIcon,
  Upload as UploadIcon, Settings as SettingsIcon, BarChart3,
  Headphones, Box, Palette, CreditCard, Users as UsersIcon,
  ShoppingCart, Package as PackageIcon, Calendar as CalendarIcon,
  MessageSquare, Bell as BellIcon, BarChart3 as BarChart3Icon,
  Headphones as HeadphonesIcon, Box as BoxIcon, Palette as PaletteIcon,
  CreditCard as CreditCardIcon, Map, Layers, MousePointer,
  Move, RotateCcw, Save, Play, Pause, Volume2, Wifi, Power,
  Droplets, Car, Coffee, Utensils, Music, Camera as CameraIcon,
  Video as VideoIcon, FileText as FileTextIcon, PieChart as PieChartIcon,
  Activity as ActivityIcon, ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon, Sparkles as SparklesIcon,
  Brain as BrainIcon, Lightbulb as LightbulbIcon, Shield as ShieldIcon,
  Info as InfoIcon, CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon,
  Clock as ClockIcon, Star as StarIcon, Heart as HeartIcon,
  Share2 as Share2Icon, ExternalLink as ExternalLinkIcon, Truck,
  Package, QrCode, Smartphone, Mail, Thermometer, Snowflake,
  AlertTriangle, CheckCircle2, Clock as ClockIcon2, MapPin as MapPinIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropoffLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  capacity: {
    total: number;
    used: number;
    available: number;
  };
  status: 'open' | 'closed' | 'maintenance';
  manager: string;
  staffCount: number;
}

interface Schedule {
  id: string;
  date: string;
  timeSlot: string;
  type: 'vendor-dropoff' | 'customer-pickup' | 'staff-shift';
  vendorId?: string;
  vendorName?: string;
  customerId?: string;
  customerName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  recurring: boolean;
  recurringPattern?: string;
}

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  avatar: string;
  category: string;
  tags: string[];
  dropoffDate: string;
  pickupMethod: 'customer-pickup' | 'delivery' | 'consignment';
  status: 'scheduled' | 'dropped-off' | 'picked-up' | 'expired';
  zone: string;
  shelf: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    handling: 'refrigerated' | 'fragile' | 'bulk' | 'shelf-stable';
    expiryDate?: string;
  }>;
  paymentMode: 'prepaid' | 'consignment' | 'wholesale';
  consignmentRevenue?: number;
  payoutStatus: 'pending' | 'paid' | 'scheduled';
}

interface Delivery {
  id: string;
  vendorId: string;
  vendorName: string;
  expectedTime: string;
  actualTime?: string;
  status: 'expected' | 'in-transit' | 'delivered' | 'late' | 'missing';
  photoProof?: string;
  notes?: string;
  items: Array<{
    id: string;
    name: string;
    expectedQuantity: number;
    actualQuantity?: number;
    status: 'complete' | 'partial' | 'missing';
  }>;
}

interface CustomerPickup {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'scheduled' | 'on-the-way' | 'arrived' | 'picked-up' | 'no-show';
  notificationSent: boolean;
  reminderSent: boolean;
  qrCode: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface DropoffInsight {
  id: string;
  type: 'delivery' | 'pickup' | 'capacity' | 'revenue' | 'staffing';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Metrics {
  weeklyVendorCount: number;
  fulfilledOrders: number;
  pickupSuccessRate: number;
  topConsignmentVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
  }>;
  capacityUtilization: number;
  averagePickupTime: number;
  customerSatisfaction: number;
}

export default function DropoffDashboardPage() {
  const [location, setLocation] = useState<DropoffLocation | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [pickups, setPickups] = useState<CustomerPickup[]>([]);
  const [aiInsights, setAiInsights] = useState<DropoffInsight[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'vendors' | 'deliveries' | 'pickups' | 'ai' | 'metrics' | 'settings'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockLocation: DropoffLocation = {
      id: 'loc1',
      name: 'Locust Grove Drop-off Center',
      address: '123 Main Street',
      city: 'Locust Grove',
      state: 'GA',
      zipCode: '30248',
      phone: '(770) 555-0123',
      email: 'info@locustgrovedropoff.com',
      hours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: 'Closed'
      },
      capacity: {
        total: 500,
        used: 342,
        available: 158
      },
      status: 'open',
      manager: 'Sarah Johnson',
      staffCount: 8
    };

    const mockSchedules: Schedule[] = [
      {
        id: 's1',
        date: '2024-02-15',
        timeSlot: '09:00-11:00',
        type: 'vendor-dropoff',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        status: 'scheduled',
        notes: 'Fresh bread delivery',
        recurring: true,
        recurringPattern: 'weekly'
      },
      {
        id: 's2',
        date: '2024-02-15',
        timeSlot: '14:00-16:00',
        type: 'customer-pickup',
        customerId: 'c1',
        customerName: 'Emma Wilson',
        status: 'scheduled',
        notes: 'Order #12345',
        recurring: false
      }
    ];

    const mockVendors: Vendor[] = [
      {
        id: 'v1',
        name: 'Sarah Johnson',
        businessName: 'Rose Creek Bakery',
        avatar: '/images/vendors/rosecreek-avatar.jpg',
        category: 'Food & Beverage',
        tags: ['artisan', 'organic', 'local'],
        dropoffDate: '2024-02-15',
        pickupMethod: 'customer-pickup',
        status: 'dropped-off',
        zone: 'A',
        shelf: 'A12',
        products: [
          {
            id: 'p1',
            name: 'Sourdough Bread',
            quantity: 20,
            price: 9.00,
            handling: 'shelf-stable',
            expiryDate: '2024-02-18'
          },
          {
            id: 'p2',
            name: 'Artisan Butter',
            quantity: 15,
            price: 6.50,
            handling: 'refrigerated',
            expiryDate: '2024-02-22'
          }
        ],
        paymentMode: 'prepaid',
        payoutStatus: 'paid'
      },
      {
        id: 'v2',
        name: 'Michael Chen',
        businessName: 'Green Thumb Gardens',
        avatar: '/images/vendors/greenthumb-avatar.jpg',
        category: 'Agriculture',
        tags: ['organic', 'seasonal', 'farm-fresh'],
        dropoffDate: '2024-02-15',
        pickupMethod: 'consignment',
        status: 'dropped-off',
        zone: 'B',
        shelf: 'B05',
        products: [
          {
            id: 'p3',
            name: 'Organic Tomatoes',
            quantity: 30,
            price: 4.50,
            handling: 'fragile',
            expiryDate: '2024-02-17'
          }
        ],
        paymentMode: 'consignment',
        consignmentRevenue: 135.00,
        payoutStatus: 'pending'
      }
    ];

    const mockDeliveries: Delivery[] = [
      {
        id: 'd1',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        expectedTime: '2024-02-15T09:00:00Z',
        actualTime: '2024-02-15T08:45:00Z',
        status: 'delivered',
        photoProof: '/images/deliveries/delivery-1.jpg',
        notes: 'Early delivery, all items accounted for',
        items: [
          {
            id: 'i1',
            name: 'Sourdough Bread',
            expectedQuantity: 20,
            actualQuantity: 20,
            status: 'complete'
          },
          {
            id: 'i2',
            name: 'Artisan Butter',
            expectedQuantity: 15,
            actualQuantity: 15,
            status: 'complete'
          }
        ]
      }
    ];

    const mockPickups: CustomerPickup[] = [
      {
        id: 'p1',
        customerId: 'c1',
        customerName: 'Emma Wilson',
        customerEmail: 'emma.wilson@email.com',
        customerPhone: '(404) 555-0123',
        orderId: 'o12345',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        scheduledTime: '2024-02-15T14:00:00Z',
        status: 'scheduled',
        notificationSent: true,
        reminderSent: false,
        qrCode: 'QR123456789',
        items: [
          {
            id: 'i1',
            name: 'Sourdough Bread',
            quantity: 2,
            price: 9.00
          },
          {
            id: 'i2',
            name: 'Artisan Butter',
            quantity: 1,
            price: 6.50
          }
        ]
      }
    ];

    const mockAIInsights: DropoffInsight[] = [
      {
        id: 'ai1',
        type: 'delivery',
        title: 'Delivery Forecast',
        description: 'Expected 15 deliveries tomorrow, recommend 3 staff members',
        confidence: 0.85,
        action: 'Schedule Staff',
        priority: 'medium'
      },
      {
        id: 'ai2',
        type: 'capacity',
        title: 'Capacity Alert',
        description: 'Zone A at 85% capacity, consider expanding or redistributing',
        confidence: 0.92,
        priority: 'high'
      },
      {
        id: 'ai3',
        type: 'pickup',
        title: 'Pickup Optimization',
        description: 'Peak pickup hours 2-4 PM, suggest staggered scheduling',
        confidence: 0.78,
        action: 'Optimize Schedule',
        priority: 'medium'
      }
    ];

    const mockMetrics: Metrics = {
      weeklyVendorCount: 45,
      fulfilledOrders: 127,
      pickupSuccessRate: 94.5,
      topConsignmentVendors: [
        { id: 'v1', name: 'Rose Creek Bakery', revenue: 1250.00, orderCount: 45 },
        { id: 'v2', name: 'Green Thumb Gardens', revenue: 890.00, orderCount: 32 },
        { id: 'v3', name: 'Artisan Crafts Co', revenue: 675.00, orderCount: 28 }
      ],
      capacityUtilization: 68.4,
      averagePickupTime: 3.2,
      customerSatisfaction: 4.8
    };

    setLocation(mockLocation);
    setSchedules(mockSchedules);
    setVendors(mockVendors);
    setDeliveries(mockDeliveries);
    setPickups(mockPickups);
    setAiInsights(mockAIInsights);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'dropped-off': return 'text-purple-600 bg-purple-100';
      case 'picked-up': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'late': return 'text-orange-600 bg-orange-100';
      case 'missing': return 'text-red-600 bg-red-100';
      case 'on-the-way': return 'text-blue-600 bg-blue-100';
      case 'arrived': return 'text-yellow-600 bg-yellow-100';
      case 'no-show': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHandlingIcon = (handling: string) => {
    switch (handling) {
      case 'refrigerated': return <Snowflake className="w-4 h-4" />;
      case 'fragile': return <AlertTriangle className="w-4 h-4" />;
      case 'bulk': return <Package className="w-4 h-4" />;
      case 'shelf-stable': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'pickup': return <Users className="w-4 h-4" />;
      case 'capacity': return <Box className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'staffing': return <UsersIcon className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!location || !metrics) return <div>Location not found.</div>;

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-green rounded-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
                <p className="text-gray-600">Drop-off Location Dashboard</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                location.status === 'open' ? 'bg-green-100 text-green-800' :
                location.status === 'closed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">{vendors.length}</div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-maroon">{pickups.length}</div>
                <div className="text-sm text-gray-600">Today's Pickups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{location.capacity.used}/{location.capacity.total}</div>
                <div className="text-sm text-gray-600">Capacity Used</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
              { id: 'vendors', label: 'Vendors', icon: UsersIcon },
              { id: 'deliveries', label: 'Deliveries', icon: Truck },
              { id: 'pickups', label: 'Pickups', icon: PackageIcon },
              { id: 'ai', label: 'AI Assistant', icon: Brain },
              { id: 'metrics', label: 'Metrics', icon: BarChart3Icon },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
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
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-brand-green to-brand-maroon rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Drop-off Center Overview</h2>
                    <p className="text-green-100">Manage vendor deliveries and customer pickups efficiently</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{location.address}, {location.city}, {location.state} {location.zipCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Today: {location.hours.monday}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateScheduleModal(true)}
                    className="bg-white text-brand-green px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Schedule
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {schedules.filter(s => s.date === selectedDate.toISOString().split('T')[0]).length}
                  </div>
                  <div className="text-sm text-gray-600">Today's Appointments</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {deliveries.filter(d => d.status === 'expected' || d.status === 'in-transit').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Deliveries</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {pickups.filter(p => p.status === 'scheduled').length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled Pickups</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${metrics.topConsignmentVendors.reduce((sum, v) => sum + v.revenue, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Consignment Revenue</div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Brain className="w-4 h-4" />
                    Powered by AI
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'delivery' ? 'bg-blue-100 text-blue-600' :
                          insight.type === 'pickup' ? 'bg-green-100 text-green-600' :
                          insight.type === 'capacity' ? 'bg-yellow-100 text-yellow-600' :
                          insight.type === 'revenue' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{insight.confidence * 100}% confidence</span>
                            {insight.action && (
                              <button className="text-xs text-brand-green hover:text-brand-green/80">
                                {insight.action} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Today's Schedule</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1 text-sm rounded ${
                        viewMode === 'calendar' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-sm rounded ${
                        viewMode === 'list' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {schedules.filter(s => s.date === selectedDate.toISOString().split('T')[0]).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          schedule.type === 'vendor-dropoff' ? 'bg-blue-100 text-blue-600' :
                          schedule.type === 'customer-pickup' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {schedule.type === 'vendor-dropoff' ? <Truck className="w-4 h-4" /> :
                           schedule.type === 'customer-pickup' ? <Package className="w-4 h-4" /> :
                           <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {schedule.vendorName || schedule.customerName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {schedule.timeSlot} • {schedule.type.replace('-', ' ')}
                          </p>
                          {schedule.notes && (
                            <p className="text-xs text-gray-500 mt-1">{schedule.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status.replace('-', ' ')}
                        </span>
                        {schedule.recurring && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity & Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Capacity Management</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Storage Utilization</span>
                        <span className="text-sm font-medium">{metrics.capacityUtilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-green h-2 rounded-full" 
                          style={{ width: `${metrics.capacityUtilization}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{location.capacity.total}</div>
                        <div className="text-xs text-gray-600">Total Capacity</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-brand-green">{location.capacity.used}</div>
                        <div className="text-xs text-gray-600">Used</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-brand-maroon">{location.capacity.available}</div>
                        <div className="text-xs text-gray-600">Available</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pickup Success Rate</span>
                      <span className="font-semibold text-green-600">{metrics.pickupSuccessRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Pickup Time</span>
                      <span className="font-semibold">{metrics.averagePickupTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="font-semibold text-yellow-600">{metrics.customerSatisfaction}/5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weekly Vendor Count</span>
                      <span className="font-semibold">{metrics.weeklyVendorCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[...deliveries, ...pickups]
                    .sort((a, b) => {
                      const aTime = new Date('expectedTime' in a ? a.expectedTime : 'scheduledTime' in a ? a.scheduledTime : new Date()).getTime();
                      const bTime = new Date('expectedTime' in b ? b.expectedTime : 'scheduledTime' in b ? b.scheduledTime : new Date()).getTime();
                      return bTime - aTime;
                    })
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          'vendorId' in item ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {'vendorId' in item ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {('vendorId' in item ? item.vendorName : (item as any).customerName || 'Customer')}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {('vendorId' in item ? 'Delivery' : 'Pickup')} • {new Date('vendorId' in item ? item.expectedTime : (item as any).scheduledTime || new Date()).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="text-4xl font-bold text-gray-300 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </div>
              <p className="text-gray-500">This module is coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
