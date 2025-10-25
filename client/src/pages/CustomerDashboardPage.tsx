'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '../contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  MapPin, Calendar, Clock, Users, Star, Heart, ShoppingBag, MessageCircle, 
  ExternalLink, Download, Upload, Settings, Bell, CheckCircle, AlertCircle,
  Camera, Video, ChevronLeft, ChevronRight, Play, Pause, ThumbsUp, Tag,
  Leaf, Award, TrendingUp, Eye, X, ChevronDown, ChevronUp, Plus, Minus,
  Star as StarFilled, MapPin as MapPinFilled, Calendar as CalendarFilled,
  Users as UsersFilled, ShoppingBag as ShoppingBagFilled, Camera as CameraFilled,
  Video as VideoFilled, MessageCircle as MessageCircleFilled, ExternalLink as ExternalLinkFilled,
  Download as DownloadFilled, Upload as UploadFilled, Settings as SettingsFilled,
  Bell as BellFilled, ThumbsUp as ThumbsUpFilled, Tag as TagFilled, Leaf as LeafFilled,
  Award as AwardFilled, TrendingUp as TrendingUpFilled, Eye as EyeFilled, Zap,
  Sparkles, Zap as ZapFilled, Sparkles as SparklesFilled, Gift, CreditCard,
  Package, Truck, Clock as ClockIcon, Truck as TruckIcon, Package as PackageIcon,
  Filter, Search, Grid, List, SortAsc, SortDesc, Share2, Copy, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  primaryZip: string;
  secondaryZips: string[];
  referralCode: string;
  referralCount: number;
  joinDate: string;
  // Contact Information
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneLandline?: string;
  phoneMobile?: string;
  // SMS Opt-in
  smsOptIn: boolean;
  smsOptInDate?: string;
  smsConsentText?: string;
  // Avatar Management
  avatarType: 'default' | 'uploaded' | 'social';
  uploadedAvatar?: string;
  socialAvatarUrl?: string;
  // Social Media Connections
  socialConnections: {
    google?: {
      connected: boolean;
      email?: string;
      profileImage?: string;
    };
    facebook?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    instagram?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    x?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    youtube?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    pinterest?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    whatsapp?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    nextdoor?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
    linkedin?: {
      connected: boolean;
      username?: string;
      profileImage?: string;
      shareProducts: boolean;
      shareDeals: boolean;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    marketing: boolean;
    defaultPickupMethod: 'pickup' | 'delivery';
  };
}


interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  date: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  eta?: string;
  reviewed: boolean;
}

interface Vendor {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  nextAvailability: string;
  distance: number;
  tags: string[];
  featured: boolean;
}

interface Message {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  category: 'order' | 'product' | 'pickup' | 'general';
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  rsvpStatus: 'going' | 'maybe' | 'not-going';
  favoriteVendorsAttending: string[];
  image: string;
  type: 'market' | 'festival' | 'workshop' | 'tasting' | 'popup' | 'seasonal';
  description: string;
  organizer: string;
  capacity?: number;
  registeredCount?: number;
}

// Enhanced Order interfaces for detailed orders functionality
interface DetailedProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface DetailedOrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: DetailedProduct;
}

interface Fulfillment {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  type: 'SHIPPING' | 'PICKUP' | 'DELIVERY';
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  notes: string | null;
}

interface ShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
}

interface DetailedOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: DetailedOrderItem[];
  fulfillment: Fulfillment | null;
  shippingAddress: ShippingAddress | null;
}

