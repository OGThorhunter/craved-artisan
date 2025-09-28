'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search, ArrowLeft, Home, ShoppingCart, Users, Calendar,
  MessageCircle, HelpCircle, Phone, Mail, MapPin, Clock,
  Star, Heart, TrendingUp, Sparkles, Brain, Zap, Target,
  AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp,
  Filter, Settings, Camera, QrCode, Receipt, Download,
  Send, Plus, Minus, Trash, CreditCard, Wallet, Gift, Share2, Copy, Bell, Shield, Lock, Eye, EyeOff, Truck, Package, DollarSign, Percent, Tag, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorSuggestion {
  id: string;
  type: 'vendor' | 'product' | 'page' | 'search';
  title: string;
  description: string;
  url: string;
  confidence: number;
  icon: string;
}

interface SeasonalIllustration {
  id: string;
  name: string;
  description: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
  animation: string;
  easterEgg?: string;
}

export default function NotFoundPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [currentIllustration, setCurrentIllustration] = useState(0);
  const [suggestions, setSuggestions] = useState<ErrorSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Seasonal illustrations with easter eggs
  const illustrations: SeasonalIllustration[] = [
    {
      id: 'bread-baking',
      name: 'Bread Baking in Brick Oven',
      description: 'A cozy brick oven with artisan bread rising inside',
      season: 'all',
      animation: 'bake',
      easterEgg: 'Find the sourdough starter!'
    },
    {
      id: 'market-tent',
      name: 'Market Tent in Wind',
      description: 'A colorful market tent gently swaying in the breeze',
      season: 'spring',
      animation: 'sway'
    },
    {
      id: 'hungry-goat',
      name: 'Hungry Goat',
      description: 'Oops, Tarynn got hungry again!',
      season: 'all',
      animation: 'munch',
      easterEgg: 'Tap to feed Tarynn different treats!'
    },
    {
      id: 'fall-bakery',
      name: 'Fall Bakery Scene',
      description: 'Warm autumn colors with pumpkin bread and spices',
      season: 'fall',
      animation: 'fall'
    }
  ];

  // AI-powered error analysis and suggestions
  useEffect(() => {
    const analyzeUrl = async () => {
      setIsAnalyzing(true);
      
      // Simulate AI analysis of the failed URL
      setTimeout(() => {
        const path = location;
        const mockSuggestions: ErrorSuggestion[] = [];
        
        // Parse URL for intelligent suggestions
        if (path.includes('vendor')) {
          mockSuggestions.push({
            id: 'vendor-suggest',
            type: 'vendor',
            title: 'Looking for a vendor?',
            description: 'Browse our artisan vendors in your area',
            url: '/marketplace',
            confidence: 0.85,
            icon: '🏪'
          });
        }
        
        if (path.includes('product') || path.includes('bread') || path.includes('pastry')) {
          mockSuggestions.push({
            id: 'product-suggest',
            type: 'product',
            title: 'Search for products',
            description: 'Find artisan bread, pastries, and more',
            url: '/search',
            confidence: 0.92,
            icon: '🥖'
          });
        }
        
        if (path.includes('order') || path.includes('checkout')) {
          mockSuggestions.push({
            id: 'order-suggest',
            type: 'page',
            title: 'Order management',
            description: 'View your orders and checkout',
            url: '/dashboard/customer',
            confidence: 0.78,
            icon: '📦'
          });
        }
        
        // Always suggest trending content
        mockSuggestions.push({
          id: 'trending',
          type: 'search',
          title: 'See what\'s trending',
          description: 'Discover popular vendors and products',
          url: '/marketplace?sort=trending',
          confidence: 0.65,
          icon: '🔥'
        });
        
        setSuggestions(mockSuggestions);
        setIsAnalyzing(false);
      }, 1500);
    };

    analyzeUrl();
  }, [location]);

  const handleEasterEgg = () => {
    setEasterEggCount(prev => prev + 1);
    if (easterEggCount >= 4) {
      setEasterEggCount(0);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const getCurrentIllustration = () => {
    const season = getCurrentSeason();
    const seasonalIllustrations = illustrations.filter(ill => 
      ill.season === season || ill.season === 'all'
    );
    return seasonalIllustrations[currentIllustration % seasonalIllustrations.length];
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getSmartPlaceholder = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Looking for fresh morning bread?';
    if (hour < 17) return 'Need lunch or afternoon treats?';
    return 'Evening artisan delights?';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
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
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              404
            </h1>
            <p className="text-xl text-gray-600">
              Oops! This page seems to have wandered off...
            </p>
          </motion.div>
        </div>

        {/* Interactive Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div 
            className="relative inline-block cursor-pointer"
            onClick={handleEasterEgg}
          >
            <div className="w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-6xl">
                {getCurrentIllustration().icon || '🥖'}
              </div>
            </div>
            
            {/* Easter Egg Indicator */}
            {easterEggCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
              >
                {easterEggCount}
              </motion.div>
            )}
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            {getCurrentIllustration().description}
          </p>
          
          {getCurrentIllustration().easterEgg && (
            <p className="mt-2 text-xs text-gray-400">
              💡 {getCurrentIllustration().easterEgg}
            </p>
          )}
        </motion.div>

        {/* AI-Powered Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {isAnalyzing ? 'Analyzing your request...' : 'Smart Suggestions'}
              </h2>
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = suggestion.url}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${suggestion.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Smart Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Let's get you back on track
            </h2>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSmartPlaceholder()}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-green text-white px-4 py-2 rounded-md hover:bg-brand-green/90"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/marketplace">
                <button className="w-full p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg hover:from-amber-200 hover:to-orange-200 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-amber-600" />
                    <div>
                      <div className="font-medium text-gray-900">Browse Marketplace</div>
                      <div className="text-sm text-gray-600">Find artisan vendors</div>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/vendors">
                <button className="w-full p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">View Vendors</div>
                      <div className="text-sm text-gray-600">Meet our artisans</div>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/events">
                <button className="w-full p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg hover:from-green-200 hover:to-emerald-200 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Local Events</div>
                      <div className="text-sm text-gray-600">Markets & pop-ups</div>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/trending">
                <button className="w-full p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">What's Hot</div>
                      <div className="text-sm text-gray-600">Trending now</div>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Customer Support Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Still need help?
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setShowLiveChat(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-900">Live Chat</span>
                </div>
                <p className="text-sm text-gray-600">Get instant help from our team</p>
              </button>

              <Link href="/help">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-gray-900">Help Center</span>
                  </div>
                  <p className="text-sm text-gray-600">Browse our knowledge base</p>
                </button>
              </Link>

              <button
                onClick={() => setShowSupportModal(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <span className="font-medium text-gray-900">Contact Us</span>
                </div>
                <p className="text-sm text-gray-600">Send us a message</p>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Promo Recovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                While you're here...
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              Use code <span className="font-mono font-bold text-amber-600">FOUND10</span> for 10% off your next order!
            </p>
            <Link href="/marketplace">
              <button className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Live Chat Widget */}
      {showLiveChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg border shadow-lg z-50">
          <div className="p-4 border-b bg-brand-green text-white rounded-t-lg">
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
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Need help finding something?</p>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <button className="px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contact Support</h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Failed URL:</p>
                <p className="font-mono text-xs text-gray-800 break-all">{location}</p>
              </div>

              <div className="space-y-3">
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Call Us</div>
                      <div className="text-sm text-gray-600">(555) 123-4567</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-600">support@cravedartisan.com</div>
                    </div>
                  </div>
                </button>

                <Link href="/help">
                  <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Help Center</div>
                        <div className="text-sm text-gray-600">Browse articles & guides</div>
                      </div>
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
