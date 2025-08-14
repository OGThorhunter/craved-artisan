'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Clock, Bell, Mail, Phone, MessageCircle, HelpCircle,
  AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp,
  Settings, Camera, QrCode, Receipt, Download, Print, Send,
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

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo>({
    scheduled: true,
    startTime: new Date().toISOString(),
    estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
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

  // Mock system status data
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

  // Countdown timer
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
    // Mock notification signup
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
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

        {/* Countdown Timer */}
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

        {/* Live System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              System Status
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {systemStatus.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium text-gray-900">{service.service}</div>
                      <div className="text-sm text-gray-600">
                        {service.uptime}% uptime • {service.responseTime}ms
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Maintenance Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                What We're Working On
              </h2>
              {maintenanceInfo.changelog && (
                <button
                  onClick={() => setShowChangelog(!showChangelog)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  {showChangelog ? 'Hide' : 'Show'} changelog
                  {showChangelog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Reason for Maintenance</h3>
                <p className="text-gray-600">{maintenanceInfo.reason}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Affected Services</h3>
                <div className="flex flex-wrap gap-2">
                  {maintenanceInfo.affectedServices.map((service) => (
                    <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              {showChangelog && maintenanceInfo.changelog && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-blue-50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 mb-2">What's New</h3>
                  <p className="text-gray-700 text-sm">{maintenanceInfo.changelog}</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Opt-In Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8">
            <div className="text-center mb-6">
              <Bell className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Get Notified When We're Back
              </h2>
              <p className="text-gray-600">
                We'll send you a fresh loaf when we're back online! 🥖
              </p>
            </div>
            
            <form onSubmit={handleNotificationSignup} className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.sms}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, sms: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">SMS notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.push}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, push: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Push notifications</span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Notify Me When Back Online
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Alternative Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              While You Wait
            </h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="https://blog.cravedartisan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Read Our Blog</h3>
                <p className="text-sm text-gray-600">Artisan stories & recipes</p>
              </a>
              
              <a
                href="https://instagram.com/cravedartisan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Follow on Instagram</h3>
                <p className="text-sm text-gray-600">Behind-the-scenes content</p>
              </a>
              
              <button
                onClick={() => setShowLiveChat(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Chat with Us</h3>
                <p className="text-sm text-gray-600">Get help & updates</p>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Need Immediate Help?
            </h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Call Us</h3>
                <p className="text-sm text-gray-600">(555) 123-4567</p>
                <p className="text-xs text-gray-500">24/7 Support</p>
              </div>
              
              <div className="p-4">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
                <p className="text-sm text-gray-600">support@cravedartisan.com</p>
                <p className="text-xs text-gray-500">Response within 1 hour</p>
              </div>
              
              <div className="p-4">
                <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Help Center</h3>
                <p className="text-sm text-gray-600">Browse articles & guides</p>
                <p className="text-xs text-gray-500">Self-service support</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Live Chat Widget */}
      {showLiveChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg border shadow-lg z-50">
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Live Chat</span>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="h-64 overflow-y-auto p-4">
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600">We're currently in maintenance mode</p>
              <p className="text-xs text-gray-500 mt-1">Chat will be available soon!</p>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Chat will be available soon..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                disabled
              />
              <button className="px-3 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