interface OrderHistoryResponse {
  orders: DetailedOrder[];
}

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'messages' | 'events' | 'settings'>('overview');

  const [showZIPManager, setShowZIPManager] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reorderQuantities, setReorderQuantities] = useState<{[key: string]: number}>({});

  // Enhanced orders state for detailed orders functionality
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<DetailedOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const ordersPerPage = 5;

  // Favorites filter state
  const [vendorTypeFilter, setVendorTypeFilter] = useState<string>('all');
  
  // Messages filter state
  const [messageFilter, setMessageFilter] = useState<string>('all');
  
  // Events filter state
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  // Settings state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [originalSettingsData, setOriginalSettingsData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState({
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    phoneLandline: '',
    phoneMobile: '',
    smsOptIn: false,
    avatarType: 'default' as 'default' | 'uploaded' | 'social',
    uploadedAvatar: '',
    socialAvatarUrl: '',
    selectedAvatarId: 'avatar1',
    selectedAvatarData: {
      id: 'avatar1', 
      name: 'Foodie', 
      emoji: '🍕', 
      bg: 'bg-gradient-to-br from-orange-400 to-red-500',
      style: 'transform rotate-3 hover:rotate-6 transition-transform duration-200'
    },
    socialConnections: {
      google: { connected: false, email: '', profileImage: '' },
      facebook: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      instagram: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      x: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      youtube: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      pinterest: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      whatsapp: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      nextdoor: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
      linkedin: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false }
    }
  });
  
  // Message management state
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [composeData, setComposeData] = useState({
    vendorId: '',
    subject: '',
    message: ''
  });

  // Fetch detailed orders data
  const { data: detailedOrdersData, isLoading: ordersLoading, error: ordersError } = useQuery<OrderHistoryResponse>({
    queryKey: ['orderHistory'],
    queryFn: async () => {
      const response = await axios.get('/api/orders/history');
      return response.data;
    },
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load order history. Please try again.');
    }
  });

  // Fetch customer profile data
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      const response = await axios.get('/api/customer/profile');
      return response.data;
    },
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load profile data.');
    }
  });

  // Fetch favorite vendors
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['customerFavorites'],
    queryFn: async () => {
      const response = await axios.get('/api/customer/favorites');
      return response.data;
    },
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load favorite vendors.');
    }
  });

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['customerMessages'],
    queryFn: async () => {
      const response = await axios.get('/api/customer/messages');
      return response.data;
    },
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load messages.');
    }
  });

  // Fetch upcoming events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['customerEvents'],
    queryFn: async () => {
      const response = await axios.get('/api/customer/events');
      return response.data;
    },
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load upcoming events.');
    }
  });

  // Helper functions for detailed orders
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'IN_PROGRESS':
        return { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'CANCELLED':
      case 'FAILED':
        return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const formatDetailedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateInvoicePDF = async (order: DetailedOrder) => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', 20, 30);
      
      // Company info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Craved Artisan', 20, 45);
      pdf.text('Local Artisan Marketplace', 20, 50);
      pdf.text('Atlanta, GA', 20, 55);
      
      // Invoice details
      pdf.text(`Invoice #: ${order.orderNumber}`, 140, 45);
      pdf.text(`Date: ${formatDetailedDate(order.createdAt)}`, 140, 50);
      pdf.text(`Status: ${order.fulfillment?.status || 'PENDING'}`, 140, 55);
      
      // Bill to
      if (order.shippingAddress) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bill To:', 20, 75);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 20, 85);
        pdf.text(order.shippingAddress.address1, 20, 90);
        if (order.shippingAddress.address2) {
          pdf.text(order.shippingAddress.address2, 20, 95);
        }
        pdf.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, 20, order.shippingAddress.address2 ? 100 : 95);
      }
      
      // Items table header
      let yPosition = 120;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Description', 20, yPosition);
      pdf.text('QTY', 120, yPosition);
      pdf.text('Price', 140, yPosition);
      pdf.text('Total', 170, yPosition);
      
      // Items
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      order.items.forEach((item) => {
        pdf.text(item.product.name, 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(`$${item.price.toFixed(2)}`, 140, yPosition);
        pdf.text(`$${item.total.toFixed(2)}`, 170, yPosition);
        yPosition += 7;
      });
      
      // Totals
      yPosition += 10;
      pdf.text(`Subtotal: $${order.subtotal.toFixed(2)}`, 140, yPosition);
      yPosition += 7;
      pdf.text(`Tax: $${order.tax.toFixed(2)}`, 140, yPosition);
      yPosition += 7;
      pdf.text(`Shipping: $${order.shipping.toFixed(2)}`, 140, yPosition);
      yPosition += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('TOTAL:', 140, yPosition);
      pdf.text(`$${order.total.toFixed(2)}`, 170, yPosition);
      
      // Save the PDF
      pdf.save(`invoice-${order.orderNumber}.pdf`);
      toast.success('Invoice downloaded successfully');
      
    } catch (error) {
      toast.error('Failed to generate invoice PDF. Please try again.');
    }
  };

  const openOrderModal = (order: DetailedOrder) => {
    setSelectedDetailedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedDetailedOrder(null);
  };

  // Message management functions
  const openMessageModal = (message: Message) => {
    setSelectedMessage(message);
    setIsMessageModalOpen(true);
    // Mark message as read when opened
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, unread: false } : m
    ));
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const openComposeModal = () => {
    setIsComposeModalOpen(true);
    setComposeData({ vendorId: '', subject: '', message: '' });
  };

  const closeComposeModal = () => {
    setIsComposeModalOpen(false);
    setComposeData({ vendorId: '', subject: '', message: '' });
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // In a real app, this would send to the backend
    // For now, show success message
    toast.success('Reply sent successfully');
    
    // Reset reply text
    setReplyText('');
    closeMessageModal();
  };

  const handleCompose = () => {
    if (!composeData.vendorId || !composeData.subject || !composeData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real app, this would send to the backend
    // For now, show success message
    toast.success('Message sent successfully');
    
    closeComposeModal();
  };

  const toggleMessageRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, unread: !m.unread } : m
    ));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      closeMessageModal();
    }
  };

  // Event management functions
  const updateEventRSVP = (eventId: string, newStatus: 'going' | 'maybe' | 'not-going') => {
    setUpcomingEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, rsvpStatus: newStatus } : event
    ));
  };

  // Settings management functions
  const handleSMSOptIn = (optIn: boolean) => {
    if (optIn && !settingsData.phoneMobile) {
      alert('Mobile phone number is required for SMS notifications.');
      return;
    }
    
    setSettingsData(prev => ({
      ...prev,
      smsOptIn: optIn,
      smsOptInDate: optIn ? new Date().toISOString() : undefined,
      smsConsentText: optIn ? 'I consent to receive SMS messages from Craved Artisan regarding my orders, deliveries, and promotional offers. Message and data rates may apply. Reply STOP to opt out.' : undefined
    }));
    setHasUnsavedChanges(true);
  };

  const connectSocialMedia = (platform: 'google' | 'facebook' | 'instagram' | 'x' | 'youtube' | 'pinterest' | 'whatsapp' | 'nextdoor' | 'linkedin') => {
    // Define OAuth URLs for each platform
    const oauthUrls = {
      google: {
        url: 'https://accounts.google.com/oauth/authorize',
        params: new URLSearchParams({
          client_id: 'your-google-client-id', // Replace with actual client ID
          redirect_uri: `${window.location.origin}/auth/google/callback`,
          scope: 'profile email',
          response_type: 'code',
          access_type: 'offline',
          prompt: 'consent'
        })
      },
      facebook: {
        url: 'https://www.facebook.com/v18.0/dialog/oauth',
        params: new URLSearchParams({
          client_id: 'your-facebook-app-id', // Replace with actual app ID
          redirect_uri: `${window.location.origin}/auth/facebook/callback`,
          scope: 'email,public_profile',
          response_type: 'code',
          state: 'facebook_connect'
        })
      },
      instagram: {
        url: 'https://api.instagram.com/oauth/authorize',
        params: new URLSearchParams({
          client_id: 'your-instagram-app-id', // Replace with actual app ID
          redirect_uri: `${window.location.origin}/auth/instagram/callback`,
          scope: 'user_profile,user_media',
          response_type: 'code',
          state: 'instagram_connect'
        })
      },
      x: {
        url: 'https://twitter.com/i/oauth2/authorize',
        params: new URLSearchParams({
          client_id: 'your-x-client-id', // Replace with actual client ID
          redirect_uri: `${window.location.origin}/auth/x/callback`,
          scope: 'tweet.read users.read',
          response_type: 'code',
          code_challenge: 'challenge', // In production, use PKCE
          code_challenge_method: 'plain',
          state: 'x_connect'
        })
      },
      youtube: {
        url: 'https://accounts.google.com/oauth/authorize',
        params: new URLSearchParams({
          client_id: 'your-youtube-client-id', // Replace with actual client ID
          redirect_uri: `${window.location.origin}/auth/youtube/callback`,
          scope: 'https://www.googleapis.com/auth/youtube.readonly',
          response_type: 'code',
          access_type: 'offline',
          prompt: 'consent',
          state: 'youtube_connect'
        })
      },
      pinterest: {
        url: 'https://www.pinterest.com/oauth/',
        params: new URLSearchParams({
          client_id: 'your-pinterest-app-id', // Replace with actual app ID
          redirect_uri: `${window.location.origin}/auth/pinterest/callback`,
          scope: 'read_public',
          response_type: 'code',
          state: 'pinterest_connect'
        })
      },
      whatsapp: {
        url: 'https://www.facebook.com/v18.0/dialog/oauth',
        params: new URLSearchParams({
          client_id: 'your-whatsapp-business-app-id', // Replace with actual app ID
          redirect_uri: `${window.location.origin}/auth/whatsapp/callback`,
          scope: 'whatsapp_business_messaging',
          response_type: 'code',
          state: 'whatsapp_connect'
        })
      },
      nextdoor: {
        url: 'https://nextdoor.com/oauth/authorize',
        params: new URLSearchParams({
          client_id: 'your-nextdoor-client-id', // Replace with actual client ID
          redirect_uri: `${window.location.origin}/auth/nextdoor/callback`,
          scope: 'basic',
          response_type: 'code',
          state: 'nextdoor_connect'
        })
      },
      linkedin: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: new URLSearchParams({
          client_id: 'your-linkedin-client-id', // Replace with actual client ID
          redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
          scope: 'r_liteprofile r_emailaddress',
          response_type: 'code',
          state: 'linkedin_connect'
        })
      }
    };

    const { url, params } = oauthUrls[platform];
    const fullUrl = `${url}?${params.toString()}`;
    
    // Show confirmation dialog
    const confirmed = confirm(
      `This will redirect you to ${platform.charAt(0).toUpperCase() + platform.slice(1)} to connect your account. Continue?`
    );
    
    if (confirmed) {
      // In a real app, you'd redirect to the OAuth URL
      // For demo purposes, we'll simulate the connection
      toast.loading('Connecting to social media...', { duration: 1000 });
      
      // Simulate successful connection after a brief delay
      setTimeout(() => {
        setSettingsData(prev => ({
          ...prev,
          socialConnections: {
            ...prev.socialConnections,
            [platform]: {
              ...prev.socialConnections[platform],
              connected: true,
              username: platform === 'google' ? 'user@gmail.com' : `@user_${platform}`,
              profileImage: `https://via.placeholder.com/100x100/4285f4/ffffff?text=${platform.charAt(0).toUpperCase()}`
            }
          }
        }));
        setHasUnsavedChanges(true);
        
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully!`);
      }, 1000);
      
      // In production, uncomment this line to redirect to OAuth:
      // window.location.href = fullUrl;
    }
  };

  const disconnectSocialMedia = (platform: 'google' | 'facebook' | 'instagram' | 'x' | 'youtube' | 'pinterest' | 'whatsapp' | 'nextdoor' | 'linkedin') => {
    const confirmed = confirm(
      `Are you sure you want to disconnect your ${platform.charAt(0).toUpperCase() + platform.slice(1)} account?`
    );
    
    if (confirmed) {
      setSettingsData(prev => ({
        ...prev,
        socialConnections: {
          ...prev.socialConnections,
          [platform]: platform === 'google' 
            ? { connected: false, email: '', profileImage: '' }
            : {
                connected: false,
                username: '',
                profileImage: '',
                shareProducts: false,
                shareDeals: false
              }
        }
      }));
      setHasUnsavedChanges(true);
      
      // Show success message
      alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected successfully.`);
    }
  };

  // Avatar management functions
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
      setSettingsData(prev => ({
        ...prev,
        avatarType: 'uploaded',
        uploadedAvatar: result
      }));
      // Update customer avatar
      setCustomer(prev => prev ? {
        ...prev,
        avatar: result,
        avatarType: 'uploaded',
        uploadedAvatar: result
      } : null);
      setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectDefaultAvatar = (avatarId: string) => {
    const avatarData = [
      { 
        id: 'avatar1', 
        name: 'Foodie', 
        emoji: '🍕', 
        bg: 'bg-gradient-to-br from-orange-400 to-red-500',
        style: 'transform rotate-3 hover:rotate-6 transition-transform duration-200'
      },
      { 
        id: 'avatar2', 
        name: 'Chef', 
        emoji: '👨‍🍳', 
        bg: 'bg-gradient-to-br from-blue-400 to-purple-500',
        style: 'transform -rotate-2 hover:-rotate-4 transition-transform duration-200'
      },
      { 
        id: 'avatar3', 
        name: 'Baker', 
        emoji: '🥖', 
        bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        style: 'transform rotate-1 hover:rotate-3 transition-transform duration-200'
      },
      { 
        id: 'avatar4', 
        name: 'Farmer', 
        emoji: '🌱', 
        bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
        style: 'transform -rotate-1 hover:-rotate-2 transition-transform duration-200'
      },
      { 
        id: 'avatar5', 
        name: 'Shopper', 
        emoji: '🛒', 
        bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
        style: 'transform rotate-2 hover:rotate-4 transition-transform duration-200'
      },
      { 
        id: 'avatar6', 
        name: 'Gourmet', 
        emoji: '🍷', 
        bg: 'bg-gradient-to-br from-purple-400 to-indigo-500',
        style: 'transform -rotate-3 hover:-rotate-5 transition-transform duration-200'
      }
    ].find(avatar => avatar.id === avatarId);
    
    if (avatarData) {
      setSettingsData(prev => ({
        ...prev,
        avatarType: 'default',
        selectedAvatarId: avatarId,
        selectedAvatarData: avatarData
      }));
      setCustomer(prev => prev ? {
        ...prev,
        avatar: avatarData, // Store the avatar data object
        avatarType: 'default'
      } : null);
      setHasUnsavedChanges(true);
    }
  };

  const useSocialAvatar = (platform: 'google' | 'facebook' | 'instagram' | 'x' | 'youtube' | 'pinterest' | 'whatsapp' | 'nextdoor' | 'linkedin') => {
    const profileImage = settingsData.socialConnections[platform]?.profileImage;
    if (profileImage) {
      setSettingsData(prev => ({
        ...prev,
        avatarType: 'social',
        socialAvatarUrl: profileImage
      }));
      setCustomer(prev => prev ? {
        ...prev,
        avatar: profileImage,
        avatarType: 'social',
        socialAvatarUrl: profileImage
      } : null);
      setHasUnsavedChanges(true);
    }
  };

  // Settings save functionality
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update original data to match current data
      setOriginalSettingsData({ ...settingsData });
      setHasUnsavedChanges(false);
      
      // Show success message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
      // Update customer data
      setCustomer(prev => prev ? {
        ...prev,
        address: settingsData.address,
        phoneLandline: settingsData.phoneLandline,
        phoneMobile: settingsData.phoneMobile,
        smsOptIn: settingsData.smsOptIn,
        smsOptInDate: settingsData.smsOptInDate,
        smsConsentText: settingsData.smsConsentText,
        avatarType: settingsData.avatarType,
        uploadedAvatar: settingsData.uploadedAvatar,
        socialAvatarUrl: settingsData.socialAvatarUrl,
        socialConnections: settingsData.socialConnections
      } : null);
      
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Check for unsaved changes
  const checkForChanges = (newData: any) => {
    if (!originalSettingsData) return false;
    
    return JSON.stringify(newData) !== JSON.stringify(originalSettingsData);
  };

  // Handle tab navigation with unsaved changes warning
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges && activeTab === 'settings') {
      const shouldSave = confirm(
        'You have unsaved changes in your settings. Would you like to save them before leaving?\n\nClick OK to save and continue, or Cancel to discard changes.'
      );
      
      if (shouldSave) {
        saveSettings().then(() => {
          setActiveTab(newTab as any);
        });
        return;
      }
    }
    
    setActiveTab(newTab as any);
  };

  // Load data from API calls when they complete
  useEffect(() => {
    // Set loading to false when all critical data is loaded
    const isLoading = customerLoading || ordersLoading || favoritesLoading;
    setLoading(isLoading);

    // Update customer data when available
    if (customerData?.success && customerData.customer) {
      setCustomer(customerData.customer);
      
      // Initialize settings data from customer profile
      setSettingsData({
        address: customerData.customer.address || { street: '', city: '', state: '', zipCode: '', country: 'US' },
        phoneLandline: customerData.customer.phoneLandline || '',
        phoneMobile: customerData.customer.phoneMobile || '',
        smsOptIn: customerData.customer.smsOptIn || false,
        smsOptInDate: customerData.customer.smsOptInDate,
        smsConsentText: customerData.customer.smsConsentText,
        avatarType: customerData.customer.avatarType || 'default',
        uploadedAvatar: customerData.customer.uploadedAvatar,
        socialAvatarUrl: customerData.customer.socialAvatarUrl,
        socialConnections: customerData.customer.socialConnections,
        notifications: customerData.customer.preferences?.notifications || {
          email: true,
          push: true,
          sms: false
        },
        marketing: customerData.customer.preferences?.marketing ?? true,
        defaultPickupMethod: customerData.customer.preferences?.defaultPickupMethod || 'pickup'
      });
      
      setOriginalSettingsData({
        address: customerData.customer.address || { street: '', city: '', state: '', zipCode: '', country: 'US' },
        phoneLandline: customerData.customer.phoneLandline || '',
        phoneMobile: customerData.customer.phoneMobile || '',
        smsOptIn: customerData.customer.smsOptIn || false,
        smsOptInDate: customerData.customer.smsOptInDate,
        smsConsentText: customerData.customer.smsConsentText,
        avatarType: customerData.customer.avatarType || 'default',
        uploadedAvatar: customerData.customer.uploadedAvatar,
        socialAvatarUrl: customerData.customer.socialAvatarUrl,
        socialConnections: customerData.customer.socialConnections,
        notifications: customerData.customer.preferences?.notifications || {
          email: true,
          push: true,
          sms: false
        },
        marketing: customerData.customer.preferences?.marketing ?? true,
        defaultPickupMethod: customerData.customer.preferences?.defaultPickupMethod || 'pickup'
      });
    }

    // Update favorites when available
    if (favoritesData?.success && favoritesData.favorites) {
      setFavoriteVendors(favoritesData.favorites);
    }

    // Update messages when available
    if (messagesData?.success && messagesData.messages) {
      setMessages(messagesData.messages);
    }

    // Update events when available
    if (eventsData?.success && eventsData.events) {
      setUpcomingEvents(eventsData.events);
    }
  }, [customerData, favoritesData, messagesData, eventsData, customerLoading, ordersLoading, favoritesLoading]);

  // Fallback mock data for development/testing when APIs return empty
  useEffect(() => {
    // Only load mock data if no real customer data after loading completes
    if (!loading && !customer) {
      const mockCustomer: Customer = {
        id: 'c1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        avatar: '/images/avatars/sarah.jpg',
        primaryZip: '30248',
        secondaryZips: ['30301', '30305'],
        referralCode: 'SARAH2024',
        referralCount: 8,
        joinDate: '2023-03-15',
        address: {
          street: '123 Main Street',
          city: 'Atlanta',
          state: 'GA',
          zipCode: '30248',
          country: 'US'
        },
        phoneLandline: '(555) 123-4567',
        phoneMobile: '(555) 987-6543',
        smsOptIn: false,
        avatarType: 'default',
        socialConnections: {
          google: { connected: true, email: 'sarah.johnson@gmail.com', profileImage: 'https://lh3.googleusercontent.com/a/default-user=s96-c' },
          facebook: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          instagram: { connected: true, username: '@sarahj_foodie', profileImage: 'https://instagram.com/sarahj_foodie/profile.jpg', shareProducts: true, shareDeals: false },
          x: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          youtube: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          pinterest: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          whatsapp: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          nextdoor: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false },
          linkedin: { connected: false, username: '', profileImage: '', shareProducts: false, shareDeals: false }
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          marketing: true,
          defaultPickupMethod: 'pickup'
        }
      };

    const mockOrders: Order[] = [
      {
        id: 'o1',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        vendorAvatar: '/images/vendors/rosecreek-avatar.jpg',
        date: '2024-02-10',
        status: 'ready',
        total: 32.50,
        items: [
          { id: 'i1', name: 'Sourdough Bread', quantity: 2, price: 9.00, image: '/images/products/sourdough-1.jpg' },
          { id: 'i2', name: 'Artisan Baguette', quantity: 1, price: 7.50, image: '/images/products/baguette.jpg' },
          { id: 'i3', name: 'Croissant', quantity: 2, price: 3.50, image: '/images/products/croissant.jpg' }
        ],
        pickupDate: '2024-02-12',
        pickupTime: '14:00-16:00',
        eta: 'Ready for pickup',
        reviewed: false
      },
      {
        id: 'o2',
        vendorId: 'v2',
        vendorName: 'Green Thumb Gardens',
        vendorAvatar: '/images/vendors/greenthumb-avatar.jpg',
        date: '2024-02-08',
        status: 'delivered',
        total: 18.75,
        items: [
          { id: 'i4', name: 'Organic Tomatoes', quantity: 2, price: 4.50, image: '/images/products/tomatoes.jpg' },
          { id: 'i5', name: 'Fresh Herbs', quantity: 3, price: 3.25, image: '/images/products/herbs.jpg' }
        ],
        deliveryDate: '2024-02-09',
        deliveryTime: '10:30',
        reviewed: true
      }
    ];

    const mockFavoriteVendors: Vendor[] = [
      {
        id: 'v1',
        name: 'Rose Creek Bakery',
        avatar: '/images/vendors/rosecreek-avatar.jpg',
        verified: true,
        rating: 4.8,
        reviewCount: 127,
        nextAvailability: '2024-02-15',
        distance: 2.3,
        tags: ['bakery', 'artisan', 'organic', 'local'],
        featured: true
      },
      {
        id: 'v2',
        name: 'Green Thumb Gardens',
        avatar: '/images/vendors/greenthumb-avatar.jpg',
        verified: true,
        rating: 4.9,
        reviewCount: 89,
        nextAvailability: '2024-02-14',
        distance: 1.8,
        tags: ['produce', 'organic', 'seasonal', 'farm-fresh'],
        featured: false
      },
      {
        id: 'v3',
        name: 'Mountain View Meats',
        avatar: '/images/vendors/mountainview-avatar.jpg',
        verified: true,
        rating: 4.7,
        reviewCount: 156,
        nextAvailability: '2024-02-16',
        distance: 3.2,
        tags: ['butcher', 'grass-fed', 'local', 'premium'],
        featured: true
      },
      {
        id: 'v4',
        name: 'Coastal Catch Seafood',
        avatar: '/images/vendors/coastalcatch-avatar.jpg',
        verified: true,
        rating: 4.6,
        reviewCount: 98,
        nextAvailability: '2024-02-13',
        distance: 4.1,
        tags: ['seafood', 'fresh', 'sustainable', 'local'],
        featured: false
      },
      {
        id: 'v5',
        name: 'Sunrise Dairy Farm',
        avatar: '/images/vendors/sunrise-avatar.jpg',
        verified: true,
        rating: 4.8,
        reviewCount: 203,
        nextAvailability: '2024-02-12',
        distance: 2.8,
        tags: ['dairy', 'organic', 'farm-fresh', 'local'],
        featured: true
      },
      {
        id: 'v6',
        name: 'Golden Grain Mill',
        avatar: '/images/vendors/goldengrain-avatar.jpg',
        verified: true,
        rating: 4.5,
        reviewCount: 67,
        nextAvailability: '2024-02-17',
        distance: 5.2,
        tags: ['grains', 'artisan', 'organic', 'milled'],
        featured: false
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'm1',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        vendorAvatar: '/images/vendors/rosecreek-avatar.jpg',
        subject: 'Order #o1 Ready for Pickup',
        preview: 'Your order is ready for pickup at our location...',
        timestamp: '2024-02-10T14:30:00Z',
        unread: true,
        category: 'order'
      },
      {
        id: 'm2',
        vendorId: 'v2',
        vendorName: 'Green Thumb Gardens',
        vendorAvatar: '/images/vendors/greenthumb-avatar.jpg',
        subject: 'New Seasonal Items Available',
        preview: 'We just harvested fresh strawberries and...',
        timestamp: '2024-02-09T10:15:00Z',
        unread: false,
        category: 'product'
      },
      {
        id: 'm3',
        vendorId: 'v3',
        vendorName: 'Mountain View Meats',
        vendorAvatar: '/images/vendors/mountainview-avatar.jpg',
        subject: 'Pickup Confirmation',
        preview: 'Your meat order is ready for pickup tomorrow...',
        timestamp: '2024-02-08T16:45:00Z',
        unread: true,
        category: 'pickup'
      },
      {
        id: 'm4',
        vendorId: 'v4',
        vendorName: 'Coastal Catch Seafood',
        vendorAvatar: '/images/vendors/coastalcatch-avatar.jpg',
        subject: 'Weekly Specials Update',
        preview: 'Check out our fresh catch of the week...',
        timestamp: '2024-02-07T09:20:00Z',
        unread: false,
        category: 'product'
      },
      {
        id: 'm5',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        vendorAvatar: '/images/vendors/rosecreek-avatar.jpg',
        subject: 'Thank you for your feedback!',
        preview: 'We appreciate your recent review and feedback...',
        timestamp: '2024-02-06T11:30:00Z',
        unread: false,
        category: 'general'
      },
      {
        id: 'm6',
        vendorId: 'v5',
        vendorName: 'Sunrise Dairy Farm',
        vendorAvatar: '/images/vendors/sunrise-avatar.jpg',
        subject: 'Order #o2 Shipped',
        preview: 'Your dairy products have been shipped and are on the way...',
        timestamp: '2024-02-05T14:15:00Z',
        unread: true,
        category: 'order'
      }
    ];

    const mockEvents: Event[] = [
      {
        id: 'e1',
        name: 'Locust Grove Artisan Market',
        date: '2024-02-15',
        time: '09:00-17:00',
        location: 'Locust Grove Farmers Market',
        rsvpStatus: 'going',
        favoriteVendorsAttending: ['v1', 'v2'],
        image: '/images/events/market-1.jpg',
        type: 'market',
        description: 'Join us for a day of local artisans, fresh produce, and handmade goods from our favorite vendors.',
        organizer: 'Locust Grove Community Center',
        capacity: 50,
        registeredCount: 32
      },
      {
        id: 'e2',
        name: 'Spring Harvest Festival',
        date: '2024-03-20',
        time: '10:00-18:00',
        location: 'Riverside Park',
        rsvpStatus: 'maybe',
        favoriteVendorsAttending: ['v3', 'v4', 'v5'],
        image: '/images/events/festival-1.jpg',
        type: 'festival',
        description: 'Celebrate the spring harvest with live music, food trucks, and local vendors showcasing seasonal products.',
        organizer: 'Riverside Events',
        capacity: 200,
        registeredCount: 156
      },
      {
        id: 'e3',
        name: 'Artisan Bread Workshop',
        date: '2024-02-22',
        time: '14:00-17:00',
        location: 'Rose Creek Bakery',
        rsvpStatus: 'not-going',
        favoriteVendorsAttending: ['v1'],
        image: '/images/events/workshop-1.jpg',
        type: 'workshop',
        description: 'Learn the art of sourdough bread making with hands-on instruction from master bakers.',
        organizer: 'Rose Creek Bakery',
        capacity: 12,
        registeredCount: 8
      },
      {
        id: 'e4',
        name: 'Wine & Cheese Tasting',
        date: '2024-03-05',
        time: '19:00-21:00',
        location: 'Sunrise Dairy Farm',
        rsvpStatus: 'going',
        favoriteVendorsAttending: ['v5'],
        image: '/images/events/tasting-1.jpg',
        type: 'tasting',
        description: 'Experience the perfect pairing of local wines and artisanal cheeses from our farm.',
        organizer: 'Sunrise Dairy Farm',
        capacity: 25,
        registeredCount: 18
      },
      {
        id: 'e5',
        name: 'Coastal Catch Popup',
        date: '2024-02-28',
        time: '16:00-20:00',
        location: 'Downtown Plaza',
        rsvpStatus: 'not-going',
        favoriteVendorsAttending: ['v4'],
        image: '/images/events/popup-1.jpg',
        type: 'popup',
        description: 'Fresh seafood popup featuring today\'s catch and special preparations.',
        organizer: 'Coastal Catch Seafood',
        capacity: 30,
        registeredCount: 22
      },
      {
        id: 'e6',
        name: 'Strawberry Season Celebration',
        date: '2024-04-10',
        time: '11:00-16:00',
        location: 'Green Thumb Gardens',
        rsvpStatus: 'not-going',
        favoriteVendorsAttending: ['v2'],
        image: '/images/events/seasonal-1.jpg',
        type: 'seasonal',
        description: 'Celebrate strawberry season with U-pick activities, fresh strawberry treats, and farm tours.',
        organizer: 'Green Thumb Gardens',
        capacity: 40,
        registeredCount: 28
      }
    ];

      setCustomer(mockCustomer);
      
      if (orders.length === 0) {
        setOrders(mockOrders);
      }
      if (favoriteVendors.length === 0) {
        setFavoriteVendors(mockFavoriteVendors);
      }
      if (messages.length === 0) {
        setMessages(mockMessages);
      }
      if (upcomingEvents.length === 0) {
        setUpcomingEvents(mockEvents);
      }
    
    // Initialize settings data from customer
    const initialSettingsData = {
      address: mockCustomer.address || { street: '', city: '', state: '', zipCode: '', country: 'US' },
      phoneLandline: mockCustomer.phoneLandline || '',
      phoneMobile: mockCustomer.phoneMobile || '',
      smsOptIn: mockCustomer.smsOptIn,
      avatarType: mockCustomer.avatarType,
      uploadedAvatar: mockCustomer.uploadedAvatar || '',
      socialAvatarUrl: mockCustomer.socialAvatarUrl || '',
      selectedAvatarId: 'avatar1',
      selectedAvatarData: {
        id: 'avatar1', 
        name: 'Foodie', 
        emoji: '🍕', 
        bg: 'bg-gradient-to-br from-orange-400 to-red-500',
        style: 'transform rotate-3 hover:rotate-6 transition-transform duration-200'
      },
      socialConnections: mockCustomer.socialConnections
    };
    
      setSettingsData(initialSettingsData);
      setOriginalSettingsData(initialSettingsData);
    }
  }, [loading, customer, orders, favoriteVendors, messages, upcomingEvents]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'picked-up': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleReorder = (order: Order) => {
    setSelectedOrder(order);
    // Initialize quantities with original order quantities
    const initialQuantities: {[key: string]: number} = {};
    order.items.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setReorderQuantities(initialQuantities);
    setShowReorderModal(true);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setReorderQuantities(prev => {
      const current = prev[itemId] || 0;
      const newQuantity = Math.max(1, current + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedOrder) return;
    
    // Add each item to cart with updated quantities
    selectedOrder.items.forEach(item => {
      const quantity = reorderQuantities[item.id] || item.quantity;
      if (quantity > 0) {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          vendorId: selectedOrder.vendorId,
          vendorName: selectedOrder.vendorName,
          image: item.image
        }, quantity);
      }
    });
    
    setShowReorderModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(customer?.referralCode || '');
    toast.success('Referral code copied to clipboard!');
  };

  // Order Detail Modal Component
  const OrderDetailModal = ({ order, isOpen, onClose }: { order: DetailedOrder | null; isOpen: boolean; onClose: () => void }) => {
    if (!order || !isOpen) return null;

    const StatusIcon = getStatusInfo(order.fulfillment?.status || 'PENDING').icon;
    const statusColor = getStatusInfo(order.fulfillment?.status || 'PENDING').color;
    const statusBgColor = getStatusInfo(order.fulfillment?.status || 'PENDING').bgColor;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generateInvoicePDF(order)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-maroon/80 transition-colors"
                title="Download Invoice"
              >
                <Download className="h-4 w-4" />
                Invoice
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                  <StatusIcon className="h-4 w-4" />
                  {order.fulfillment?.status || 'PENDING'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {order.fulfillment?.trackingNumber && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Tracking Number:</span> {order.fulfillment.trackingNumber}</p>
                  {order.fulfillment.carrier && <p><span className="font-medium">Carrier:</span> {order.fulfillment.carrier}</p>}
                  {order.fulfillment.estimatedDelivery && <p><span className="font-medium">Estimated Delivery:</span> {order.fulfillment.estimatedDelivery}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-maroon/80 transition-colors"
              title="Download Invoice"
            >
              <Download className="h-4 w-4" />
              Invoice
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="page-container bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {customer.name}!</h1>
                <p className="text-gray-600">Member since {new Date(customer.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Let's Shop!
              </Link>
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
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-brand-cream rounded-lg p-6 text-center h-32 flex flex-col justify-center shadow-md">
                  <div className="text-3xl font-bold text-brand-green">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-brand-cream rounded-lg p-6 text-center h-32 flex flex-col justify-center shadow-md">
                  <div className="text-3xl font-bold text-brand-maroon">{favoriteVendors.length}</div>
                  <div className="text-sm text-gray-600">Favorite Vendors</div>
                </div>
                <div className="bg-brand-cream rounded-lg p-6 text-center h-32 flex flex-col justify-center shadow-md">
                  <div className="text-3xl font-bold text-blue-600">{messages.filter(m => m.unread).length}</div>
                  <div className="text-sm text-gray-600">Unread Messages</div>
                </div>
                <div className="bg-brand-cream rounded-lg p-6 text-center h-32 flex flex-col justify-center shadow-md">
                  <div className="text-3xl font-bold text-purple-600">{upcomingEvents.length}</div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-brand-green hover:text-brand-green/80"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-white shadow-md">
                      <div className="flex items-center gap-4">
                        <img src={order.vendorAvatar} alt={order.vendorName} className="w-12 h-12 rounded-full" />
                        <div>
                          <h3 className="font-semibold">{order.vendorName}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString()} • {formatCurrency(order.total)}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3 py-1 text-sm bg-brand-green text-white rounded hover:bg-brand-green/80"
                        >
                          Reorder
                        </button>
                        <Link
                          href={`/vendors/${order.vendorId}`}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Visit Store
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Vendors */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Favorite Vendors</h2>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className="text-brand-green hover:text-brand-green/80"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-lg p-4 h-48 flex flex-col bg-white shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{vendor.rating}</span>
                            <span className="text-sm text-gray-600">({vendor.reviewCount})</span>
                          </div>
                        </div>
                        {vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="mb-3 flex-1 min-h-0">
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                        {vendor.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-gray-600">{vendor.distance} mi away</span>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
                        >
                          Visit Store →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account & Referral */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-brand-cream rounded-lg p-6 shadow-md flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="font-semibold">{new Date(customer.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="font-semibold">{orders.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Favorite Vendors</span>
                      <span className="font-semibold">{favoriteVendors.length}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link href="/" className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 inline-block text-center">
                      Browse Vendors
                    </Link>
                  </div>
                </div>

                <div className="bg-brand-cream rounded-lg p-6 shadow-md flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Referral Program</h2>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Referral Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{customer.referralCode}</span>
                        <button
                          onClick={handleCopyReferralCode}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy referral code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Friends Referred</span>
                      <span className="font-semibold">{customer.referralCount}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80">
                      Share Referral Code
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h2>
                <p className="text-gray-600">View your order history and track your purchases</p>
                  </div>

              {/* Loading State */}
              {ordersLoading && (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-6 bg-brand-cream shadow-md">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error State */}
              {ordersError && (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
                  <p className="text-gray-600">Unable to load your order history. Please try again later.</p>
                </div>
              )}

              {/* Orders Content */}
              {!ordersLoading && !ordersError && detailedOrdersData && (() => {
                const detailedOrders = detailedOrdersData.orders || [];
                
                // Filter orders by status
                const filteredOrders = detailedOrders.filter(order => {
                  if (statusFilter === 'all') return true;
                  return order.fulfillment?.status === statusFilter || order.status === statusFilter;
                });
                
                const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
                const startIndex = (currentPage - 1) * ordersPerPage;
                const endIndex = startIndex + ordersPerPage;
                const currentOrders = filteredOrders.slice(startIndex, endIndex);

                return (
                  <>
                    {/* Filter Section */}
                    <div className="bg-brand-cream rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                            Filter by status:
                          </label>
                          <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => {
                              setStatusFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                          >
                            <option value="all">All Orders ({detailedOrders.length})</option>
                            <option value="COMPLETED">Completed ({detailedOrders.filter(o => o.fulfillment?.status === 'COMPLETED').length})</option>
                            <option value="IN_PROGRESS">In Progress ({detailedOrders.filter(o => o.fulfillment?.status === 'IN_PROGRESS').length})</option>
                            <option value="PENDING">Pending ({detailedOrders.filter(o => o.fulfillment?.status === 'PENDING').length})</option>
                            <option value="CANCELLED">Cancelled ({detailedOrders.filter(o => o.fulfillment?.status === 'CANCELLED').length})</option>
                            <option value="FAILED">Failed ({detailedOrders.filter(o => o.fulfillment?.status === 'FAILED').length})</option>
                          </select>
                          </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Showing {filteredOrders.length} of {detailedOrders.length} orders
                          </div>
                          {statusFilter !== 'all' && (
                            <button
                              onClick={() => {
                                setStatusFilter('all');
                                setCurrentPage(1);
                              }}
                              className="text-sm text-brand-green hover:text-brand-green/80 underline"
                            >
                              Clear filter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        {statusFilter === 'all' ? (
                          <>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
                            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                            <Link
                              href="/"
                              className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors"
                            >
                              Start Shopping
                            </Link>
                          </>
                        ) : (
                          <>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No {statusFilter.toLowerCase().replace('_', ' ')} Orders</h2>
                            <p className="text-gray-600 mb-6">No orders found with the selected status.</p>
                            <button
                              onClick={() => setStatusFilter('all')}
                              className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors"
                            >
                              View All Orders
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6">
                          {currentOrders.map((order) => {
                            const StatusIcon = getStatusInfo(order.fulfillment?.status || 'PENDING').icon;
                            const statusColor = getStatusInfo(order.fulfillment?.status || 'PENDING').color;
                            const statusBgColor = getStatusInfo(order.fulfillment?.status || 'PENDING').bgColor;

                            return (
                              <div key={order.id} id={`order-${order.id}`} className="bg-brand-cream border border-gray-200 rounded-lg p-6 mb-4 shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Order #{order.orderNumber}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Placed on {formatDetailedDate(order.createdAt)}
                                    </p>
                                    {order.fulfillment?.trackingNumber && (
                                      <p className="text-sm text-gray-700">Tracking #: {order.fulfillment.trackingNumber}</p>
                                    )}
                                    {order.fulfillment?.notes && (
                                      <p className="text-sm italic text-gray-600 mt-1">Notes: {order.fulfillment.notes}</p>
                                    )}
                        </div>
                        <div className="text-right">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                                      <StatusIcon className="h-4 w-4" />
                                      {order.fulfillment?.status || 'PENDING'}
                                    </span>
                                    <p className="text-lg font-bold text-gray-900 mt-2">
                                      ${order.total.toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  {order.items.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                                      {item.product.imageUrl ? (
                                        <img 
                                          src={item.product.imageUrl} 
                                          alt={item.product.name} 
                                          className="w-12 h-12 object-cover rounded" 
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                          <Package className="h-6 w-6 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <span>{item.product.name} x {item.quantity}</span>
                                      </div>
                                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                  ))}
                                  {order.items.length > 3 && (
                                    <p className="text-sm text-gray-500 text-center">
                                      +{order.items.length - 3} more items
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openOrderModal(order)}
                                      className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
                                      title="View order details"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => generateInvoicePDF(order)}
                                      className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-maroon/80 transition-colors"
                                      title="Download invoice"
                                    >
                                      Download Invoice
                                    </button>
                                    <button
                                      onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}
                                      className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                      title="Download receipt"
                                    >
                                      Download Receipt
                                    </button>
                                  </div>
                          <div className="text-sm text-gray-600">
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </div>
                        </div>
                      </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Previous page"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                      currentPage === page
                                        ? 'bg-brand-green text-white'
                                        : 'border border-gray-300 text-gray-700 hover:bg-brand-cream'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next page"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}

              {/* Order Detail Modal */}
              <OrderDetailModal
                order={selectedDetailedOrder}
                isOpen={isOrderModalOpen}
                onClose={closeOrderModal}
              />
            </motion.div>
          )}

          {/* Message Detail Modal */}
          {selectedMessage && isMessageModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-brand-cream rounded-t-lg">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                    <p className="text-gray-600">From {selectedMessage.vendorName}</p>
                  </div>
                  <button
                    onClick={closeMessageModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 bg-white">
                  {/* Message Header */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                        <div className="flex items-center gap-4">
                      <img src={selectedMessage.vendorAvatar} alt={selectedMessage.vendorName} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{selectedMessage.vendorName}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            selectedMessage.category === 'order' ? 'bg-blue-100 text-blue-700' :
                            selectedMessage.category === 'product' ? 'bg-green-100 text-green-700' :
                            selectedMessage.category === 'pickup' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedMessage.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedMessage.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Subject */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                    <p className="text-gray-700">{selectedMessage.subject}</p>
                  </div>

                  {/* Message Content */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.preview}
                        {'\n\n'}
                        This is the full message content. In a real application, this would contain the complete message text from the backend.
                      </p>
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <h4 className="font-medium text-gray-900 mb-3">Reply</h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none bg-white"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-between gap-3 bg-brand-cream rounded-b-lg">
                        <div className="flex gap-2">
                          <button
                      onClick={() => toggleMessageRead(selectedMessage.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors bg-white"
                          >
                      <Eye className="h-4 w-4" />
                      {selectedMessage.unread ? 'Mark as Read' : 'Mark as Unread'}
                          </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-maroon/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                            </button>
                        </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeMessageModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Reply
                    </button>
                      </div>
                    </div>
              </div>
            </div>
          )}

          {/* Compose Message Modal */}
          {isComposeModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-brand-cream rounded-t-lg">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
                    <p className="text-gray-600">Send a message to a vendor</p>
                  </div>
                  <button
                    onClick={closeComposeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 bg-white">
                  {/* Vendor Selection */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <label htmlFor="vendor-select" className="block text-sm font-medium text-gray-700 mb-2">
                      To Vendor
                    </label>
                    <select
                      id="vendor-select"
                      value={composeData.vendorId}
                      onChange={(e) => setComposeData(prev => ({ ...prev, vendorId: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                    >
                      <option value="">Select a vendor...</option>
                      {favoriteVendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                </div>

                  {/* Subject */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <label htmlFor="message-subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="message-subject"
                      value={composeData.subject}
                      onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter message subject..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                    />
              </div>

                  {/* Message */}
                  <div className="bg-brand-cream rounded-lg p-4 shadow-md">
                    <label htmlFor="message-content" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message-content"
                      value={composeData.message}
                      onChange={(e) => setComposeData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type your message here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none bg-white"
                      rows={6}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-brand-cream rounded-b-lg">
                  <button
                    onClick={closeComposeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompose}
                    disabled={!composeData.vendorId || !composeData.subject || !composeData.message}
                    className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filter Section */}
              <div className="bg-brand-cream rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="vendor-type-filter" className="text-sm font-medium text-gray-700">
                      Filter by vendor type:
                    </label>
                    <select
                      id="vendor-type-filter"
                      value={vendorTypeFilter}
                      onChange={(e) => setVendorTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                    >
                      <option value="all">All Types ({favoriteVendors.length})</option>
                      <option value="bakery">Bakery ({favoriteVendors.filter(v => v.tags.includes('bakery')).length})</option>
                      <option value="produce">Produce ({favoriteVendors.filter(v => v.tags.includes('produce')).length})</option>
                      <option value="butcher">Butcher ({favoriteVendors.filter(v => v.tags.includes('butcher')).length})</option>
                      <option value="seafood">Seafood ({favoriteVendors.filter(v => v.tags.includes('seafood')).length})</option>
                      <option value="dairy">Dairy ({favoriteVendors.filter(v => v.tags.includes('dairy')).length})</option>
                      <option value="grains">Grains ({favoriteVendors.filter(v => v.tags.includes('grains')).length})</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {vendorTypeFilter === 'all' ? favoriteVendors.length : favoriteVendors.filter(v => v.tags.includes(vendorTypeFilter)).length} vendors
                    </div>
                    {vendorTypeFilter !== 'all' && (
                      <button
                        onClick={() => setVendorTypeFilter('all')}
                        className="text-sm text-brand-green hover:text-brand-green/80 underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendors Grid */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Favorite Vendors</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Grid className="w-4 h-4 inline mr-1" />
                      Grid
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <List className="w-4 h-4 inline mr-1" />
                      List
                    </button>
                  </div>
                </div>
                
                {(() => {
                  const filteredVendors = vendorTypeFilter === 'all' 
                    ? favoriteVendors 
                    : favoriteVendors.filter(vendor => vendor.tags.includes(vendorTypeFilter));

                  return filteredVendors.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">No {vendorTypeFilter} Vendors</h2>
                      <p className="text-gray-600 mb-6">No favorite vendors found with the selected type.</p>
                      <button
                        onClick={() => setVendorTypeFilter('all')}
                        className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors"
                      >
                        View All Vendors
                      </button>
                    </div>
                  ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-lg p-4 bg-white shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{vendor.rating}</span>
                            <span className="text-sm text-gray-600">({vendor.reviewCount})</span>
                          </div>
                        </div>
                        {vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vendor.tags.map((tag, index) => (
                              <span key={index} className={`px-2 py-1 text-xs rounded ${
                                vendorTypeFilter !== 'all' && tag === vendorTypeFilter
                                  ? 'bg-brand-green text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{vendor.distance} mi away</span>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
                        >
                          Visit Store →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filter Section */}
              <div className="bg-brand-cream rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="message-filter" className="text-sm font-medium text-gray-700">
                      Filter by category:
                    </label>
                    <select
                      id="message-filter"
                      value={messageFilter}
                      onChange={(e) => setMessageFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                    >
                      <option value="all">All Messages ({messages.length})</option>
                      <option value="order">Order Updates ({messages.filter(m => m.category === 'order').length})</option>
                      <option value="product">Product Updates ({messages.filter(m => m.category === 'product').length})</option>
                      <option value="pickup">Pickup Notifications ({messages.filter(m => m.category === 'pickup').length})</option>
                      <option value="general">General ({messages.filter(m => m.category === 'general').length})</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {messageFilter === 'all' ? messages.length : messages.filter(m => m.category === messageFilter).length} messages
                    </div>
                    {messageFilter !== 'all' && (
                      <button
                        onClick={() => setMessageFilter('all')}
                        className="text-sm text-brand-green hover:text-brand-green/80 underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Messages</h2>
                  <button
                    onClick={openComposeModal}
                    className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    New Message
                    </button>
                  </div>
                
                {(() => {
                  const filteredMessages = messageFilter === 'all' 
                    ? messages 
                    : messages.filter(message => message.category === messageFilter);

                  return filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">No {messageFilter} Messages</h2>
                      <p className="text-gray-600 mb-6">No messages found with the selected category.</p>
                      <button
                        onClick={() => setMessageFilter('all')}
                        className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors"
                      >
                        View All Messages
                      </button>
                </div>
                  ) : (
                <div className="space-y-4">
                      {filteredMessages.map((message) => (
                        <div key={message.id} className={`rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer ${message.unread ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-center gap-4" onClick={() => openMessageModal(message)}>
                        <img src={message.vendorAvatar} alt={message.vendorName} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{message.vendorName}</h3>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    message.category === 'order' ? 'bg-blue-100 text-blue-700' :
                                    message.category === 'product' ? 'bg-green-100 text-green-700' :
                                    message.category === 'pickup' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {message.category}
                                  </span>
                                </div>
                            <span className="text-sm text-gray-600">
                              {new Date(message.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                          <p className="text-sm text-gray-500">{message.preview}</p>
                        </div>
                            <div className="flex items-center gap-2">
                        {message.unread && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMessageRead(message.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={message.unread ? "Mark as read" : "Mark as unread"}
                              >
                                {message.unread ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMessage(message.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                      </div>
                    </div>
                  ))}
                </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filter Section */}
              <div className="bg-brand-cream rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="event-type-filter" className="text-sm font-medium text-gray-700">
                      Filter by event type:
                    </label>
                    <select
                      id="event-type-filter"
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
                    >
                      <option value="all">All Types ({upcomingEvents.length})</option>
                      <option value="market">Markets ({upcomingEvents.filter(e => e.type === 'market').length})</option>
                      <option value="festival">Festivals ({upcomingEvents.filter(e => e.type === 'festival').length})</option>
                      <option value="workshop">Workshops ({upcomingEvents.filter(e => e.type === 'workshop').length})</option>
                      <option value="tasting">Tastings ({upcomingEvents.filter(e => e.type === 'tasting').length})</option>
                      <option value="popup">Popups ({upcomingEvents.filter(e => e.type === 'popup').length})</option>
                      <option value="seasonal">Seasonal ({upcomingEvents.filter(e => e.type === 'seasonal').length})</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {eventTypeFilter === 'all' ? upcomingEvents.length : upcomingEvents.filter(e => e.type === eventTypeFilter).length} events
                    </div>
                    {eventTypeFilter !== 'all' && (
                      <button
                        onClick={() => setEventTypeFilter('all')}
                        className="text-sm text-brand-green hover:text-brand-green/80 underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {(() => {
                const filteredEvents = eventTypeFilter === 'all' 
                  ? upcomingEvents 
                  : upcomingEvents.filter(event => event.type === eventTypeFilter);

                const attendingEvents = filteredEvents.filter(event => event.rsvpStatus === 'going');
                const maybeEvents = filteredEvents.filter(event => event.rsvpStatus === 'maybe');
                const discoverEvents = filteredEvents.filter(event => event.rsvpStatus === 'not-going');

                return (
                  <>
                    {/* Events I'm Attending */}
                    {attendingEvents.length > 0 && (
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold">Events I'm Attending</h2>
                          <span className="px-3 py-1 bg-brand-green text-white rounded-full text-sm font-medium">
                            {attendingEvents.length} Event{attendingEvents.length !== 1 ? 's' : ''}
                          </span>
                </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {attendingEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-lg p-4 shadow-md border border-green-200">
                              <div className="flex items-start gap-4">
                                <img src={event.image} alt={event.name} className="w-20 h-20 rounded object-cover" />
                        <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{event.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      event.type === 'market' ? 'bg-blue-100 text-blue-700' :
                                      event.type === 'festival' ? 'bg-purple-100 text-purple-700' :
                                      event.type === 'workshop' ? 'bg-orange-100 text-orange-700' :
                                      event.type === 'tasting' ? 'bg-pink-100 text-pink-700' :
                                      event.type === 'popup' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {event.type}
                          </span>
                        </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(event.date).toLocaleDateString()} • ⏰ {event.time}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                                  <p className="text-sm text-gray-600 mb-3">Organized by {event.organizer}</p>
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                                  {event.capacity && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {event.registeredCount}/{event.capacity} registered
                                      </span>
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-brand-green h-2 rounded-full" 
                                          style={{ width: `${(event.registeredCount || 0) / event.capacity * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'maybe')}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Maybe
                                </button>
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'not-going')}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Can't Go
                                </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                    )}

                    {/* Maybe Events */}
                    {maybeEvents.length > 0 && (
                      <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold">Maybe Attending</h2>
                          <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium">
                            {maybeEvents.length} Event{maybeEvents.length !== 1 ? 's' : ''}
                          </span>
                  </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {maybeEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-lg p-4 shadow-md border border-yellow-200">
                              <div className="flex items-start gap-4">
                                <img src={event.image} alt={event.name} className="w-20 h-20 rounded object-cover" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{event.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      event.type === 'market' ? 'bg-blue-100 text-blue-700' :
                                      event.type === 'festival' ? 'bg-purple-100 text-purple-700' :
                                      event.type === 'workshop' ? 'bg-orange-100 text-orange-700' :
                                      event.type === 'tasting' ? 'bg-pink-100 text-pink-700' :
                                      event.type === 'popup' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {event.type}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(event.date).toLocaleDateString()} • ⏰ {event.time}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                                  <p className="text-sm text-gray-600 mb-3">Organized by {event.organizer}</p>
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                                  {event.capacity && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {event.registeredCount}/{event.capacity} registered
                                      </span>
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-yellow-500 h-2 rounded-full" 
                                          style={{ width: `${(event.registeredCount || 0) / event.capacity * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                  {event.favoriteVendorsAttending.length > 0 && (
                                    <p className="text-sm text-brand-green mb-3">
                                      {event.favoriteVendorsAttending.length} favorite vendor{event.favoriteVendorsAttending.length !== 1 ? 's' : ''} attending
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'going')}
                                  className="flex-1 px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors text-sm"
                                >
                                  I'm Going
                    </button>
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'not-going')}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Not Interested
                    </button>
                  </div>
                </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discover Events */}
                    {discoverEvents.length > 0 && (
                      <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold">Discover Events</h2>
                          <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">
                            {discoverEvents.length} Event{discoverEvents.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {discoverEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-lg p-4 shadow-md">
                              <div className="flex items-start gap-4">
                                <img src={event.image} alt={event.name} className="w-20 h-20 rounded object-cover" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{event.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      event.type === 'market' ? 'bg-blue-100 text-blue-700' :
                                      event.type === 'festival' ? 'bg-purple-100 text-purple-700' :
                                      event.type === 'workshop' ? 'bg-orange-100 text-orange-700' :
                                      event.type === 'tasting' ? 'bg-pink-100 text-pink-700' :
                                      event.type === 'popup' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {event.type}
                                    </span>
                    </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(event.date).toLocaleDateString()} • ⏰ {event.time}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                                  <p className="text-sm text-gray-600 mb-3">Organized by {event.organizer}</p>
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                                  {event.capacity && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {event.registeredCount}/{event.capacity} registered
                                      </span>
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-gray-400 h-2 rounded-full" 
                                          style={{ width: `${(event.registeredCount || 0) / event.capacity * 100}%` }}
                                        ></div>
                    </div>
                    </div>
                                  )}
                                  {event.favoriteVendorsAttending.length > 0 && (
                                    <p className="text-sm text-brand-green mb-3">
                                      {event.favoriteVendorsAttending.length} favorite vendor{event.favoriteVendorsAttending.length !== 1 ? 's' : ''} attending
                                    </p>
                                  )}
                  </div>
                </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'going')}
                                  className="flex-1 px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors text-sm"
                                >
                                  I'm Going
                                </button>
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'maybe')}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Maybe
                                </button>
                                <button
                                  onClick={() => updateEventRSVP(event.id, 'not-going')}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Not Interested
                                </button>
              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No {eventTypeFilter} Events</h2>
                        <p className="text-gray-600 mb-6">No events found with the selected type.</p>
                        <button
                          onClick={() => setEventTypeFilter('all')}
                          className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors"
                        >
                          View All Events
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}



          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Profile Picture</h2>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {settingsData.avatarType === 'uploaded' ? (
                      <img
                        src={settingsData.uploadedAvatar}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : settingsData.avatarType === 'social' ? (
                      <img
                        src={settingsData.socialAvatarUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl relative overflow-hidden ${settingsData.selectedAvatarData?.bg || 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
                        <span className="drop-shadow-sm">{settingsData.selectedAvatarData?.emoji || '🍕'}</span>
                        {/* Add a subtle shine effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                  <div>
                      <h3 className="font-semibold mb-3">Choose Your Avatar</h3>
                      <div className="grid grid-cols-6 gap-3 mb-4">
                        {[
                          { 
                            id: 'avatar1', 
                            name: 'Foodie', 
                            emoji: '🍕', 
                            bg: 'bg-gradient-to-br from-orange-400 to-red-500',
                            style: 'transform rotate-3 hover:rotate-6 transition-transform duration-200'
                          },
                          { 
                            id: 'avatar2', 
                            name: 'Chef', 
                            emoji: '👨‍🍳', 
                            bg: 'bg-gradient-to-br from-blue-400 to-purple-500',
                            style: 'transform -rotate-2 hover:-rotate-4 transition-transform duration-200'
                          },
                          { 
                            id: 'avatar3', 
                            name: 'Baker', 
                            emoji: '🥖', 
                            bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
                            style: 'transform rotate-1 hover:rotate-3 transition-transform duration-200'
                          },
                          { 
                            id: 'avatar4', 
                            name: 'Farmer', 
                            emoji: '🌱', 
                            bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
                            style: 'transform -rotate-1 hover:-rotate-2 transition-transform duration-200'
                          },
                          { 
                            id: 'avatar5', 
                            name: 'Shopper', 
                            emoji: '🛒', 
                            bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
                            style: 'transform rotate-2 hover:rotate-4 transition-transform duration-200'
                          },
                          { 
                            id: 'avatar6', 
                            name: 'Gourmet', 
                            emoji: '🍷', 
                            bg: 'bg-gradient-to-br from-purple-400 to-indigo-500',
                            style: 'transform -rotate-3 hover:-rotate-5 transition-transform duration-200'
                          }
                        ].map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => selectDefaultAvatar(avatar.id)}
                            className={`w-12 h-12 rounded-full border-2 overflow-hidden ${
                              settingsData.avatarType === 'default' && settingsData.selectedAvatarId === avatar.id
                                ? 'border-brand-green ring-2 ring-brand-green/50 shadow-lg'
                                : 'border-gray-300 hover:border-brand-green hover:shadow-md'
                            } transition-all duration-200`}
                            title={`Select ${avatar.name} avatar`}
                          >
                            <div className={`w-full h-full rounded-full ${avatar.bg} flex items-center justify-center text-lg ${avatar.style} relative`}>
                              <span className="drop-shadow-sm">{avatar.emoji}</span>
                              {/* Add a subtle shine effect */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Your Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-green file:text-white hover:file:bg-brand-green/80"
                        title="Upload your profile photo"
                        aria-label="Upload your profile photo"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Use Social Media Photo</h4>
                      <div className="flex gap-2">
                        {settingsData.socialConnections.google?.connected && (
                          <button
                            onClick={() => useSocialAvatar('google')}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            <img src="/images/google-icon.svg" alt="Google" className="w-4 h-4" />
                            Use Google Photo
                          </button>
                        )}
                        {settingsData.socialConnections.facebook?.connected && (
                          <button
                            onClick={() => useSocialAvatar('facebook')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <img src="/images/facebook-icon.svg" alt="Facebook" className="w-4 h-4" />
                            Use Facebook Photo
                          </button>
                        )}
                        {settingsData.socialConnections.instagram?.connected && (
                          <button
                            onClick={() => useSocialAvatar('instagram')}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 text-sm"
                          >
                            <span className="text-sm">📷</span>
                            Use Instagram Photo
                          </button>
                        )}
                        {settingsData.socialConnections.x?.connected && (
                          <button
                            onClick={() => useSocialAvatar('x')}
                            className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                          >
                            <span className="text-sm">𝕏</span>
                            Use X Photo
                          </button>
                        )}
                        {settingsData.socialConnections.youtube?.connected && (
                          <button
                            onClick={() => useSocialAvatar('youtube')}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            <span className="text-sm">📺</span>
                            Use YouTube Photo
                          </button>
                        )}
                        {settingsData.socialConnections.pinterest?.connected && (
                          <button
                            onClick={() => useSocialAvatar('pinterest')}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            <span className="text-sm">📌</span>
                            Use Pinterest Photo
                          </button>
                        )}
                        {settingsData.socialConnections.whatsapp?.connected && (
                          <button
                            onClick={() => useSocialAvatar('whatsapp')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            <span className="text-sm">📱</span>
                            Use WhatsApp Photo
                          </button>
                        )}
                        {settingsData.socialConnections.nextdoor?.connected && (
                          <button
                            onClick={() => useSocialAvatar('nextdoor')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <span className="text-sm">🏘️</span>
                            Use Nextdoor Photo
                          </button>
                        )}
                        {settingsData.socialConnections.linkedin?.connected && (
                          <button
                            onClick={() => useSocialAvatar('linkedin')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm"
                          >
                            <span className="text-sm">💼</span>
                            Use LinkedIn Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={customer.name}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                        title="Customer full name"
                        aria-label="Customer full name"
                        />
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={customer.email}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                        title="Customer email address"
                        aria-label="Customer email address"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={settingsData.address.street}
                          onChange={(e) => {
                            setSettingsData(prev => ({
                              ...prev,
                              address: { ...prev.address, street: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="Street address"
                          aria-label="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={settingsData.address.city}
                          onChange={(e) => {
                            setSettingsData(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="City"
                          aria-label="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={settingsData.address.state}
                          onChange={(e) => {
                            setSettingsData(prev => ({
                              ...prev,
                              address: { ...prev.address, state: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="State"
                          aria-label="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={settingsData.address.zipCode}
                          onChange={(e) => {
                            setSettingsData(prev => ({
                              ...prev,
                              address: { ...prev.address, zipCode: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="ZIP code"
                          aria-label="ZIP code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                          value={settingsData.address.country}
                          onChange={(e) => {
                            setSettingsData(prev => ({
                              ...prev,
                              address: { ...prev.address, country: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="Country"
                          aria-label="Country"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landline Phone</label>
                        <input
                          type="tel"
                          value={settingsData.phoneLandline}
                          onChange={(e) => {
                            setSettingsData(prev => ({ ...prev, phoneLandline: e.target.value }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          title="Landline phone number"
                          aria-label="Landline phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          value={settingsData.phoneMobile}
                          onChange={(e) => {
                            setSettingsData(prev => ({ ...prev, phoneMobile: e.target.value }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                          placeholder="Required for SMS notifications"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMS Opt-in Section */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">SMS Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="sms-opt-in"
                      checked={settingsData.smsOptIn}
                      onChange={(e) => handleSMSOptIn(e.target.checked)}
                      className="mt-1 rounded focus:ring-2 focus:ring-brand-green"
                    />
                    <div className="flex-1">
                      <label htmlFor="sms-opt-in" className="block text-sm font-medium text-gray-700 mb-2">
                        I want to receive SMS notifications
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Get order updates, delivery notifications, and exclusive deals via text message.
                      </p>
                      {settingsData.smsOptIn && settingsData.smsConsentText && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {settingsData.smsConsentText}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Consent date: {settingsData.smsOptInDate ? new Date(settingsData.smsOptInDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Connections */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Social Media Connections</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your social media accounts to share your favorite products and deals with friends.
                  </p>
                  
                  {Object.entries(settingsData.socialConnections).map(([platform, connection]) => (
                    <div key={platform} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            platform === 'google' ? 'bg-red-500' :
                            platform === 'facebook' ? 'bg-blue-600' :
                            platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            platform === 'x' ? 'bg-black' :
                            platform === 'youtube' ? 'bg-red-600' :
                            platform === 'pinterest' ? 'bg-red-500' :
                            platform === 'whatsapp' ? 'bg-green-500' :
                            platform === 'nextdoor' ? 'bg-green-600' :
                            platform === 'linkedin' ? 'bg-blue-700' :
                            'bg-gray-400'
                          }`}>
                            <span className="text-white text-sm font-bold">
                              {platform === 'x' ? '𝕏' :
                               platform === 'youtube' ? '📺' :
                               platform === 'pinterest' ? '📌' :
                               platform === 'whatsapp' ? '📱' :
                               platform === 'nextdoor' ? '🏘️' :
                               platform === 'linkedin' ? '💼' :
                               platform.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{platform}</h3>
                            {connection.connected ? (
                              <p className="text-sm text-green-600">
                                Connected as {connection.username || connection.email}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">Not connected</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {connection.connected ? (
                            <>
                              {(platform === 'facebook' || platform === 'instagram' || platform === 'x' || platform === 'youtube' || platform === 'pinterest' || platform === 'linkedin') && (
                                <div className="flex gap-2 mr-3">
                                  <label className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={(connection as any).shareProducts || false}
                                      onChange={(e) => {
                                        setSettingsData(prev => ({
                                          ...prev,
                                          socialConnections: {
                                            ...prev.socialConnections,
                                            [platform]: {
                                              ...prev.socialConnections[platform],
                                              shareProducts: e.target.checked
                                            }
                                          }
                                        }));
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="rounded"
                                    />
                                    Share Products
                                  </label>
                                  <label className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={(connection as any).shareDeals || false}
                                      onChange={(e) => {
                                        setSettingsData(prev => ({
                                          ...prev,
                                          socialConnections: {
                                            ...prev.socialConnections,
                                            [platform]: {
                                              ...prev.socialConnections[platform],
                                              shareDeals: e.target.checked
                                            }
                                          }
                                        }));
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="rounded"
                                    />
                                    Share Deals
                                  </label>
                                </div>
                              )}
                              <button
                                onClick={() => disconnectSocialMedia(platform as 'google' | 'facebook' | 'instagram' | 'x' | 'youtube' | 'pinterest' | 'whatsapp' | 'nextdoor' | 'linkedin')}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => connectSocialMedia(platform as 'google' | 'facebook' | 'instagram' | 'x' | 'youtube' | 'pinterest' | 'whatsapp' | 'nextdoor' | 'linkedin')}
                              className="px-3 py-1 bg-brand-green text-white rounded hover:bg-brand-green/80 text-sm"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-brand-cream rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                                             <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Email Notifications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.notifications.email}
                      className="rounded focus:ring-2 focus:ring-brand-green"
                      title="Email notifications"
                           aria-label="Email notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Push Notifications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.notifications.push}
                      className="rounded focus:ring-2 focus:ring-brand-green"
                      title="Push notifications"
                           aria-label="Push notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">SMS Notifications</label>
                         <input
                           type="checkbox"
                      checked={settingsData.smsOptIn}
                      onChange={(e) => handleSMSOptIn(e.target.checked)}
                      className="rounded focus:ring-2 focus:ring-brand-green"
                      title="SMS notifications"
                           aria-label="SMS notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Marketing Communications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.marketing}
                      className="rounded focus:ring-2 focus:ring-brand-green"
                      title="Marketing communications"
                           aria-label="Marketing communications"
                         />
                       </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Default Pickup Method</label>
                                         <select
                       value={customer.preferences.defaultPickupMethod}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                      title="Default pickup method"
                       aria-label="Default pickup method"
                     >
                       <option value="pickup">Pickup</option>
                       <option value="delivery">Delivery</option>
                     </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {showSaveSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    Settings saved successfully!
                  </div>
                )}
                
                <button 
                  onClick={saveSettings}
                  disabled={isSaving || !hasUnsavedChanges}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSaving || !hasUnsavedChanges
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-green text-white hover:bg-brand-green/80'
                  }`}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : hasUnsavedChanges ? (
                    'Save All Changes'
                  ) : (
                    'No Changes to Save'
                  )}
                </button>
                
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600 text-center">
                    You have unsaved changes
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reorder Modal */}
      <AnimatePresence>
        {showReorderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReorderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reorder from {selectedOrder.vendorName}</h3>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Add these items to your cart:
                </p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{reorderQuantities[item.id] || item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/vendors/${selectedOrder.vendorId}`}
                    className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 text-center"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
