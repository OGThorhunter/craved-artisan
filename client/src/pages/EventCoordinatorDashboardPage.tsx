'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Calendar, MapPin, Users, DollarSign, MessageCircle, Settings, 
  Plus, Edit, Copy, Trash2, Eye, Download, Upload, Filter,
  Search, Grid, List, ChevronDown, ChevronUp, X, Bell, Zap,
  ArrowLeft,
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
import { PromotionsManager } from '@/components/sales/PromotionsManager';
import { OrdersManager } from '@/components/sales/OrdersManager';
import { CheckoutForm } from '@/components/sales/CheckoutForm';
import { LayoutWizard } from '@/components/events/LayoutWizard';
import { StallAssignments } from '@/components/events/StallAssignments';
import { RatingCollection, RatingSummary } from '@/components/events/RatingCollection';
import { StarRating, CompactStarRating, RatingBreakdown } from '@/components/common/StarRating';
import { AILayoutOptimizer } from '@/components/events/AILayoutOptimizer';
import { CheckinManager } from '@/components/checkin/CheckinManager';
import { IncidentManager } from '@/components/checkin/IncidentManager';
import { RefundManager } from '@/components/refunds-payouts/RefundManager';
import { PayoutManager } from '@/components/refunds-payouts/PayoutManager';
import type { SalesWindow, Order } from '@/lib/api/sales';
import type { Event as EventType } from '@/lib/api/events';
import type { RefundRequest, Payout } from '@/lib/api/refunds-payouts';

interface Stall {
  id: string;
  number: string;
  size: string;
  price: number;
  status: string;
  vendorId?: string;
  vendorName?: string;
}

interface Promotion {
  id: string;
  eventId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'early_bird' | 'group_discount';
  value: number;
  code?: string;
  startsAt: string;
  endsAt: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  minOrderAmount?: number;
  applicableVendorTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

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
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'inventory' | 'checkin' | 'refunds' | 'analytics'>('overview');
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
  
