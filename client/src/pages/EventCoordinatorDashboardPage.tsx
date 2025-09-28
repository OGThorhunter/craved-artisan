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
  Share2 as Share2Icon, ExternalLink as ExternalLinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  vendorCount: number;
  maxVendors: number;
  earnings: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  tags: string[];
  image: string;
  mapUrl?: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  avatar: string;
  category: string;
  tags: string[];
  boothNumber?: string;
  boothSize?: string;
  status: 'invited' | 'applied' | 'approved' | 'paid' | 'confirmed' | 'declined';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  stallFee: number;
  documents: string[];
  rating: number;
  reviewCount: number;
  pastEvents: number;
  zipCode: string;
  distance: number;
}

interface Booth {
  id: string;
  number: string;
  size: string;
  category: string;
  price: number;
  status: 'available' | 'reserved' | 'paid' | 'assigned';
  vendorId?: string;
  vendorName?: string;
  coordinates: { x: number; y: number };
  features: string[];
}

interface Message {
  id: string;
  type: 'individual' | 'broadcast';
  recipient?: string;
  subject: string;
  content: string;
  template?: string;
  status: 'draft' | 'sent' | 'delivered' | 'read';
  sentAt?: string;
  readAt?: string;
}

interface EventInsight {
  id: string;
  type: 'layout' | 'traffic' | 'weather' | 'revenue' | 'vendor';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

interface SalesData {
  totalRevenue: number;
  stallFees: number;
  platformFees: number;
  estimatedOnSiteSales: number;
  vendorCount: number;
  averageStallFee: number;
  topCategories: Array<{
    name: string;
    revenue: number;
    vendorCount: number;
  }>;
}

export default function EventCoordinatorDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiInsights, setAiInsights] = useState<EventInsight[]>([]);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'vendors' | 'map' | 'messaging' | 'sales' | 'settings'>('overview');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 'e1',
        title: 'Locust Grove Artisan Market',
        description: 'A vibrant marketplace featuring local artisans, farmers, and food vendors.',
        date: '2024-03-15',
        time: '09:00-17:00',
        location: 'Locust Grove, GA',
        venue: 'Locust Grove Farmers Market',
        vendorCount: 45,
        maxVendors: 60,
        earnings: 2250.00,
        status: 'published',
        tags: ['artisan', 'farmers-market', 'local'],
        image: '/images/events/market-1.jpg',
        publicUrl: '/events/locust-grove-artisan-market',
        createdAt: '2024-01-15',
        updatedAt: '2024-02-10'
      },
      {
        id: 'e2',
        title: 'Spring Craft Fair',
        description: 'Handmade crafts, jewelry, and home decor from talented local artisans.',
        date: '2024-04-20',
        time: '10:00-18:00',
        location: 'Macon, GA',
        venue: 'Macon Convention Center',
        vendorCount: 32,
        maxVendors: 50,
        earnings: 1800.00,
        status: 'draft',
        tags: ['crafts', 'jewelry', 'home-decor'],
        image: '/images/events/craft-fair.jpg',
        publicUrl: '/events/spring-craft-fair',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
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
        boothNumber: 'A12',
        boothSize: '10x10',
        status: 'confirmed',
        paymentStatus: 'paid',
        stallFee: 75.00,
        documents: ['insurance.pdf', 'food-permit.pdf'],
        rating: 4.8,
        reviewCount: 127,
        pastEvents: 8,
        zipCode: '30248',
        distance: 2.3
      },
      {
        id: 'v2',
        name: 'Michael Chen',
        businessName: 'Green Thumb Gardens',
        avatar: '/images/vendors/greenthumb-avatar.jpg',
        category: 'Agriculture',
        tags: ['organic', 'seasonal', 'farm-fresh'],
        boothNumber: 'B05',
        boothSize: '8x8',
        status: 'approved',
        paymentStatus: 'pending',
        stallFee: 60.00,
        documents: ['insurance.pdf'],
        rating: 4.9,
        reviewCount: 89,
        pastEvents: 5,
        zipCode: '30301',
        distance: 15.2
      }
    ];

    const mockBooths: Booth[] = [
      {
        id: 'b1',
        number: 'A12',
        size: '10x10',
        category: 'Food & Beverage',
        price: 75.00,
        status: 'assigned',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        coordinates: { x: 120, y: 80 },
        features: ['power', 'water']
      },
      {
        id: 'b2',
        number: 'B05',
        size: '8x8',
        category: 'Agriculture',
        price: 60.00,
        status: 'reserved',
        vendorId: 'v2',
        vendorName: 'Green Thumb Gardens',
        coordinates: { x: 200, y: 150 },
        features: ['power']
      },
      {
        id: 'b3',
        number: 'A15',
        size: '10x10',
        category: 'Food & Beverage',
        price: 75.00,
        status: 'available',
        coordinates: { x: 300, y: 80 },
        features: ['power', 'water']
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'm1',
        type: 'broadcast',
        subject: 'Event Setup Reminder',
        content: 'Reminder: Vendor setup begins at 7:00 AM. Please arrive 15 minutes early.',
        template: 'setup-reminder',
        status: 'sent',
        sentAt: '2024-02-10T08:00:00Z'
      },
      {
        id: 'm2',
        type: 'individual',
        recipient: 'v1',
        subject: 'Booth Assignment Confirmed',
        content: 'Your booth assignment has been confirmed. You will be at Booth A12.',
        status: 'delivered',
        sentAt: '2024-02-09T14:30:00Z',
        readAt: '2024-02-09T15:45:00Z'
      }
    ];

    const mockAIInsights: EventInsight[] = [
      {
        id: 'ai1',
        type: 'layout',
        title: 'Optimal Vendor Layout',
        description: 'Food vendors should be placed near the entrance for maximum foot traffic',
        confidence: 0.85,
        action: 'Auto-optimize layout',
        priority: 'medium'
      },
      {
        id: 'ai2',
        type: 'traffic',
        title: 'Peak Hours Prediction',
        description: 'Expected peak attendance between 11:00 AM - 2:00 PM',
        confidence: 0.92,
        priority: 'high'
      },
      {
        id: 'ai3',
        type: 'revenue',
        title: 'Revenue Forecast',
        description: 'Projected total revenue: $3,200 based on current vendor mix',
        confidence: 0.78,
        priority: 'medium'
      }
    ];

    const mockSalesData: SalesData = {
      totalRevenue: 2250.00,
      stallFees: 1800.00,
      platformFees: 450.00,
      estimatedOnSiteSales: 15000.00,
      vendorCount: 45,
      averageStallFee: 40.00,
      topCategories: [
        { name: 'Food & Beverage', revenue: 900.00, vendorCount: 12 },
        { name: 'Crafts', revenue: 600.00, vendorCount: 18 },
        { name: 'Agriculture', revenue: 300.00, vendorCount: 8 }
      ]
    };

    setEvents(mockEvents);
    setVendors(mockVendors);
    setBooths(mockBooths);
    setMessages(mockMessages);
    setAiInsights(mockAIInsights);
    setSalesData(mockSalesData);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'published': return 'text-brand-green bg-brand-green/10';
      case 'active': return 'text-brand-green bg-brand-green/20';
      case 'completed': return 'text-gray-600 bg-gray-200';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVendorStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'text-yellow-600 bg-yellow-100';
      case 'applied': return 'text-brand-green bg-brand-green/10';
      case 'approved': return 'text-brand-green bg-brand-green/20';
      case 'paid': return 'text-brand-green bg-brand-green/30';
      case 'confirmed': return 'text-brand-green bg-brand-green/20';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBoothStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-brand-green bg-brand-green/10';
      case 'reserved': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-brand-green bg-brand-green/20';
      case 'assigned': return 'text-brand-green bg-brand-green/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'layout': return <Map className="w-4 h-4" />;
      case 'traffic': return <Users className="w-4 h-4" />;
      case 'weather': return <Globe className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'vendor': return <UsersIcon className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-green rounded-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Coordinator Dashboard</h1>
                <p className="text-gray-600">Manage your events and coordinate with vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">{events.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-maroon">{vendors.length}</div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${salesData?.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
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
              { id: 'events', label: 'Events', icon: CalendarIcon },
              { id: 'vendors', label: 'Vendors', icon: UsersIcon },
              { id: 'map', label: 'Map Editor', icon: Map },
              { id: 'messaging', label: 'Messaging', icon: MessageSquare },
              { id: 'sales', label: 'Sales', icon: BarChart3Icon },
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
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">Event Management Overview</h2>
                    <p className="text-gray-600">Track your events, coordinate vendors, and maximize success</p>
                  </div>
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Event
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'published' || e.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Events</div>
                </div>

                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <Users className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vendors.filter(v => v.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed Vendors</div>
                </div>

                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${salesData?.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>

                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {messages.filter(m => m.status === 'sent').length}
                  </div>
                  <div className="text-sm text-gray-600">Messages Sent</div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Brain className="w-4 h-4" />
                    Powered by AI
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'layout' ? 'bg-brand-green/10 text-brand-green' :
                          insight.type === 'traffic' ? 'bg-brand-green/20 text-brand-green' :
                          insight.type === 'weather' ? 'bg-yellow-100 text-yellow-600' :
                          insight.type === 'revenue' ? 'bg-brand-green/10 text-brand-green' :
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

              {/* Recent Events */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <Link href="/dashboard/event-coordinator/events" className="text-brand-green hover:text-brand-green/80 text-sm">
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={event.image} alt={event.title} className="w-16 h-16 rounded object-cover" />
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{event.vendorCount}/{event.maxVendors} vendors</span>
                            <span className="text-sm font-medium">${event.earnings}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-gray-100 rounded" title="Edit event">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Duplicate event">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="View public page">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <h3 className="text-lg font-semibold mb-4">Vendor Status</h3>
                  <div className="space-y-3">
                    {[
                      { status: 'confirmed', count: vendors.filter(v => v.status === 'confirmed').length, color: 'bg-brand-green/20 text-brand-green' },
                      { status: 'approved', count: vendors.filter(v => v.status === 'approved').length, color: 'bg-brand-green/10 text-brand-green' },
                      { status: 'applied', count: vendors.filter(v => v.status === 'applied').length, color: 'bg-yellow-100 text-yellow-800' },
                      { status: 'invited', count: vendors.filter(v => v.status === 'invited').length, color: 'bg-gray-100 text-gray-800' }
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${item.color}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                  <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stall Fees</span>
                      <span className="font-semibold">${salesData?.stallFees.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Platform Fees</span>
                      <span className="font-semibold">${salesData?.platformFees.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estimated On-Site Sales</span>
                      <span className="font-semibold">${salesData?.estimatedOnSiteSales.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Revenue</span>
                        <span className="font-bold text-lg text-brand-green">${salesData?.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
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
