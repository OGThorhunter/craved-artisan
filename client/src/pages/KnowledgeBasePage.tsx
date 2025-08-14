'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  Search, BookOpen, Video, FileText, Download, Play, 
  MessageCircle, HelpCircle, Star, Clock, Eye, ThumbsUp,
  ThumbsDown, ChevronRight, ChevronDown, Filter, Grid,
  List, Mic, Brain, Award, GraduationCap, Users, Settings,
  ShoppingCart, Package, Calendar, MapPin, CreditCard,
  AlertCircle, CheckCircle, X, Plus, Minus, Share2,
  Bookmark, ExternalLink, Volume2, VolumeX, Maximize2,
  Minimize2, RotateCcw, SkipForward, SkipBack, Pause,
  Play as PlayIcon, Pause as PauseIcon, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon, Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon, RotateCcw as RotateCcwIcon,
  SkipForward as SkipForwardIcon, SkipBack as SkipBackIcon,
  Play as PlayIcon2, Pause as PauseIcon2, Volume2 as Volume2Icon2,
  VolumeX as VolumeXIcon2, Maximize2 as Maximize2Icon2,
  Minimize2 as Minimize2Icon2, RotateCcw as RotateCcwIcon2,
  SkipForward as SkipForwardIcon2, SkipBack as SkipBackIcon2,
  Play as PlayIcon3, Pause as PauseIcon3, Volume2 as Volume2Icon3,
  VolumeX as VolumeXIcon3, Maximize2 as Maximize2Icon3,
  Minimize2 as Minimize2Icon3, RotateCcw as RotateCcwIcon3,
  SkipForward as SkipForwardIcon3, SkipBack as SkipBackIcon3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subcategory: string;
  tags: string[];
  role: 'vendor' | 'customer' | 'supplier' | 'coordinator' | 'dropoff' | 'admin';
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  videoUrl?: string;
  pdfUrl?: string;
  interactiveDemo?: string;
  relatedArticles: string[];
  featured: boolean;
  aiGenerated: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  role: string;
  duration: number; // in days
  modules: Array<{
    id: string;
    title: string;
    description: string;
    type: 'video' | 'article' | 'interactive' | 'quiz';
    duration: number; // in minutes
    completed: boolean;
    required: boolean;
  }>;
  progress: number;
  certificate: boolean;
  featured: boolean;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  userRole: string;
  attachments: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'agent';
  content: string;
  timestamp: string;
  attachments?: string[];
  suggestedActions?: string[];
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showUniversity, setShowUniversity] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'university' | 'chat' | 'tickets'>('articles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [userRole, setUserRole] = useState('vendor'); // Mock user role
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockArticles: KnowledgeArticle[] = [
      {
        id: 'art1',
        title: 'Getting Started with Inventory Management',
        content: `
          <h2>Welcome to Craved Artisan Inventory Management</h2>
          <p>This comprehensive guide will walk you through setting up and managing your inventory effectively.</p>
          
          <h3>Step 1: Initial Setup</h3>
          <p>Begin by accessing your vendor dashboard and navigating to the Inventory tab...</p>
          
          <h3>Step 2: Adding Products</h3>
          <p>Use the "Add Product" button to create new inventory items...</p>
          
          <h3>Step 3: Setting Stock Levels</h3>
          <p>Configure minimum and maximum stock levels for each product...</p>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Update inventory daily</li>
            <li>Set realistic stock levels</li>
            <li>Use batch pricing for efficiency</li>
            <li>Monitor low stock alerts</li>
          </ul>
        `,
        excerpt: 'Learn how to set up and manage your inventory effectively with our step-by-step guide.',
        category: 'Inventory Management',
        subcategory: 'Setup',
        tags: ['inventory', 'setup', 'beginner', 'products'],
        role: 'vendor',
        readTime: 8,
        difficulty: 'beginner',
        lastUpdated: '2024-02-15T10:00:00Z',
        author: 'Craved Artisan Team',
        views: 1247,
        helpful: 89,
        notHelpful: 3,
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        pdfUrl: '/downloads/inventory-setup-guide.pdf',
        interactiveDemo: '/demos/inventory-setup',
        relatedArticles: ['art2', 'art3'],
        featured: true,
        aiGenerated: false
      },
      {
        id: 'art2',
        title: 'Advanced Order Management for Vendors',
        content: `
          <h2>Mastering Order Management</h2>
          <p>Take your order management to the next level with advanced features and automation.</p>
          
          <h3>Bulk Order Processing</h3>
          <p>Learn how to efficiently process multiple orders simultaneously...</p>
          
          <h3>Automated Notifications</h3>
          <p>Set up automated customer notifications for order status updates...</p>
          
          <h3>Analytics and Reporting</h3>
          <p>Generate detailed reports to track your order performance...</p>
        `,
        excerpt: 'Advanced techniques for managing orders efficiently and improving customer satisfaction.',
        category: 'Order Management',
        subcategory: 'Advanced',
        tags: ['orders', 'automation', 'analytics', 'advanced'],
        role: 'vendor',
        readTime: 12,
        difficulty: 'advanced',
        lastUpdated: '2024-02-14T15:30:00Z',
        author: 'Sarah Johnson',
        views: 856,
        helpful: 67,
        notHelpful: 2,
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        relatedArticles: ['art1', 'art4'],
        featured: false,
        aiGenerated: true
      },
      {
        id: 'art3',
        title: 'Customer Guide: Finding Local Artisan Products',
        content: `
          <h2>Discover Amazing Local Artisan Products</h2>
          <p>Learn how to find and order the best local artisan products in your area.</p>
          
          <h3>Using the Search Feature</h3>
          <p>Our advanced search helps you find exactly what you're looking for...</p>
          
          <h3>Filtering by Dietary Preferences</h3>
          <p>Filter products by vegan, gluten-free, and other dietary requirements...</p>
          
          <h3>Reading Product Reviews</h3>
          <p>Make informed decisions by reading customer reviews and ratings...</p>
        `,
        excerpt: 'A comprehensive guide for customers on how to discover and order local artisan products.',
        category: 'Customer Guide',
        subcategory: 'Discovery',
        tags: ['customer', 'search', 'products', 'beginner'],
        role: 'customer',
        readTime: 5,
        difficulty: 'beginner',
        lastUpdated: '2024-02-13T09:15:00Z',
        author: 'Craved Artisan Team',
        views: 2341,
        helpful: 156,
        notHelpful: 8,
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        relatedArticles: ['art5', 'art6'],
        featured: true,
        aiGenerated: false
      }
    ];

    const mockLearningPaths: LearningPath[] = [
      {
        id: 'path1',
        title: 'Vendor Mastery Program',
        description: 'Complete 5-day program to master all vendor features and maximize your business potential.',
        role: 'vendor',
        duration: 5,
        modules: [
          {
            id: 'mod1',
            title: 'Day 1: Getting Started',
            description: 'Setup your store and learn the basics',
            type: 'video',
            duration: 45,
            completed: true,
            required: true
          },
          {
            id: 'mod2',
            title: 'Day 2: Inventory Management',
            description: 'Master inventory setup and management',
            type: 'interactive',
            duration: 60,
            completed: true,
            required: true
          },
          {
            id: 'mod3',
            title: 'Day 3: Order Processing',
            description: 'Learn efficient order management',
            type: 'article',
            duration: 30,
            completed: false,
            required: true
          },
          {
            id: 'mod4',
            title: 'Day 4: Marketing & Analytics',
            description: 'Grow your business with data insights',
            type: 'video',
            duration: 50,
            completed: false,
            required: true
          },
          {
            id: 'mod5',
            title: 'Day 5: Advanced Features',
            description: 'Master advanced tools and automation',
            type: 'interactive',
            duration: 75,
            completed: false,
            required: true
          }
        ],
        progress: 40,
        certificate: true,
        featured: true
      },
      {
        id: 'path2',
        title: 'Customer Discovery Journey',
        description: 'Learn how to find and order the best local artisan products.',
        role: 'customer',
        duration: 3,
        modules: [
          {
            id: 'mod6',
            title: 'Finding Products',
            description: 'Learn to search and filter effectively',
            type: 'video',
            duration: 20,
            completed: true,
            required: true
          },
          {
            id: 'mod7',
            title: 'Placing Orders',
            description: 'Master the ordering process',
            type: 'interactive',
            duration: 25,
            completed: false,
            required: true
          },
          {
            id: 'mod8',
            title: 'Managing Your Account',
            description: 'Track orders and manage preferences',
            type: 'article',
            duration: 15,
            completed: false,
            required: true
          }
        ],
        progress: 33,
        certificate: false,
        featured: false
      }
    ];

    setArticles(mockArticles);
    setLearningPaths(mockLearningPaths);
    setFilteredArticles(mockArticles);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article => {
      const queryLower = query.toLowerCase();
      return (
        article.title.toLowerCase().includes(queryLower) ||
        article.excerpt.toLowerCase().includes(queryLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        article.category.toLowerCase().includes(queryLower)
      );
    });

    setFilteredArticles(filtered);
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    filterArticles();
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterArticles();
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedRole !== 'all') {
      filtered = filtered.filter(article => article.role === selectedRole);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    if (article.videoUrl) {
      setVideoUrl(article.videoUrl);
    }
  };

  const handleChatSubmit = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I found some helpful information about "${message}". Let me show you the most relevant articles...`,
        timestamp: new Date().toISOString(),
        suggestedActions: ['Show related articles', 'Start a support ticket', 'Watch tutorial video']
      };

      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleHelpful = (articleId: string, helpful: boolean) => {
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          helpful: helpful ? article.helpful + 1 : article.helpful,
          notHelpful: !helpful ? article.notHelpful + 1 : article.notHelpful
        };
      }
      return article;
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vendor': return <Package className="w-4 h-4" />;
      case 'customer': return <ShoppingCart className="w-4 h-4" />;
      case 'coordinator': return <Calendar className="w-4 h-4" />;
      case 'dropoff': return <MapPin className="w-4 h-4" />;
      case 'admin': return <Settings className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Base & Support</h1>
              <p className="text-gray-600">Find answers, learn features, and get help when you need it</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </button>
              <button
                onClick={() => setShowUniversity(!showUniversity)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600/90"
              >
                <GraduationCap className="w-4 h-4" />
                Craved University
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for help articles, tutorials, or ask a question..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              
              {/* AI Search Indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-green" />
                <span className="text-xs text-gray-500">AI Powered</span>
              </div>
            </div>

            <button
              onClick={() => {/* Voice search */}}
              className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Popular searches:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['How to add inventory?', 'Reset password', 'Update payment method', 'Contact support'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'articles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Help Articles
          </button>
          <button
            onClick={() => setActiveTab('university')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'university' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <GraduationCap className="w-4 h-4 inline mr-2" />
            Craved University
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Support Tickets
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'articles' && (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm text-brand-green hover:text-brand-green/80"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showFilters && (
                  <div className="space-y-6">
                    {/* Role Filter */}
                    <div>
                      <h4 className="font-medium mb-3">Your Role</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Roles', icon: <Users className="w-4 h-4" /> },
                          { value: 'vendor', label: 'Vendor', icon: <Package className="w-4 h-4" /> },
                          { value: 'customer', label: 'Customer', icon: <ShoppingCart className="w-4 h-4" /> },
                          { value: 'coordinator', label: 'Event Coordinator', icon: <Calendar className="w-4 h-4" /> },
                          { value: 'dropoff', label: 'Drop-off Location', icon: <MapPin className="w-4 h-4" /> },
                          { value: 'admin', label: 'Admin', icon: <Settings className="w-4 h-4" /> }
                        ].map((role) => (
                          <button
                            key={role.value}
                            onClick={() => handleRoleFilter(role.value)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                              selectedRole === role.value ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {role.icon}
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h4 className="font-medium mb-3">Category</h4>
                      <div className="space-y-2">
                        {['all', 'Inventory Management', 'Order Management', 'Customer Guide', 'Payment', 'Technical'].map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryFilter(category)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                              selectedCategory === category ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {category === 'all' ? 'All Categories' : category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <h4 className="font-medium mb-3">Difficulty</h4>
                      <div className="space-y-2">
                        {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                          <label key={difficulty} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                            />
                            <span className="text-sm capitalize">{difficulty}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {filteredArticles.length} Articles Found
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-600">for "{searchQuery}"</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}>
                {filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(article.role)}
                          <span className="text-xs text-gray-500 capitalize">{article.role}</span>
                        </div>
                        {article.featured && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{article.excerpt}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {article.readTime} min read
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {article.videoUrl && (
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                          {article.pdfUrl && (
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                              <Download className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'university' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Craved University</h2>
              <p className="text-gray-600">Structured learning paths to master your role and maximize your success</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.map((path) => (
                <div key={path.id} className="bg-white rounded-lg border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                      <p className="text-gray-600 mb-3">{path.description}</p>
                    </div>
                    {path.featured && (
                      <Award className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand-green h-2 rounded-full transition-all"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {path.modules.map((module) => (
                      <div key={module.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          module.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{module.title}</h4>
                          <p className="text-xs text-gray-500">{module.duration} min • {module.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-2">Live Chat Support</h2>
                <p className="text-gray-600">Get instant help from our AI assistant or connect with a human agent</p>
              </div>

              <div className="h-96 overflow-y-auto p-6">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-600">Ask any question and get instant help</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-brand-green text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.suggestedActions && (
                            <div className="mt-2 space-y-1">
                              {message.suggestedActions.map((action, index) => (
                                <button
                                  key={index}
                                  className="block w-full text-left text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30"
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleChatSubmit(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Support Tickets</h2>
              <p className="text-gray-600">Track and manage your support requests</p>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Tickets</h3>
                  <button className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    <Plus className="w-4 h-4 inline mr-2" />
                    New Ticket
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600 mb-4">Create a new support ticket to get help with specific issues</p>
                  <button className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    Create Your First Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(selectedArticle.role)}
                    <span className="text-sm text-gray-500 capitalize">{selectedArticle.role}</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getDifficultyColor(selectedArticle.difficulty)}`}>
                      {selectedArticle.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime} min read
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views} views
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  Updated {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              {selectedArticle.videoUrl && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600/90"
                  >
                    <Play className="w-4 h-4" />
                    Watch Tutorial Video
                  </button>
                </div>
              )}

              <div 
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <button
                    onClick={() => handleHelpful(selectedArticle.id, true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes ({selectedArticle.helpful})
                  </button>
                  <button
                    onClick={() => handleHelpful(selectedArticle.id, false)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No ({selectedArticle.notHelpful})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedArticle.pdfUrl && (
                    <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg border shadow-lg z-40">
          <div className="p-4 border-b bg-brand-green text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Live Chat</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="h-64 overflow-y-auto p-4">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Start a conversation to get help</p>
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
    </div>
  );
}