  // Sales-related state
  const [salesActiveTab, setSalesActiveTab] = useState<'promotions' | 'stalls' | 'messaging' | 'analytics'>('promotions');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedStalls, setSelectedStalls] = useState<Stall[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [eventRatings, setEventRatings] = useState<any[]>([]);
  
  // Check-in related state
  const [checkinSession, setCheckinSession] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  
  // Refunds and payouts related state
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [refundsPayoutsLoading, setRefundsPayoutsLoading] = useState(false);
  
  // Analytics filters state
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [analyticsDetailLevel, setAnalyticsDetailLevel] = useState<'summary' | 'detailed' | 'comprehensive'>('summary');
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState<string>('all');
  
  // Event details and social sharing state
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventType | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  // Layout and stall management state
  const [layoutData, setLayoutData] = useState({
    layoutMode: 'grid' as 'grid' | 'image-overlay',
    floorPlanImage: undefined as string | undefined,
    gridRows: 5,
    gridColumns: 8,
    stallStatus: {} as Record<number, { status: string; zone: string; size: string }>,
    vendorAssignments: {} as Record<number, { type: string; name: string; size: string }>
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 'e1',
        title: 'Locust Grove Artisan Market',
        description: 'A vibrant marketplace featuring local artisans, farmers, and food vendors.',
        startDate: '2024-03-15T09:00:00Z' as any,
        endDate: '2024-03-15T17:00:00Z' as any,
        venue: 'Locust Grove Farmers Market',
        address: 'Locust Grove, GA',
        slug: 'locust-grove-artisan-market',
        status: 'published',
        visibility: 'public',
        capacity: 60,
        categories: ['artisan', 'farmers-market', 'local'] as any,
        tags: ['artisan', 'farmers-market', 'local'],
        coverImage: '/images/events/market-1.jpg',
        imageUrl: '/images/events/market-1.jpg',
        applicationCount: 45,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      },
      {
        id: 'e2',
        title: 'Spring Craft Fair',
        description: 'Handmade crafts, jewelry, and home decor from talented local artisans.',
        startDate: '2024-04-20T10:00:00Z' as any,
        endDate: '2024-04-20T18:00:00Z' as any,
        venue: 'Macon Convention Center',
        address: 'Macon, GA',
        slug: 'spring-craft-fair',
        status: 'draft',
        visibility: 'private',
        capacity: 50,
        categories: ['crafts', 'jewelry', 'home-decor'] as any,
        tags: ['crafts', 'jewelry', 'home-decor'],
        coverImage: '/images/events/craft-fair.jpg',
        imageUrl: '/images/events/craft-fair.jpg',
        applicationCount: 32,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
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
        categories: ['artisan', 'farmers-market', 'local'] as any,
        tags: ['artisan', 'farmers-market', 'local'],
        status: 'published',
        visibility: 'public',
        imageUrl: '/images/events/market-1.jpg',
        coverImage: '/images/events/market-1.jpg',
        gallery: ['/images/events/market-1.jpg'],
        documents: [],
        isRecurring: false,
        recurrencePattern: null as any,
        recurrenceEndDate: null as any,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z',
      },
      {
        id: 'evt_2',
        title: 'Spring Craft Fair',
        description: 'Handmade crafts, jewelry, and home decor from talented local artisans.',
        venue: 'Macon Convention Center',
        address: '456 Convention Blvd, Macon, GA',
        startDate: '2024-04-20T10:00:00Z' as any,
        endDate: '2024-04-20T18:00:00Z',
        capacity: 50,
        categories: ['crafts', 'jewelry', 'home-decor'] as any,
        tags: ['crafts', 'jewelry', 'home-decor'],
        status: 'draft',
        visibility: 'private',
        imageUrl: '/images/events/craft-fair.jpg',
        coverImage: '/images/events/craft-fair.jpg',
        gallery: ['/images/events/craft-fair.jpg'],
        documents: [],
        isRecurring: false,
        recurrencePattern: null as any,
        recurrenceEndDate: null as any,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z',
      }
    ];
    setEventsList(mockEventsList);

    // Mock promotions data
    const mockPromotions: Promotion[] = [
      {
        id: 'promo_1',
        eventId: 'evt_1',
        name: 'Early Bird Special',
        description: 'Get 20% off your stall fee when you book early',
        type: 'early_bird',
        value: 20,
        code: 'EARLY2024',
        startsAt: '2024-03-01T09:00:00Z',
        endsAt: '2024-03-10T23:59:59Z',
        maxUses: 50,
        currentUses: 23,
        isActive: true,
        minOrderAmount: 100,
        applicableVendorTypes: ['Baker', 'Honey', 'Vegetables'],
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      },
      {
        id: 'promo_2',
        eventId: 'evt_1',
        name: 'Group Discount',
        description: 'Bring a friend and save $25 on your stall fee',
        type: 'fixed_amount',
        value: 25,
        code: 'GROUP25',
        startsAt: '2024-03-11T09:00:00Z',
        endsAt: '2024-03-20T23:59:59Z',
        maxUses: 30,
        currentUses: 12,
        isActive: true,
        minOrderAmount: 75,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      },
      {
        id: 'promo_3',
        eventId: 'evt_1',
        name: 'Last Chance Sale',
        description: 'Final week discount for remaining stalls',
        type: 'percentage',
        value: 15,
        code: 'LASTCHANCE',
        startsAt: '2024-03-21T09:00:00Z',
        endsAt: '2024-03-28T23:59:59Z',
        maxUses: 20,
        currentUses: 8,
        isActive: false,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      }
    ];
    setPromotions(mockPromotions);

    const mockOrders: Order[] = [
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
    ];
    setOrders(mockOrders);

    // Mock rating data
    const mockRatings = [
      {
        eventId: 'evt_1',
        userId: 'user_1',
        userType: 'vendor',
        overallRating: 4.8,
        categories: {
          organization: 5,
          communication: 4,
          facilities: 5,
          value: 4,
          wouldRecommend: 5
        },
        feedback: 'Great event! Very well organized and the communication was clear.',
        submittedAt: '2024-02-20T10:30:00Z'
      },
      {
        eventId: 'evt_1',
        userId: 'user_2',
        userType: 'customer',
        overallRating: 4.5,
        categories: {
          organization: 4,
          communication: 4,
          facilities: 5,
          value: 5,
          wouldRecommend: 4
        },
        feedback: 'Amazing variety of vendors and great atmosphere!',
        submittedAt: '2024-02-20T14:15:00Z'
      },
      {
        eventId: 'evt_1',
        userId: 'user_3',
        userType: 'vendor',
        overallRating: 4.2,
        categories: {
          organization: 4,
          communication: 3,
          facilities: 4,
          value: 5,
          wouldRecommend: 4
        },
        feedback: 'Good event overall, could improve on setup communication.',
        submittedAt: '2024-02-21T09:45:00Z'
      },
      {
        eventId: 'evt_1',
        userId: 'user_4',
        userType: 'customer',
        overallRating: 5.0,
        categories: {
          organization: 5,
          communication: 5,
          facilities: 5,
          value: 5,
          wouldRecommend: 5
        },
        feedback: 'Perfect event! Will definitely come back next year.',
        submittedAt: '2024-02-21T16:20:00Z'
      },
      {
        eventId: 'evt_1',
        userId: 'user_5',
        userType: 'vendor',
        overallRating: 4.6,
        categories: {
          organization: 5,
          communication: 4,
          facilities: 4,
          value: 5,
          wouldRecommend: 5
        },
        feedback: 'Excellent organization and great vendor support.',
        submittedAt: '2024-02-22T11:10:00Z'
      }
    ];
    setEventRatings(mockRatings);

    // Mock check-in data
    const mockCheckinSession = {
      id: 'session_1',
      eventId: 'evt_1',
      name: 'Morning Check-in Session',
      status: 'ACTIVE',
      startTime: '2024-02-20T08:00:00Z',
      endTime: null,
      staffCount: 3,
      location: 'Main Entrance'
    };
    setCheckinSession(mockCheckinSession);

    const mockCheckins = [
      {
        id: 'checkin_1',
        eventId: 'evt_1',
        sessionId: 'session_1',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        checkinTime: '2024-02-20T08:15:00Z',
        status: 'CHECKED_IN',
        notes: 'Early arrival, setup complete'
      },
      {
        id: 'checkin_2',
        eventId: 'evt_1',
        sessionId: 'session_1',
        vendorId: 'vendor_2',
        vendorName: 'Golden Honey Co.',
        checkinTime: '2024-02-20T08:30:00Z',
        status: 'CHECKED_IN',
        notes: 'On time'
      },
      {
        id: 'checkin_3',
        eventId: 'evt_1',
        sessionId: 'session_1',
        vendorId: 'vendor_3',
        vendorName: 'Fresh Farm Produce',
        checkinTime: '2024-02-20T08:45:00Z',
        status: 'CHECKED_IN',
        notes: 'Late arrival, need assistance'
      }
    ];
    setCheckins(mockCheckins);

    const mockIncidents = [
      {
        id: 'incident_1',
        eventId: 'evt_1',
        sessionId: 'session_1',
        incidentType: 'TECHNICAL',
        severity: 'MEDIUM',
        status: 'OPEN',
        description: 'QR scanner not working properly',
        reportedBy: 'staff_1',
        reportedAt: '2024-02-20T08:20:00Z',
        assignedTo: null,
        resolvedAt: null,
        resolution: null
      },
      {
        id: 'incident_2',
        eventId: 'evt_1',
        sessionId: 'session_1',
        incidentType: 'VENDOR_ISSUE',
        severity: 'LOW',
        status: 'RESOLVED',
        description: 'Vendor lost their stall assignment',
        reportedBy: 'vendor_3',
        reportedAt: '2024-02-20T08:50:00Z',
        assignedTo: 'staff_2',
        resolvedAt: '2024-02-20T09:00:00Z',
        resolution: 'Reassigned to stall 15'
      }
    ];
    setIncidents(mockIncidents);

    // Mock refunds and payouts data
    const mockRefunds = [
      {
        id: 'refund_1',
        eventId: 'evt_1',
        orderId: 'order_1',
        customerId: 'customer_1',
        refundType: 'FULL' as const,
        requestedAmount: 150.00,
        approvedAmount: undefined,
        processedAmount: undefined,
        reason: 'Event cancelled due to weather',
        category: 'EVENT_CANCELLATION' as const,
        description: 'Event was cancelled due to severe weather conditions',
        status: 'PENDING' as const,
        requestedAt: '2024-02-20T10:00:00Z',
        reviewedAt: undefined,
        reviewedBy: undefined,
        processedAt: undefined,
        processedBy: undefined,
        refundMethod: 'ORIGINAL_PAYMENT' as const,
        refundTo: undefined,
        policyApplied: 'Weather Cancellation Policy',
        termsAccepted: true,
        termsAcceptedAt: '2024-02-20T10:00:00Z',
        supportingDocs: [],
        notes: undefined,
        stripeRefundId: undefined,
        stripeChargeId: undefined,
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: '2024-02-20T10:00:00Z',
        order: { id: 'order_1', total: 150.00 },
        customer: { id: 'customer_1', name: 'John Smith', email: 'john@example.com' },
        reviewer: undefined,
        processor: undefined,
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery'
      },
      {
        id: 'refund_2',
        eventId: 'evt_1',
        orderId: 'order_2',
        customerId: 'customer_2',
        refundType: 'PARTIAL' as const,
        requestedAmount: 75.00,
        approvedAmount: 50.00,
        processedAmount: 50.00,
        reason: 'Product quality issue',
        category: 'VENDOR_ISSUE' as const,
        description: 'Customer reported quality issues with purchased items',
        status: 'COMPLETED' as const,
        requestedAt: '2024-02-20T11:30:00Z',
        reviewedAt: '2024-02-20T11:45:00Z',
        reviewedBy: 'admin_1',
        processedAt: '2024-02-20T12:00:00Z',
        processedBy: 'admin_1',
        refundMethod: 'ORIGINAL_PAYMENT' as const,
        refundTo: 'customer_2',
        policyApplied: 'Quality Guarantee Policy',
        termsAccepted: true,
        termsAcceptedAt: '2024-02-20T11:30:00Z',
        supportingDocs: ['photo_1.jpg'],
        notes: 'Partial refund approved due to quality issues',
        stripeRefundId: 're_123456789',
        stripeChargeId: 'ch_123456789',
        createdAt: '2024-02-20T11:30:00Z',
        updatedAt: '2024-02-20T12:00:00Z',
        order: { id: 'order_2', total: 75.00 },
        customer: { id: 'customer_2', name: 'Jane Doe', email: 'jane@example.com' },
        reviewer: { id: 'admin_1', name: 'Admin User' },
        processor: { id: 'admin_1', name: 'Admin User' },
        vendorId: 'vendor_2',
        vendorName: 'Golden Honey Co.'
      },
      {
        id: 'refund_3',
        eventId: 'evt_1',
        orderId: 'order_3',
        customerId: 'customer_3',
        refundType: 'FULL' as const,
        requestedAmount: 100.00,
        approvedAmount: undefined,
        processedAmount: undefined,
        reason: 'Customer changed mind',
        category: 'CUSTOMER_REQUEST' as const,
        description: 'Customer requested refund after changing their mind',
        status: 'REJECTED' as const,
        requestedAt: '2024-02-20T14:15:00Z',
        reviewedAt: '2024-02-20T14:30:00Z',
        reviewedBy: 'admin_1',
        processedAt: '2024-02-20T15:00:00Z',
        processedBy: 'admin_1',
        refundMethod: 'ORIGINAL_PAYMENT' as const,
        refundTo: undefined,
        policyApplied: 'No-Refund Policy for Change of Mind',
        termsAccepted: true,
        termsAcceptedAt: '2024-02-20T14:15:00Z',
        supportingDocs: [],
        notes: 'Refund rejected - change of mind not covered by policy',
        stripeRefundId: undefined,
        stripeChargeId: undefined,
        createdAt: '2024-02-20T14:15:00Z',
        updatedAt: '2024-02-20T15:00:00Z',
        order: { id: 'order_3', total: 100.00 },
        customer: { id: 'customer_3', name: 'Bob Johnson', email: 'bob@example.com' },
        reviewer: { id: 'admin_1', name: 'Admin User' },
        processor: { id: 'admin_1', name: 'Admin User' },
        vendorId: 'vendor_3',
        vendorName: 'Fresh Farm Produce'
      }
    ];
    setRefunds(mockRefunds);

    const mockPayouts = [
      {
        id: 'payout_1',
        eventId: 'evt_1',
        vendorId: 'vendor_1',
        payoutType: 'REVENUE_SHARE' as const,
        grossAmount: 300.00,
        platformFee: 30.00,
        processingFee: 9.00,
        taxWithheld: 0.00,
        netAmount: 261.00,
        periodStart: '2024-02-01T00:00:00Z',
        periodEnd: '2024-02-29T23:59:59Z',
        status: 'PENDING' as const,
        requestedAt: '2024-02-20T10:00:00Z',
        approvedAt: undefined,
        approvedBy: undefined,
        processedAt: undefined,
        completedAt: undefined,
        paymentMethod: 'STRIPE_CONNECT' as const,
        bankAccount: undefined,
        paymentReference: undefined,
        stripeTransferId: undefined,
        stripeAccountId: 'acct_123456789',
        failureReason: undefined,
        notes: 'Revenue share for February event',
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: '2024-02-20T10:00:00Z',
        vendor: { name: 'Sweet Treats Bakery', email: 'sweet@example.com' }
      },
      {
        id: 'payout_2',
        eventId: 'evt_1',
        vendorId: 'vendor_2',
        payoutType: 'REVENUE_SHARE' as const,
        grossAmount: 200.00,
        platformFee: 20.00,
        processingFee: 6.00,
        taxWithheld: 0.00,
        netAmount: 174.00,
        periodStart: '2024-02-01T00:00:00Z',
        periodEnd: '2024-02-29T23:59:59Z',
        status: 'COMPLETED' as const,
        requestedAt: '2024-02-20T09:00:00Z',
        approvedAt: '2024-02-20T09:15:00Z',
        approvedBy: 'admin_1',
        processedAt: '2024-02-20T09:30:00Z',
        completedAt: '2024-02-24T10:30:00Z',
        paymentMethod: 'STRIPE_CONNECT' as const,
        bankAccount: '****1234',
        paymentReference: 'txn_123456789',
        stripeTransferId: 'tr_123456789',
        stripeAccountId: 'acct_987654321',
        failureReason: undefined,
        notes: 'Revenue share for February event - completed',
        createdAt: '2024-02-20T09:00:00Z',
        updatedAt: '2024-02-24T10:30:00Z',
        vendor: { name: 'Golden Honey Co.', email: 'honey@example.com' }
      },
      {
        id: 'payout_3',
        eventId: 'evt_1',
        vendorId: 'vendor_3',
        payoutType: 'REVENUE_SHARE' as const,
        grossAmount: 250.00,
        platformFee: 25.00,
        processingFee: 7.50,
        taxWithheld: 0.00,
        netAmount: 217.50,
        periodStart: '2024-02-01T00:00:00Z',
        periodEnd: '2024-02-29T23:59:59Z',
        status: 'APPROVED' as const,
        requestedAt: '2024-02-20T11:00:00Z',
        approvedAt: '2024-02-20T11:30:00Z',
        approvedBy: 'admin_1',
        processedAt: undefined,
        completedAt: undefined,
        paymentMethod: 'STRIPE_CONNECT' as const,
        bankAccount: '****5678',
        paymentReference: undefined,
        stripeTransferId: undefined,
        stripeAccountId: 'acct_456789123',
        failureReason: undefined,
        notes: 'Revenue share for February event - approved',
        createdAt: '2024-02-20T11:00:00Z',
        updatedAt: '2024-02-20T11:30:00Z',
        vendor: { name: 'Fresh Farm Produce', email: 'farm@example.com' }
      }
    ];
    setPayouts(mockPayouts);

    // Mock layout data
    const mockLayoutData = {
      layoutMode: 'grid' as 'grid' | 'image-overlay',
      floorPlanImage: undefined,
      gridRows: 5,
      gridColumns: 8,
      stallStatus: {
        5: { status: 'stall', zone: 'zone-a', size: '10x10' },
        12: { status: 'stall', zone: 'zone-a', size: '5x5' },
        18: { status: 'stall', zone: 'zone-b', size: '15x15' },
        25: { status: 'stall', zone: 'zone-b', size: '10x10' },
        31: { status: 'stall', zone: 'zone-c', size: '10x15' },
        38: { status: 'stall', zone: 'zone-c', size: '10x10' },
      },
      vendorAssignments: {
        5: { type: 'Baker', name: 'Sweet Treats Bakery', size: '10x10' },
        12: { type: 'Honey', name: 'Golden Honey Co.', size: '5x5' },
        18: { type: 'Vegetables', name: 'Fresh Farm Produce', size: '15x15' },
        25: { type: 'Vegetables', name: 'Organic Greens', size: '10x10' },
        31: { type: 'Baker', name: 'Artisan Bread Co.', size: '10x15' },
        38: { type: 'Vegetables', name: 'Local Garden', size: '10x10' },
      }
    };
    setLayoutData(mockLayoutData);
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
      categories: [] as any, // Default empty since we removed the field
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
      categories: (editingEvent as any).categories || [], // Keep existing categories since we removed the field
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

  const handleDeleteEvent = (event: EventType) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEventsList(prev => prev.filter(e => e.id !== event.id));
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

  // Promotion handler functions
  const handleCreatePromotion = (promotionData: any) => {
    const newPromotion: Promotion = {
      id: `promo_${Date.now()}`,
      eventId: selectedEventForDetails?.id || 'evt_1',
      currentUses: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...promotionData
    };
    setPromotions(prev => [...prev, newPromotion]);
    console.log('Creating promotion:', promotionData);
    // TODO: Implement API call
  };

  const handleUpdatePromotion = (promotionId: string, updates: any) => {
    setPromotions(prev => prev.map(p => 
      p.id === promotionId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
    console.log('Updating promotion:', promotionId, updates);
    // TODO: Implement API call
  };

  const handleDeletePromotion = (promotionId: string) => {
    setPromotions(prev => prev.filter(p => p.id !== promotionId));
    console.log('Deleting promotion:', promotionId);
    // TODO: Implement API call
  };

  const handleTogglePromotion = (promotionId: string) => {
    setPromotions(prev => prev.map(p => 
      p.id === promotionId ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() } : p
    ));
    console.log('Toggling promotion:', promotionId);
    // TODO: Implement API call
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
  };

  const handleStartCheckout = (stalls: Stall[]) => {
    setSelectedStalls(stalls);
    setShowCheckout(true);
  };

  // Event details and social sharing handlers
  const handleViewEventDetails = (event: EventType) => {
    setSelectedEventForDetails(event);
    setShowEventDetails(true);
    // Stay in events tab to show event details
  };

  const handleSocialShare = (event: EventType, platform: string) => {
    const eventUrl = `${window.location.origin}/events/${event.slug || event.id}`;
    const eventTitle = event.title;
    const eventDescription = event.description;
    
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(eventUrl);
    const encodedTitle = encodeURIComponent(eventTitle);
    const encodedDescription = encodeURIComponent(eventDescription);
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard
        navigator.clipboard.writeText(`Check out this event: ${eventTitle} - ${eventUrl}`);
        alert('Event link copied to clipboard! Paste it in your Instagram story or post.');
        return;
      case 'copy':
        navigator.clipboard.writeText(eventUrl);
        alert('Event link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Layout and stall management handlers
  const handleLayoutUpdate = (data: any) => {
    setLayoutData(prev => ({ ...prev, ...data }));
    // TODO: Save to API
    console.log('Layout updated:', data);
  };

  const handleEditAssignment = (stallIndex: number, vendor: any) => {
    console.log('Edit assignment:', stallIndex, vendor);
    // TODO: Open edit modal
  };

  const handleRemoveAssignment = (stallIndex: number) => {
    setLayoutData(prev => {
      const newVendorAssignments = { ...prev.vendorAssignments };
      const newStallStatus = { ...prev.stallStatus };
      
      // Remove vendor assignment and change stall to available
      delete newVendorAssignments[stallIndex];
      newStallStatus[stallIndex] = { status: 'available', zone: 'zone-a', size: '10x10' };
      
      return {
        ...prev,
        vendorAssignments: newVendorAssignments,
        stallStatus: newStallStatus
      };
    });
    console.log('Removed assignment for stall:', stallIndex);
  };

  // Rating handlers
  const handleRatingSubmit = (ratingSubmission: any) => {
    setEventRatings(prev => [...prev, ratingSubmission]);
    console.log('New rating submitted:', ratingSubmission);
    // TODO: Submit to API
  };

  // Check-in handlers
  const handleStartSession = (sessionData: any) => {
    const newSession = {
      id: `session_${Date.now()}`,
      eventId: 'evt_1',
      name: sessionData.name || 'Check-in Session',
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      endTime: null,
      staffCount: sessionData.staffCount || 1,
      location: sessionData.location || 'Main Entrance'
    };
    setCheckinSession(newSession);
    console.log('Started check-in session:', newSession);
  };

  const handleEndSession = () => {
    if (checkinSession) {
      setCheckinSession((prev: any) => ({
        ...prev,
        status: 'ENDED',
        endTime: new Date().toISOString()
      }));
      console.log('Ended check-in session');
    }
  };

  const handlePauseSession = () => {
    if (checkinSession) {
      setCheckinSession((prev: any) => ({
        ...prev,
        status: 'PAUSED'
      }));
      console.log('Paused check-in session');
    }
  };

  const handleResumeSession = () => {
    if (checkinSession) {
      setCheckinSession((prev: any) => ({
        ...prev,
        status: 'ACTIVE'
      }));
      console.log('Resumed check-in session');
    }
  };

  const handleCreateIncident = (incidentData: any) => {
    const newIncident = {
      id: `incident_${Date.now()}`,
      eventId: 'evt_1',
      sessionId: checkinSession?.id,
      incidentType: incidentData.incidentType || 'TECHNICAL',
      severity: incidentData.severity || 'MEDIUM',
      status: 'OPEN',
      description: incidentData.description || '',
      reportedBy: 'current_user',
      reportedAt: new Date().toISOString(),
      assignedTo: null,
      resolvedAt: null,
      resolution: null
    };
    setIncidents(prev => [...prev, newIncident]);
    console.log('Created incident:', newIncident);
  };

  const handleUpdateIncident = (incidentId: string, updates: any) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, ...updates }
          : incident
      )
    );
    console.log('Updated incident:', incidentId, updates);
  };

  const handleAssignIncident = (incidentId: string, assigneeId: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, assignedTo: assigneeId, status: 'ASSIGNED' }
          : incident
      )
    );
    console.log('Assigned incident:', incidentId, 'to', assigneeId);
  };

  const handleResolveIncident = (incidentId: string, resolution: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: 'RESOLVED',
              resolution,
              resolvedAt: new Date().toISOString()
            }
          : incident
      )
    );
    console.log('Resolved incident:', incidentId, 'with resolution:', resolution);
  };

  // Analytics calculation function
  const calculateAnalyticsMetrics = () => {
    const baseMetrics = {
      totalRevenue: 12450,
      vendorOccupancy: 85,
      avgOrderValue: 366,
      conversionRate: 68,
      promotionEffectiveness: 43,
      vendorDiversity: 5,
      earlyBirdSales: 23,
      groupDiscounts: 12,
      refundRate: 2.1,
      customerSatisfaction: 4.8
    };

    // Adjust metrics based on date range
    const dateMultipliers = {
      '7d': 0.2,
      '30d': 1.0,
      '90d': 2.8,
      '1y': 8.5,
      'all': 12.0
    };

    const multiplier = dateMultipliers[analyticsDateRange];
    
    return {
      totalRevenue: Math.round(baseMetrics.totalRevenue * multiplier),
      vendorOccupancy: Math.round(baseMetrics.vendorOccupancy + (Math.random() - 0.5) * 10),
      avgOrderValue: Math.round(baseMetrics.avgOrderValue + (Math.random() - 0.5) * 50),
      conversionRate: Math.round(baseMetrics.conversionRate + (Math.random() - 0.5) * 15),
      promotionEffectiveness: Math.round(baseMetrics.promotionEffectiveness * multiplier),
      vendorDiversity: Math.round(baseMetrics.vendorDiversity + (Math.random() - 0.5) * 2),
      earlyBirdSales: Math.round(baseMetrics.earlyBirdSales * multiplier),
      groupDiscounts: Math.round(baseMetrics.groupDiscounts * multiplier),
      refundRate: baseMetrics.refundRate + (Math.random() - 0.5) * 1,
      customerSatisfaction: baseMetrics.customerSatisfaction + (Math.random() - 0.5) * 0.5
    };
  };

  // Refunds and payouts handlers
  const handleCreateRefund = (refundData: any) => {
    const now = new Date().toISOString();
    const newRefund = {
      id: `refund_${Date.now()}`,
      eventId: 'evt_1',
      orderId: refundData.orderId || `order_${Date.now()}`,
      customerId: refundData.customerId || 'customer_1',
      refundType: (refundData.refundType || 'FULL') as 'FULL' | 'PARTIAL' | 'CREDIT' | 'EXCHANGE',
      requestedAmount: refundData.requestedAmount || 0,
      approvedAmount: undefined,
      processedAmount: undefined,
      reason: refundData.reason || '',
      category: (refundData.category || 'CUSTOMER_REQUEST') as 'CUSTOMER_REQUEST' | 'EVENT_CANCELLATION' | 'VENDOR_ISSUE' | 'TECHNICAL_PROBLEM' | 'POLICY_APPLICATION' | 'DISPUTE_RESOLUTION' | 'OTHER',
      description: refundData.description || '',
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'FAILED',
      requestedAt: now,
      reviewedAt: undefined,
      reviewedBy: undefined,
      processedAt: undefined,
      processedBy: undefined,
      refundMethod: 'ORIGINAL_PAYMENT' as 'ORIGINAL_PAYMENT' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_ACCOUNT' | 'PAYPAL' | 'OTHER',
      refundTo: undefined,
      policyApplied: undefined,
      termsAccepted: true,
      termsAcceptedAt: now,
      supportingDocs: [],
      notes: undefined,
      stripeRefundId: undefined,
      stripeChargeId: undefined,
      createdAt: now,
      updatedAt: now,
      order: { id: refundData.orderId || `order_${Date.now()}`, total: refundData.requestedAmount || 0 },
      customer: { id: refundData.customerId || 'customer_1', name: refundData.customerName || 'Customer Name', email: refundData.customerEmail || 'customer@example.com' },
      reviewer: undefined,
      processor: undefined,
      vendorId: refundData.vendorId || 'vendor_1',
      vendorName: refundData.vendorName || 'Vendor Name'
    };
    setRefunds(prev => [...prev, newRefund]);
    console.log('Created refund:', newRefund);
  };

  const handleProcessRefund = (refundId: string, updates: any) => {
    setRefunds(prev => 
      prev.map(refund => 
        refund.id === refundId 
          ? { ...refund, ...updates, processedAt: new Date().toISOString(), processedBy: 'current_user' }
          : refund
      )
    );
    console.log('Processed refund:', refundId, updates);
  };

  const handleRejectRefund = (refundId: string, reason: string) => {
    setRefunds(prev => 
      prev.map(refund => 
        refund.id === refundId 
          ? { 
              ...refund, 
              status: 'REJECTED',
              processedAt: new Date().toISOString(),
              processedBy: 'current_user',
              reason: `${refund.reason} - Rejection: ${reason}`
            }
          : refund
      )
    );
    console.log('Rejected refund:', refundId, 'reason:', reason);
  };

  const handleApproveRefund = (refundId: string, amount: number) => {
    setRefunds(prev => 
      prev.map(refund => 
        refund.id === refundId 
          ? { 
              ...refund, 
              status: 'APPROVED',
              approvedAmount: amount,
              processedAt: new Date().toISOString(),
              processedBy: 'current_user'
            }
          : refund
      )
    );
    console.log('Approved refund:', refundId, 'amount:', amount);
  };

  const handleCreatePayout = (payoutData: any) => {
    const now = new Date().toISOString();
    const newPayout = {
      id: `payout_${Date.now()}`,
      eventId: 'evt_1',
      vendorId: payoutData.vendorId || 'vendor_1',
      payoutType: (payoutData.payoutType || 'REVENUE_SHARE') as 'REVENUE_SHARE' | 'COMMISSION' | 'FIXED_FEE' | 'BONUS' | 'ADJUSTMENT',
      grossAmount: payoutData.grossAmount || 0,
      platformFee: payoutData.platformFee || 0,
      processingFee: payoutData.processingFee || 0,
      taxWithheld: payoutData.taxWithheld || 0,
      netAmount: payoutData.netAmount || 0,
      periodStart: payoutData.periodStart || now,
      periodEnd: payoutData.periodEnd || now,
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED',
      requestedAt: now,
      approvedAt: undefined,
      approvedBy: undefined,
      processedAt: undefined,
      completedAt: undefined,
      paymentMethod: 'STRIPE_CONNECT' as 'BANK_TRANSFER' | 'STRIPE_CONNECT' | 'PAYPAL' | 'CHECK' | 'WIRE_TRANSFER' | 'OTHER',
      bankAccount: undefined,
      paymentReference: undefined,
      stripeTransferId: undefined,
      stripeAccountId: undefined,
      failureReason: undefined,
      notes: payoutData.notes || '',
      createdAt: now,
      updatedAt: now,
      vendor: { 
        name: payoutData.vendorName || 'Vendor Name',
        email: payoutData.vendorEmail || 'vendor@example.com'
      }
    };
    setPayouts(prev => [...prev, newPayout]);
    console.log('Created payout:', newPayout);
  };

  const handleApprovePayout = (payoutId: string) => {
    setPayouts(prev => 
      prev.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'APPROVED' }
          : payout
      )
    );
    console.log('Approved payout:', payoutId);
  };

  const handleProcessPayout = (payoutId: string) => {
    setPayouts(prev => 
      prev.map(payout => 
        payout.id === payoutId 
          ? { 
              ...payout, 
              status: 'PROCESSED',
              processedDate: new Date().toISOString(),
              transactionId: `txn_${Date.now()}`
            }
          : payout
      )
    );
    console.log('Processed payout:', payoutId);
  };

  const handleRejectPayout = (payoutId: string, reason: string) => {
    setPayouts(prev => 
      prev.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'REJECTED' }
          : payout
      )
    );
    console.log('Rejected payout:', payoutId, 'reason:', reason);
  };

  // AI Layout Optimizer handlers
  const handleApplyAISuggestion = (suggestion: any) => {
    console.log('Applying AI suggestion:', suggestion);
    
    // Apply the suggestion to the layout data
    switch (suggestion.id) {
      case 'missing-exits':
        // Add exit points to the layout
        setLayoutData(prev => {
          const newStallStatus = { ...prev.stallStatus };
          // Add exits at strategic locations
          newStallStatus[0] = { status: 'exit', zone: 'zone-a', size: '10x10' };
          newStallStatus[prev.gridColumns - 1] = { status: 'exit', zone: 'zone-c', size: '10x10' };
          return { ...prev, stallStatus: newStallStatus };
        });
        break;
      
      case 'traffic-flow':
        // Add walking paths
        setLayoutData(prev => {
          const newStallStatus = { ...prev.stallStatus };
          // Add a central walking path
          const centerColumn = Math.floor(prev.gridColumns / 2);
          for (let i = 0; i < prev.gridRows; i++) {
            const index = i * prev.gridColumns + centerColumn;
            if (newStallStatus[index]?.status !== 'stall') {
              newStallStatus[index] = { status: 'walking-path', zone: 'zone-b', size: '10x10' };
            }
          }
          return { ...prev, stallStatus: newStallStatus };
        });
        break;
      
      case 'zone-balance':
        // This would require more complex logic to redistribute vendors
        alert('Zone balancing suggestion noted. Manual redistribution recommended.');
        break;
      
      default:
        console.log('Unknown suggestion type:', suggestion.id);
    }
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <button 
                    onClick={() => setActiveTab('events')} 
                    className="text-brand-green hover:text-brand-green/80 text-sm"
                  >
                    View all →
                  </button>
                </div>
                
                {/* Event Visibility Notice */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 text-sm">
                      ℹ️ <strong>Event Visibility:</strong> All published events are automatically visible to local vendors and customers. They can browse, register, and purchase tickets through the public marketplace.
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {eventsList.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={event.coverImage || event.imageUrl || '/images/placeholder-event.jpg'} alt={event.title} className="w-16 h-16 rounded object-cover" />
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()} • {event.address}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{event.applicationCount || 0}/{event.capacity} vendors</span>
                            <span className="text-sm font-medium">${(event.applicationCount || 0) * 50}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(event.status || 'draft')}`}>
                          {event.status}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditEvent(event)}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="Edit event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDuplicateEvent(event)}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="Duplicate event"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="View public page"
                          >
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
              {!showEventDetails ? (
                // Events List View
                <>
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
                      onViewDetails={handleViewEventDetails}
                      onSocialShare={handleSocialShare}
                    />
                  </div>
                </>
              ) : (
                // Event Detail View
                <>
                  {/* Event Detail Header */}
                  <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedEventForDetails?.title}</h2>
                        <p className="text-gray-600">Complete event management and sales overview</p>
                        {selectedEventForDetails && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="mr-4">📍 {selectedEventForDetails.venue}</span>
                            <span className="mr-4">📅 {new Date(selectedEventForDetails.startDate).toLocaleDateString()}</span>
                            <span>👥 {selectedEventForDetails.capacity} capacity</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedEventForDetails(null);
                            setShowEventDetails(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Events
                        </button>
                        <button
                          onClick={() => handleEditEvent(selectedEventForDetails!)}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Event
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Event Sales Summary */}
                  <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Sales Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-brand-green mb-2">
                          {orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Sold Seats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-400 mb-2">
                          {(selectedEventForDetails?.capacity || 0) - orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Available Seats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Math.round((orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0) / (selectedEventForDetails?.capacity || 1)) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Fill Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          ${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Sales Progress</span>
                        <span>{orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0)} / {selectedEventForDetails?.capacity || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-green h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0) / (selectedEventForDetails?.capacity || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Event Management Tabs */}
                  <div className="bg-brand-cream border border-gray-300 rounded-lg overflow-hidden shadow-md">
                    <div className="flex overflow-x-auto">
                      {[
                        { id: 'promotions', label: 'Promotions & Orders', icon: DollarSign },
                        { id: 'stalls', label: 'Stalls & Layout', icon: Grid },
                        { id: 'messaging', label: 'Vendor Messages', icon: MessageCircle },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setSalesActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                              salesActiveTab === tab.id
                                ? 'border-b-2 border-brand-green text-brand-green bg-brand-green/5'
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

                  {/* Event Management Content */}
                  <div className="space-y-6">
                    {salesActiveTab === 'promotions' && (
                      <>
                        <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                          <PromotionsManager
                            promotions={promotions}
                            onCreatePromotion={handleCreatePromotion}
                            onUpdatePromotion={handleUpdatePromotion}
                            onDeletePromotion={handleDeletePromotion}
                            onTogglePromotion={handleTogglePromotion}
                          />
                        </div>
                        <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                          <OrdersManager
                            orders={orders}
                            onRefresh={handleRefreshOrders}
                            onViewOrder={handleViewOrder}
                            onExportOrders={handleExportOrders}
                          />
                        </div>
                      </>
                    )}

                    {salesActiveTab === 'stalls' && (
                      <div className="space-y-6">
                        <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">Stalls & Layout Management</h3>
                              <p className="text-sm text-gray-600">Design your event layout and manage vendor assignments</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {Object.keys(layoutData.stallStatus).filter(index => layoutData.stallStatus[parseInt(index)]?.status === 'stall').length} stalls sold
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">
                                {Object.keys(layoutData.vendorAssignments).length} vendors assigned
                              </span>
                            </div>
                          </div>

                          {/* Layout Wizard */}
                          <LayoutWizard
                            eventId={selectedEventForDetails?.id || ''}
                            eventTitle={selectedEventForDetails?.title || ''}
                            floorPlanImage={layoutData.floorPlanImage}
                            layoutMode={layoutData.layoutMode}
                            gridRows={layoutData.gridRows}
                            gridColumns={layoutData.gridColumns}
                            stallStatus={layoutData.stallStatus}
                            vendorAssignments={layoutData.vendorAssignments}
                            onUpdate={handleLayoutUpdate}
                          />
                        </div>

                        {/* AI Layout Optimizer */}
                        <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                          <AILayoutOptimizer
                            stallStatus={layoutData.stallStatus}
                            vendorAssignments={layoutData.vendorAssignments}
                            gridRows={layoutData.gridRows}
                            gridColumns={layoutData.gridColumns}
                            onApplySuggestion={handleApplyAISuggestion}
                          />
                        </div>

                        {/* Stall Assignments */}
                        <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900">Stall Assignments</h4>
                            <p className="text-sm text-gray-600">Manage vendor assignments to specific stalls</p>
                          </div>
                          <StallAssignments
                            stallStatus={layoutData.stallStatus}
                            vendorAssignments={layoutData.vendorAssignments}
                            onEditAssignment={handleEditAssignment}
                            onRemoveAssignment={handleRemoveAssignment}
                          />
                        </div>
                      </div>
                    )}

                    {salesActiveTab === 'messaging' && (
                      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Vendor Messages</h3>
                          <p className="text-sm text-gray-600">Communicate with vendors about their event participation</p>
                        </div>
                        <div className="space-y-4">
                          {[
                            { id: 1, vendor: 'Sweet Treats Bakery', message: 'Hi! I wanted to confirm my stall assignment for the event.', time: '2 hours ago', unread: true },
                            { id: 2, vendor: 'Golden Honey Co.', message: 'Can I get more information about the setup time?', time: '4 hours ago', unread: true },
                            { id: 3, vendor: 'Fresh Farm Produce', message: 'Thank you for the event details!', time: '1 day ago', unread: false },
                          ].map((msg) => (
                            <div key={msg.id} className={`p-4 border rounded-lg ${msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{msg.vendor}</span>
                                    {msg.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                                  </div>
                                  <p className="text-gray-600 text-sm">{msg.message}</p>
                                </div>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {salesActiveTab === 'analytics' && (
                      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Event Analytics</h3>
                          <p className="text-sm text-gray-600">Track performance metrics and insights for your event</p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {/* 1. Revenue Metrics */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                              </div>
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h4>
                            <p className="text-2xl font-bold text-gray-900">$12,450</p>
                            <p className="text-xs text-gray-500 mt-1">vs $11,080 last event</p>
                          </div>

                          {/* 2. Vendor Occupancy */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">85%</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Vendor Occupancy</h4>
                            <p className="text-2xl font-bold text-gray-900">34/40</p>
                            <p className="text-xs text-gray-500 mt-1">stalls occupied</p>
                          </div>

                          {/* 3. Average Order Value */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                              </div>
                              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">$366</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</h4>
                            <p className="text-2xl font-bold text-gray-900">$366</p>
                            <p className="text-xs text-gray-500 mt-1">per vendor registration</p>
                          </div>

                          {/* 4. Conversion Rate */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Target className="w-6 h-6 text-orange-600" />
                              </div>
                              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">68%</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</h4>
                            <p className="text-2xl font-bold text-gray-900">68%</p>
                            <p className="text-xs text-gray-500 mt-1">visitors to vendors</p>
                          </div>

                          {/* 5. Promotion Effectiveness */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <Tag className="w-6 h-6 text-red-600" />
                              </div>
                              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">43</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Promo Code Uses</h4>
                            <p className="text-2xl font-bold text-gray-900">43</p>
                            <p className="text-xs text-gray-500 mt-1">total redemptions</p>
                          </div>

                          {/* 6. Vendor Diversity */}
                          <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                <Grid className="w-6 h-6 text-indigo-600" />
                              </div>
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">5</span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Vendor Types</h4>
                            <p className="text-2xl font-bold text-gray-900">5</p>
                            <p className="text-xs text-gray-500 mt-1">categories represented</p>
                          </div>
                        </div>

                        {/* Secondary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          {/* 7. Early Bird Sales */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Early Bird</p>
                                <p className="text-lg font-bold text-gray-900">23</p>
                              </div>
                            </div>
                          </div>

                          {/* 8. Group Discounts */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-pink-100 rounded-lg">
                                <Users className="w-4 h-4 text-pink-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Group Sales</p>
                                <p className="text-lg font-bold text-gray-900">12</p>
                              </div>
                            </div>
                          </div>

                          {/* 9. Refund Rate */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <ArrowDownRight className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                                <p className="text-lg font-bold text-gray-900">2.1%</p>
                              </div>
                            </div>
                          </div>

                          {/* 10. Customer Satisfaction */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <Star className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                                <div className="flex items-center gap-2">
                                  <CompactStarRating rating={eventRatings.length > 0 ? eventRatings.reduce((sum, r) => sum + r.overallRating, 0) / eventRatings.length : 0} showNumber={true} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vendor Type Breakdown */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendor Type Distribution</h4>
                          <div className="space-y-3">
                            {[
                              { type: 'Baker', count: 12, percentage: 35, color: 'bg-orange-500' },
                              { type: 'Vegetables', count: 10, percentage: 29, color: 'bg-green-500' },
                              { type: 'Honey', count: 5, percentage: 15, color: 'bg-yellow-500' },
                              { type: 'Artisan', count: 4, percentage: 12, color: 'bg-purple-500' },
                              { type: 'Crafts', count: 3, percentage: 9, color: 'bg-blue-500' },
                            ].map((vendorType) => (
                              <div key={vendorType.type} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${vendorType.color}`}></div>
                                  <span className="text-sm font-medium text-gray-700">{vendorType.type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${vendorType.color}`}
                                      style={{ width: `${vendorType.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-8">{vendorType.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rating Collection */}
                        <div className="mb-6">
                          <RatingCollection
                            eventId={selectedEventForDetails?.id || 'evt_1'}
                            eventTitle={selectedEventForDetails?.title || 'Event'}
                            onRatingSubmit={handleRatingSubmit}
                          />
                        </div>

                        {/* Rating Summary */}
                        {eventRatings.length > 0 && (
                          <div className="mb-6">
                            <RatingSummary
                              ratings={eventRatings}
                              eventTitle={selectedEventForDetails?.title || 'Event'}
                            />
                          </div>
                        )}

                        {/* Rating Breakdown */}
                        {eventRatings.length > 0 && (
                          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
                            <RatingBreakdown
                              ratings={[
                                { rating: 5, count: eventRatings.filter(r => Math.floor(r.overallRating) === 5).length, label: 'Excellent' },
                                { rating: 4, count: eventRatings.filter(r => Math.floor(r.overallRating) === 4).length, label: 'Good' },
                                { rating: 3, count: eventRatings.filter(r => Math.floor(r.overallRating) === 3).length, label: 'Average' },
                                { rating: 2, count: eventRatings.filter(r => Math.floor(r.overallRating) === 2).length, label: 'Poor' },
                                { rating: 1, count: eventRatings.filter(r => Math.floor(r.overallRating) === 1).length, label: 'Very Poor' },
                              ]}
                            />
                          </div>
                        )}

                        {/* Revenue Trend */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Timeline</h4>
                          <div className="flex items-end justify-between h-32 gap-2">
                            {[
                              { month: 'Jan', revenue: 1200, height: '20%' },
                              { month: 'Feb', revenue: 1800, height: '30%' },
                              { month: 'Mar', revenue: 3200, height: '53%' },
                              { month: 'Apr', revenue: 2800, height: '47%' },
                              { month: 'May', revenue: 3650, height: '61%' },
                              { month: 'Jun', revenue: 1200, height: '20%' },
                            ].map((item, index) => (
                              <div key={index} className="flex flex-col items-center gap-2">
                                <div 
                                  className="w-8 bg-brand-green rounded-t"
                                  style={{ height: item.height }}
                                ></div>
                                <span className="text-xs text-gray-600">{item.month}</span>
                                <span className="text-xs font-medium text-gray-900">${item.revenue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Check-in & Operations</h2>
                    <p className="text-gray-600">QR scanning, incident management, and offline operations</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('refunds')}
                    className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
                  >
                    Refunds & Payouts
                  </button>
                </div>

                {/* Check-in Manager */}
                <div className="mb-8">
                  <CheckinManager
                    session={checkinSession}
                    checkins={checkins}
                    incidents={incidents}
                    loading={checkinLoading}
                    onStartSession={handleStartSession}
                    onEndSession={handleEndSession}
                    onPauseSession={handlePauseSession}
                    onResumeSession={handleResumeSession}
                    onCreateIncident={handleCreateIncident}
                  />
                </div>

                {/* Incident Manager */}
                <div>
                  <IncidentManager
                    incidents={incidents}
                    loading={checkinLoading}
                    onCreateIncident={handleCreateIncident}
                    onUpdateIncident={handleUpdateIncident}
                    onAssignIncident={handleAssignIncident}
                    onResolveIncident={handleResolveIncident}
                  />
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Refunds & Payouts</h2>
                    <p className="text-gray-600">Process refunds, manage credits, and handle vendor payouts</p>
                  </div>
                  <Link href="/dashboard/event-coordinator/events/evt_1/analytics-communications">
                    <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                      Analytics & Communications
                    </button>
                  </Link>
                </div>

                {/* Refund Manager */}
                <div className="mb-8">
                  <RefundManager
                    refunds={refunds}
                    loading={refundsPayoutsLoading}
                    onCreateRefund={handleCreateRefund}
                    onProcessRefund={handleProcessRefund}
                    onRejectRefund={handleRejectRefund}
                    onApproveRefund={handleApproveRefund}
                  />
                </div>

                {/* Payout Manager */}
                <div>
                  <PayoutManager
                    payouts={payouts}
                    loading={refundsPayoutsLoading}
                    onCreatePayout={handleCreatePayout}
                    onApprovePayout={handleApprovePayout}
                    onProcessPayout={handleProcessPayout}
                    onRejectPayout={handleRejectPayout}
                  />
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-gray-600">Top 10 key metrics and performance insights</p>
                  </div>
                </div>

                {/* Analytics Filters */}
                <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <select
                        value={analyticsDateRange}
                        onChange={(e) => setAnalyticsDateRange(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Select date range"
                      >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>

                    {/* Detail Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detail Level</label>
                      <select
                        value={analyticsDetailLevel}
                        onChange={(e) => setAnalyticsDetailLevel(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Select detail level"
                      >
                        <option value="summary">Summary View</option>
                        <option value="detailed">Detailed View</option>
                        <option value="comprehensive">Comprehensive View</option>
                      </select>
                    </div>

                    {/* Event Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Filter</label>
                      <select
                        value={selectedEventForAnalytics}
                        onChange={(e) => setSelectedEventForAnalytics(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Select event"
                      >
                        <option value="all">All Events</option>
                        {eventsList.map((event) => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* 1. Revenue Metrics */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h4>
                    <p className="text-2xl font-bold text-gray-900">${calculateAnalyticsMetrics().totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                  </div>

                  {/* 2. Vendor Occupancy */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{calculateAnalyticsMetrics().vendorOccupancy}%</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Vendor Occupancy</h4>
                    <p className="text-2xl font-bold text-gray-900">{calculateAnalyticsMetrics().vendorOccupancy}%</p>
                    <p className="text-xs text-gray-500 mt-1">stalls occupied</p>
                  </div>

                  {/* 3. Average Order Value */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">${calculateAnalyticsMetrics().avgOrderValue}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</h4>
                    <p className="text-2xl font-bold text-gray-900">${calculateAnalyticsMetrics().avgOrderValue}</p>
                    <p className="text-xs text-gray-500 mt-1">per vendor registration</p>
                  </div>

                  {/* 4. Conversion Rate */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{calculateAnalyticsMetrics().conversionRate}%</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</h4>
                    <p className="text-2xl font-bold text-gray-900">{calculateAnalyticsMetrics().conversionRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">visitors to vendors</p>
                  </div>

                  {/* 5. Promotion Effectiveness */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Tag className="w-6 h-6 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">{calculateAnalyticsMetrics().promotionEffectiveness}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Promo Code Uses</h4>
                    <p className="text-2xl font-bold text-gray-900">{calculateAnalyticsMetrics().promotionEffectiveness}</p>
                    <p className="text-xs text-gray-500 mt-1">total redemptions</p>
                  </div>

                  {/* 6. Vendor Diversity */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Grid className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{calculateAnalyticsMetrics().vendorDiversity}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Vendor Types</h4>
                    <p className="text-2xl font-bold text-gray-900">{calculateAnalyticsMetrics().vendorDiversity}</p>
                    <p className="text-xs text-gray-500 mt-1">categories represented</p>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* 7. Early Bird Sales */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Early Bird</p>
                        <p className="text-lg font-bold text-gray-900">{calculateAnalyticsMetrics().earlyBirdSales}</p>
                      </div>
                    </div>
                  </div>

                  {/* 8. Group Discounts */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Users className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Group Sales</p>
                        <p className="text-lg font-bold text-gray-900">{calculateAnalyticsMetrics().groupDiscounts}</p>
                      </div>
                    </div>
                  </div>

                  {/* 9. Refund Rate */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ArrowDownRight className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                        <p className="text-lg font-bold text-gray-900">{calculateAnalyticsMetrics().refundRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* 10. Customer Satisfaction */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Star className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                        <div className="flex items-center gap-2">
                          <CompactStarRating rating={eventRatings.length > 0 ? eventRatings.reduce((sum, r) => sum + r.overallRating, 0) / eventRatings.length : 0} showNumber={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed View Content */}
                {analyticsDetailLevel !== 'summary' && (
                  <>
                    {/* Rating Collection */}
                    <div className="mb-6">
                      <RatingCollection
                        eventId={selectedEventForDetails?.id || 'evt_1'}
                        eventTitle={selectedEventForDetails?.title || 'Event'}
                        onRatingSubmit={handleRatingSubmit}
                      />
                    </div>

                    {/* Rating Summary */}
                    {eventRatings.length > 0 && (
                      <div className="mb-6">
                        <RatingSummary
                          ratings={eventRatings}
                          eventTitle={selectedEventForDetails?.title || 'Event'}
                        />
                      </div>
                    )}

                    {/* Rating Breakdown */}
                    {eventRatings.length > 0 && (
                      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
                        <RatingBreakdown
                          ratings={[
                            { rating: 5, count: eventRatings.filter(r => Math.floor(r.overallRating) === 5).length, label: 'Excellent' },
                            { rating: 4, count: eventRatings.filter(r => Math.floor(r.overallRating) === 4).length, label: 'Good' },
                            { rating: 3, count: eventRatings.filter(r => Math.floor(r.overallRating) === 3).length, label: 'Average' },
                            { rating: 2, count: eventRatings.filter(r => Math.floor(r.overallRating) === 2).length, label: 'Poor' },
                            { rating: 1, count: eventRatings.filter(r => Math.floor(r.overallRating) === 1).length, label: 'Very Poor' },
                          ]}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Comprehensive View Content */}
                {analyticsDetailLevel === 'comprehensive' && (
                  <>
                    {/* Vendor Type Distribution */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendor Type Distribution</h4>
                      <div className="space-y-3">
                        {[
                          { type: 'Baker', count: 12, percentage: 35, color: 'bg-orange-500' },
                          { type: 'Vegetables', count: 10, percentage: 29, color: 'bg-green-500' },
                          { type: 'Honey', count: 5, percentage: 15, color: 'bg-yellow-500' },
                          { type: 'Artisan', count: 4, percentage: 12, color: 'bg-purple-500' },
                          { type: 'Crafts', count: 3, percentage: 9, color: 'bg-blue-500' },
                        ].map((vendorType) => (
                          <div key={vendorType.type} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${vendorType.color}`}></div>
                              <span className="text-sm font-medium text-gray-700">{vendorType.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${vendorType.color}`}
                                  style={{ width: `${vendorType.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{vendorType.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Revenue Trend */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Timeline</h4>
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[
                          { month: 'Jan', revenue: 1200, height: '20%' },
                          { month: 'Feb', revenue: 1800, height: '30%' },
                          { month: 'Mar', revenue: 3200, height: '53%' },
                          { month: 'Apr', revenue: 2800, height: '47%' },
                          { month: 'May', revenue: 3650, height: '61%' },
                          { month: 'Jun', revenue: 1200, height: '20%' },
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <div 
                              className="w-8 bg-brand-green rounded-t"
                              style={{ height: item.height }}
                            ></div>
                            <span className="text-xs text-gray-600">{item.month}</span>
                            <span className="text-xs font-medium text-gray-900">${item.revenue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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

    {/* Checkout Modal */}
    {showCheckout && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <CheckoutForm
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
