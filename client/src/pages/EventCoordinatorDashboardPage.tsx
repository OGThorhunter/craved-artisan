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
import { EventList } from '@/components/events/EventList';
import { EventForm } from '@/components/events/EventForm';
import type { Event as EventType } from '@/lib/api/events';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'layout' | 'sales' | 'inventory' | 'checkin' | 'refunds' | 'analytics'>('overview');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Events management state
  const [eventsList, setEventsList] = useState<EventType[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventsViewMode, setEventsViewMode] = useState<'grid' | 'list'>('grid');

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
    
    // Mock events data for events management
    const mockEventsList: EventType[] = [
      {
        id: 'evt_1',
        title: 'Locust Grove Artisan Market',
        description: 'A vibrant marketplace featuring local artisans, farmers, and food vendors.',
        venue: 'Locust Grove Farmers Market',
        address: '123 Main St, Locust Grove, GA',
        startDate: '2024-03-15T09:00:00Z',
        endDate: '2024-03-15T17:00:00Z',
        capacity: 60,
        categories: ['artisan', 'farmers-market', 'local'],
        tags: ['artisan', 'farmers-market', 'local'],
        status: 'published',
        visibility: 'public',
        imageUrl: '/images/events/market-1.jpg',
        coverImage: '/images/events/market-1.jpg',
        gallery: ['/images/events/market-1.jpg'],
        documents: [],
        isRecurring: false,
        recurrencePattern: null,
        recurrenceEndDate: null,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z',
      },
      {
        id: 'evt_2',
        title: 'Spring Craft Fair',
        description: 'Handmade crafts, jewelry, and home decor from talented local artisans.',
        venue: 'Macon Convention Center',
        address: '456 Convention Blvd, Macon, GA',
        startDate: '2024-04-20T10:00:00Z',
        endDate: '2024-04-20T18:00:00Z',
        capacity: 50,
        categories: ['crafts', 'jewelry', 'home-decor'],
        tags: ['crafts', 'jewelry', 'home-decor'],
        status: 'draft',
        visibility: 'private',
        imageUrl: '/images/events/craft-fair.jpg',
        coverImage: '/images/events/craft-fair.jpg',
        gallery: ['/images/events/craft-fair.jpg'],
        documents: [],
        isRecurring: false,
        recurrencePattern: null,
        recurrenceEndDate: null,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z',
      }
    ];
    setEventsList(mockEventsList);
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

  // Event management functions
  const handleCreateEvent = (eventData: any) => {
    const newEvent: EventType = {
      id: `evt_${Date.now()}`,
      title: eventData.title || '',
      description: eventData.description || '',
      venue: eventData.venue?.name || eventData.venue || '',
      address: eventData.venue?.address || eventData.address || '',
      startDate: eventData.startDate || new Date().toISOString(),
      endDate: eventData.endDate || new Date().toISOString(),
      capacity: 50, // Default capacity since we removed the field
      categories: [], // Default empty since we removed the field
      tags: [],
      status: 'draft',
      visibility: 'private',
      imageUrl: eventData.coverImage || eventData.imageUrl || '',
      coverImage: eventData.coverImage || '',
      gallery: eventData.gallery || [],
      documents: eventData.documents || [],
      isRecurring: eventData.isRecurring || false,
      recurrencePattern: eventData.recurrenceType || eventData.recurrencePattern || null,
      recurrenceEndDate: eventData.recurrenceEndDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Enhanced fields
      eventType: eventData.eventType || '',
      vendorSignupDeadline: eventData.vendorSignupDeadline || '',
      siteMap: eventData.siteMap || null,
      venueInfo: eventData.venue || null,
      setupInstructions: eventData.setupInstructions || '',
      takedownInstructions: eventData.takedownInstructions || '',
      setupStartTime: eventData.setupStartTime || '',
      takedownEndTime: eventData.takedownEndTime || '',
      venueType: eventData.venueType || '',
      weatherForecast: eventData.weatherForecast || '',
      evacuationRoute: eventData.evacuationRoute || '',
      fireMarshalCapacity: eventData.fireMarshalCapacity || '',
      fireMarshalSafetyItems: eventData.fireMarshalSafetyItems || '',
      vendorContract: eventData.vendorContract || '',
      safetyRequirements: eventData.safetyRequirements || '',
    };
    setEventsList(prev => [newEvent, ...prev]);
    setShowCreateEventModal(false);
  };

  const handleEditEvent = (event: EventType) => {
    setEditingEvent(event);
    setShowCreateEventModal(true);
  };

  const handleUpdateEvent = (eventData: any) => {
    if (!editingEvent) return;
    
    const updatedEvent: EventType = {
      ...editingEvent,
      title: eventData.title || editingEvent.title,
      description: eventData.description || editingEvent.description,
      venue: eventData.venue?.name || eventData.venue || editingEvent.venue,
      address: eventData.venue?.address || eventData.address || editingEvent.address,
      startDate: eventData.startDate || editingEvent.startDate,
      endDate: eventData.endDate || editingEvent.endDate,
      capacity: editingEvent.capacity, // Keep existing capacity since we removed the field
      categories: editingEvent.categories, // Keep existing categories since we removed the field
      isRecurring: eventData.isRecurring || editingEvent.isRecurring,
      recurrencePattern: eventData.recurrenceType || eventData.recurrencePattern || editingEvent.recurrencePattern,
      coverImage: eventData.coverImage || editingEvent.coverImage,
      imageUrl: eventData.coverImage || eventData.imageUrl || editingEvent.imageUrl,
      updatedAt: new Date().toISOString(),
      // Enhanced fields
      eventType: eventData.eventType || editingEvent.eventType,
      vendorSignupDeadline: eventData.vendorSignupDeadline || editingEvent.vendorSignupDeadline,
      siteMap: eventData.siteMap || editingEvent.siteMap,
      venueInfo: eventData.venue || editingEvent.venueInfo,
      setupInstructions: eventData.setupInstructions || editingEvent.setupInstructions,
      takedownInstructions: eventData.takedownInstructions || editingEvent.takedownInstructions,
      setupStartTime: eventData.setupStartTime || editingEvent.setupStartTime,
      takedownEndTime: eventData.takedownEndTime || editingEvent.takedownEndTime,
      venueType: eventData.venueType || editingEvent.venueType,
      weatherForecast: eventData.weatherForecast || editingEvent.weatherForecast,
      evacuationRoute: eventData.evacuationRoute || editingEvent.evacuationRoute,
      fireMarshalCapacity: eventData.fireMarshalCapacity || editingEvent.fireMarshalCapacity,
      fireMarshalSafetyItems: eventData.fireMarshalSafetyItems || editingEvent.fireMarshalSafetyItems,
      vendorContract: eventData.vendorContract || editingEvent.vendorContract,
      safetyRequirements: eventData.safetyRequirements || editingEvent.safetyRequirements,
    };
    
    setEventsList(prev => prev.map(e => e.id === editingEvent.id ? updatedEvent : e));
    setEditingEvent(null);
    setShowCreateEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEventsList(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleDuplicateEvent = (event: EventType) => {
    const duplicatedEvent: EventType = {
      ...event,
      id: `evt_${Date.now()}`,
      title: `${event.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEventsList(prev => [duplicatedEvent, ...prev]);
  };

  // Filter events based on search and status
  const filteredEvents = eventsList.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              { id: 'layout', label: 'Layout', icon: Map },
              { id: 'sales', label: 'Sales', icon: BarChart3Icon },
              { id: 'inventory', label: 'Inventory', icon: PackageIcon },
              { id: 'checkin', label: 'Check-in', icon: UsersIcon },
              { id: 'refunds', label: 'Refunds', icon: CreditCardIcon },
              { id: 'analytics', label: 'Analytics', icon: ActivityIcon }
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('events')}
                      className="bg-white text-brand-green px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Manage Events
                    </button>
                    <button
                      onClick={() => {
                        setEditingEvent(null);
                        setShowCreateEventModal(true);
                      }}
                      className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create Event
                    </button>
                  </div>
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
                  <button 
                    onClick={() => setActiveTab('events')} 
                    className="text-brand-green hover:text-brand-green/80 text-sm"
                  >
                    View all →
                  </button>
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

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Events Header */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                    <p className="text-gray-600">Create, edit, and manage your events</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setShowCreateEventModal(true);
                    }}
                    className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Event
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Search events"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Filter by status"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <div className="flex border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setEventsViewMode('grid')}
                        className={`p-2 ${eventsViewMode === 'grid' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Grid view"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEventsViewMode('list')}
                        className={`p-2 ${eventsViewMode === 'list' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                <EventList
                  events={filteredEvents}
                  loading={eventsLoading}
                  onEdit={handleEditEvent}
                  onDuplicate={handleDuplicateEvent}
                  onDelete={handleDeleteEvent}
                  onManageLayout={(event) => {
                    window.location.href = `/dashboard/event-coordinator/events/${event.id}/layout`;
                  }}
                  onManageSales={(event) => {
                    window.location.href = `/dashboard/event-coordinator/events/${event.id}/sales`;
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Layout Manager</h2>
                    <p className="text-gray-600">Design venue layouts with zones, stalls, and pricing</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/layout">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Layout Editor
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <motion.div
              key="sales"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
                    <p className="text-gray-600">Manage sales windows, checkout, and orders</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/sales">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Sales Manager
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inventory Operations</h2>
                    <p className="text-gray-600">Manage holds, bulk operations, and assignments</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/inventory">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Inventory Manager
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Check-in Tab */}
          {activeTab === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Check-in & Operations</h2>
                    <p className="text-gray-600">QR scanning, incident management, and offline operations</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/checkin">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Check-in Manager
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Refunds Tab */}
          {activeTab === 'refunds' && (
            <motion.div
              key="refunds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Refunds & Payouts</h2>
                    <p className="text-gray-600">Process refunds, manage credits, and handle vendor payouts</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/refunds-payouts">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Refunds Manager
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics & Communications</h2>
                    <p className="text-gray-600">Event analytics, funnel analysis, and communication management</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/analytics-communications">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Open Analytics Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <EventForm
                event={editingEvent}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                onCancel={() => {
                  setShowCreateEventModal(false);
                  setEditingEvent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
