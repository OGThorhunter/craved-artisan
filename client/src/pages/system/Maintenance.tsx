'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Clock, Bell, Mail, Phone, MessageCircle, HelpCircle,
  AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp,
  Settings, Camera, QrCode, Receipt, Download, Send,
  ShoppingCart, Users, Calendar, Star, Heart, TrendingUp,
  Sparkles, Brain, Zap, Target, ArrowRight, ArrowLeft,
  Filter, Search, Plus, Minus, Trash, MapPin, CreditCard, Wallet, Gift, Share2, Copy, Shield, Lock, Eye, EyeOff, Truck, Package, DollarSign, Percent, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastUpdated: string;
}

interface MaintenanceInfo {
  scheduled: boolean;
  startTime: string;
  estimatedEndTime: string;
  reason: string;
  affectedServices: string[];
  changelog?: string;
  emergency?: boolean;
}

interface NotificationPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export default function Maintenance() {
  const [countdown, setCountdown] = useState(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo>({
    scheduled: true,
    startTime: new Date().toISOString(),
    estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    reason: 'Scheduled system updates and performance improvements',
    affectedServices: ['API', 'Database', 'Payment Processing'],
    changelog: 'Enhanced search functionality, improved checkout flow, and new vendor analytics dashboard'
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference>({
    email: true,
    sms: false,
    push: true
  });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showChangelog, setShowChangelog] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'vendor' | 'admin'>('customer');
  const [userLocation, setUserLocation] = useState<string>('checkout');

  useEffect(() => {
    const mockStatus: SystemStatus[] = [
      {
        service: 'API',
        status: 'maintenance',
        uptime: 99.8,
        responseTime: 150,
        lastUpdated: new Date().toISOString()
      },
      {
        service: 'Database',
        status: 'maintenance',
        uptime: 99.9,
        responseTime: 45,
        lastUpdated: new Date().toISOString()
      },
      {
        service: 'Payment Processing',
        status: 'maintenance',
        uptime: 99.7,
        responseTime: 200,
        lastUpdated: new Date().toISOString()
      },
      {
        service: 'CDN',
        status: 'operational',
        uptime: 99.9,
        responseTime: 25,
        lastUpdated: new Date().toISOString()
      }
    ];
    setSystemStatus(mockStatus);
  }, []);

  useEffect(() => {
    const endTime = new Date(maintenanceInfo.estimatedEndTime).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = Math.max(0, endTime - now);
      setCountdown(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [maintenanceInfo.estimatedEndTime]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getContextAwareMessage = () => {
    const hour = new Date().getHours();
    const isLateNight = hour >= 22 || hour <= 6;
    
    if (userLocation === 'checkout') {
      return "We're kneading in a quick fix to keep orders flowing smoothly. Your cart is safe and we'll be back shortly!";
    }
    
    if (userRole === 'vendor') {
      return "We're upgrading your vendor dashboard with new analytics and tools. You'll love the improvements!";
    }
    
    if (isLateNight) {
      return "Even artisans need to sleep. We'll rise soon like our dough, fresh and ready to serve you.";
    }
    
    return "We're baking something special for you! Our team is working hard to bring you an even better experience.";
  };

  const handleNotificationSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Notification signup:', { email, phone, notificationPrefs });
    alert('Thanks! We\'ll send you a fresh loaf when we\'re back online! 🥖');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'down': return <X className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Settings className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              We're Baking Something Special
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {getContextAwareMessage()}
            </p>
            
            {maintenanceInfo.emergency && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4" />
                Emergency Maintenance
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Estimated Return Time
              </h2>
            </div>
            
            <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
              {formatTime(countdown)}
            </div>
            
            <p className="text-gray-600">
              Back by {new Date(maintenanceInfo.estimatedEndTime).toLocaleTimeString()} EST
            </p>
          </div>
        </motion.div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

