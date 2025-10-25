'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  Search, Filter, MapPin, Clock, Star, Heart, ShoppingCart, 
  Plus, Minus, X, ChevronDown, ChevronUp, Mic, Camera,
  TrendingUp, Sparkles, Brain, Target, Globe, Tag,
  Users, Package, Calendar, DollarSign, Award, Zap,
  Eye, Share2, Download, Upload, Settings, BarChart3,
  Activity, ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertCircle, Info, Clock as ClockIcon, Star as StarIcon,
  Heart as HeartIcon, ShoppingCart as ShoppingCartIcon,
  Plus as PlusIcon, Minus as MinusIcon, X as XIcon,
  ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon,
  Mic as MicIcon, Camera as CameraIcon, TrendingUp as TrendingUpIcon,
  Sparkles as SparklesIcon, Brain as BrainIcon, Target as TargetIcon,
  Globe as GlobeIcon, Tag as TagIcon, Users as UsersIcon,
  Package as PackageIcon, Calendar as CalendarIcon,
  DollarSign as DollarSignIcon, Award as AwardIcon,
  Grid, List,
  Zap as ZapIcon, Eye as EyeIcon, Share2 as Share2Icon,
  Download as DownloadIcon, Upload as UploadIcon,
  Settings as SettingsIcon, BarChart3 as BarChart3Icon,
  Activity as ActivityIcon, ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon, CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon, Info as InfoIcon,
  Clock as ClockIcon2, Star as StarIcon2, Heart as HeartIcon2,
  ShoppingCart as ShoppingCartIcon2, Plus as PlusIcon2,
  Minus as MinusIcon2, X as XIcon2, ChevronDown as ChevronDownIcon2,
  ChevronUp as ChevronUpIcon2, Mic as MicIcon2, Camera as CameraIcon2,
  TrendingUp as TrendingUpIcon2, Sparkles as SparklesIcon2,
  Brain as BrainIcon2, Target as TargetIcon2, Globe as GlobeIcon2,
  Tag as TagIcon2, Users as UsersIcon2, Package as PackageIcon2,
  Calendar as CalendarIcon2, DollarSign as DollarSignIcon2,
  Award as AwardIcon2, Zap as ZapIcon2, Eye as EyeIcon2,
  Share2 as Share2Icon2, Download as DownloadIcon2,
  Upload as UploadIcon2, Settings as SettingsIcon2,
  BarChart3 as BarChart3Icon2, Activity as ActivityIcon2,
  ArrowUpRight as ArrowUpRightIcon2, ArrowDownRight as ArrowDownRightIcon2,
  CheckCircle as CheckCircleIcon2, AlertCircle as AlertCircleIcon2,
  Info as InfoIcon2, Clock as ClockIcon3, Star as StarIcon3,
  Heart as HeartIcon3, ShoppingCart as ShoppingCartIcon3,
  Plus as PlusIcon3, Minus as MinusIcon3, X as XIcon3,
  ChevronDown as ChevronDownIcon3, ChevronUp as ChevronUpIcon3,
  Mic as MicIcon3, Camera as CameraIcon3, TrendingUp as TrendingUpIcon3,
  Sparkles as SparklesIcon3, Brain as BrainIcon3, Target as TargetIcon3,
  Globe as GlobeIcon3, Tag as TagIcon3, Users as UsersIcon3,
  Package as PackageIcon3, Calendar as CalendarIcon3,
  DollarSign as DollarSignIcon3, Award as AwardIcon3,
  Zap as ZapIcon3, Eye as EyeIcon3, Share2 as Share2Icon3,
  Download as DownloadIcon3, Upload as UploadIcon3,
  Settings as SettingsIcon3, BarChart3 as BarChart3Icon3,
  Activity as ActivityIcon3, ArrowUpRight as ArrowUpRightIcon3,
  ArrowDownRight as ArrowDownRightIcon3, CheckCircle as CheckCircleIcon3,
  AlertCircle as AlertCircleIcon3, Info as InfoIcon3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'product' | 'vendor' | 'category';
  title: string;
  description: string;
  image: string;
  price?: number;
  vendor?: string;
  vendorId?: string;
  category: string;
  tags: string[];
  distance?: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';
  pickupDate?: string;
  deliveryDate?: string;
  rating: number;
  reviewCount: number;
  relevancyScore: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  allergens: string[];
  dietaryTags: string[];
  vendorTags: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  vendorCount: number;
  subcategories: string[];
  tags: string[];
  seasonal: boolean;
  featured: boolean;
  aiGenerated: boolean;
  autoRules: string[];
  expiryDate?: string;
}

interface SearchFilter {
  id: string;
  type: 'category' | 'ingredient' | 'dietary' | 'vendor' | 'location' | 'date' | 'price' | 'rating' | 'availability';
  label: string;
  value: any;
  operator: 'include' | 'exclude' | 'equals' | 'range' | 'near';
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'autocomplete' | 'correction' | 'synonym' | 'popular' | 'ai-generated';
  confidence: number;
  searchCount?: number;
}

interface SearchAnalytics {
  totalSearches: number;
  topQueries: Array<{
    query: string;
    count: number;
    conversionRate: number;
  }>;
  noResultQueries: Array<{
    query: string;
    count: number;
    suggestedCategories: string[];
  }>;
  topCategories: Array<{
    category: string;
    searches: number;
    conversions: number;
  }>;
  heatmapData: Array<{
    zipCode: string;
    query: string;
    searches: number;
    conversions: number;
  }>;
}

export default function AdvancedSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image'>('text');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'distance' | 'rating' | 'newest'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userZipCode, setUserZipCode] = useState('30248');
  const [isRecording, setIsRecording] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: 'cat1',
        name: 'Artisan Breads',
        description: 'Freshly baked artisan breads and pastries',
        image: '/images/categories/bread.jpg',
        productCount: 45,
        vendorCount: 12,
        subcategories: ['Sourdough', 'Whole Grain', 'Gluten-Free', 'Sweet Breads'],
        tags: ['fresh', 'artisan', 'baked'],
        seasonal: false,
        featured: true,
        aiGenerated: false,
        autoRules: ['If product includes "bread" → put in "Artisan Breads"']
      },
      {
        id: 'cat2',
        name: 'Vegan Delights',
        description: 'Plant-based products for conscious consumers',
        image: '/images/categories/vegan.jpg',
        productCount: 32,
        vendorCount: 8,
        subcategories: ['Vegan Meats', 'Dairy Alternatives', 'Vegan Desserts'],
        tags: ['vegan', 'plant-based', 'dairy-free'],
        seasonal: false,
        featured: true,
        aiGenerated: true,
        autoRules: ['If product tagged "vegan" → put in "Vegan Delights"']
      },
      {
        id: 'cat3',
        name: 'Back to School Specials',
        description: 'Nutritious snacks and meals for students',
        image: '/images/categories/back-to-school.jpg',
        productCount: 28,
        vendorCount: 6,
        subcategories: ['Lunch Box Items', 'Healthy Snacks', 'Quick Meals'],
        tags: ['school', 'lunch', 'snacks'],
        seasonal: true,
        featured: true,
        aiGenerated: true,
        autoRules: [],
        expiryDate: '2024-09-30T00:00:00Z'
      }
    ];

    const mockSearchResults: SearchResult[] = [
      {
        id: 'p1',
        type: 'product',
        title: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread made with organic flour',
        image: '/images/products/sourdough.jpg',
        price: 8.50,
        vendor: 'Rose Creek Bakery',
        vendorId: 'v1',
        category: 'Artisan Breads',
        tags: ['sourdough', 'organic', 'traditional'],
        distance: 2.3,
        availability: 'in-stock',
        pickupDate: '2024-02-16T10:00:00Z',
        rating: 4.8,
        reviewCount: 127,
        relevancyScore: 0.95,
        nutritionalInfo: {
          calories: 120,
          protein: 4,
          carbs: 22,
          fat: 1,
          fiber: 2,
          sugar: 1
        },
        allergens: ['wheat', 'gluten'],
        dietaryTags: ['vegetarian'],
        vendorTags: ['local', 'organic', 'artisan']
      },
      {
        id: 'p2',
        type: 'product',
        title: 'Vegan Chocolate Chip Cookies',
        description: 'Delicious vegan cookies with dark chocolate chips',
        image: '/images/products/vegan-cookies.jpg',
        price: 6.00,
        vendor: 'Sweet Treats Co',
        vendorId: 'v2',
        category: 'Vegan Delights',
        tags: ['vegan', 'cookies', 'chocolate'],
        distance: 5.1,
        availability: 'in-stock',
        pickupDate: '2024-02-16T14:00:00Z',
        rating: 4.6,
        reviewCount: 89,
        relevancyScore: 0.87,
        nutritionalInfo: {
          calories: 180,
          protein: 2,
          carbs: 25,
          fat: 8,
          fiber: 1,
          sugar: 12
        },
        allergens: ['nuts'],
        dietaryTags: ['vegan', 'dairy-free'],
        vendorTags: ['vegan', 'local']
      }
    ];

    const mockSuggestions: SearchSuggestion[] = [
      {
        id: 's1',
        text: 'vegan bread',
        type: 'autocomplete',
        confidence: 0.92,
        searchCount: 156
      },
      {
        id: 's2',
        text: 'gluten-free sourdough',
        type: 'correction',
        confidence: 0.85,
        searchCount: 23
      },
      {
        id: 's3',
        text: 'dairy-free pastries',
        type: 'synonym',
        confidence: 0.78,
        searchCount: 67
      },
      {
        id: 's4',
        text: 'organic bread near me',
        type: 'popular',
        confidence: 0.95,
        searchCount: 234
      }
    ];

    const mockAnalytics: SearchAnalytics = {
      totalSearches: 15420,
      topQueries: [
        { query: 'vegan bread', count: 234, conversionRate: 0.15 },
        { query: 'gluten-free', count: 189, conversionRate: 0.12 },
        { query: 'sourdough', count: 156, conversionRate: 0.18 }
      ],
      noResultQueries: [
        { query: 'keto bread', count: 45, suggestedCategories: ['Low-Carb Options', 'Keto-Friendly'] },
        { query: 'paleo desserts', count: 23, suggestedCategories: ['Paleo-Friendly', 'Grain-Free'] }
      ],
      topCategories: [
        { category: 'Artisan Breads', searches: 1234, conversions: 156 },
        { category: 'Vegan Delights', searches: 987, conversions: 134 },
        { category: 'Gluten-Free', searches: 756, conversions: 89 }
      ],
      heatmapData: [
        { zipCode: '30248', query: 'vegan bread', searches: 45, conversions: 8 },
        { zipCode: '30301', query: 'sourdough', searches: 67, conversions: 12 }
      ]
    };

    setCategories(mockCategories);
    setSearchResults(mockSearchResults);
    setSuggestions(mockSuggestions);
    setAnalytics(mockAnalytics);
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock semantic search results
    const semanticResults = searchResults.filter(result => {
      const queryLower = query.toLowerCase();
      const titleMatch = result.title.toLowerCase().includes(queryLower);
      const descriptionMatch = result.description.toLowerCase().includes(queryLower);
      const tagMatch = result.tags.some(tag => tag.toLowerCase().includes(queryLower));
      const dietaryMatch = result.dietaryTags.some(tag => tag.toLowerCase().includes(queryLower));
      
      return titleMatch || descriptionMatch || tagMatch || dietaryMatch;
    });

    setSearchResults(semanticResults);
    setLoading(false);
  };

  const handleVoiceSearch = () => {
    setIsRecording(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsRecording(false);
      const voiceQuery = 'vegan bread near me';
      setSearchQuery(voiceQuery);
      handleSearch(voiceQuery);
    }, 3000);
  };

  const handleImageSearch = (file: File) => {
    setImageUpload(file);
    // Simulate image analysis
    setTimeout(() => {
      const imageQuery = 'artisan bread similar to uploaded image';
      setSearchQuery(imageQuery);
      handleSearch(imageQuery);
      setImageUpload(null);
    }, 2000);
  };

  const addFilter = (filter: SearchFilter) => {
    setFilters(prev => [...prev, filter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'pre-order': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
              <p className="text-gray-600">Find exactly what you're looking for with AI-powered search</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Search Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMode('text')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  searchMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={handleVoiceSearch}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  searchMode === 'voice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
                disabled={isRecording}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
              </button>
              <label className="px-3 py-2 text-sm rounded-md transition-colors cursor-pointer text-gray-600 hover:text-gray-900">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageSearch(e.target.files[0])}
                />
              </label>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Search for products, vendors, or categories... (Try: 'vegan bread near me')"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              
              {/* AI Search Indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-green" />
                <span className="text-xs text-gray-500">AI Powered</span>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={loading}
              className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-green" />
                <span className="text-sm text-gray-600">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSearch(suggestion.text)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion.text}
                    {suggestion.type === 'popular' && (
                      <TrendingUp className="w-3 h-3 inline ml-1 text-brand-green" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                  {/* Categories */}
                  <div>
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategory === category.id}
                            onChange={(e) => setSelectedCategory(e.target.checked ? category.id : null)}
                            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm">{category.name}</span>
                          <span className="text-xs text-gray-500">({category.productCount})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div>
                    <h4 className="font-medium mb-3">Dietary Preferences</h4>
                    <div className="space-y-2">
                      {['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((pref) => (
                        <label key={pref} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>$0</span>
                        <span>$50</span>
                      </div>
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <h4 className="font-medium mb-3">Distance</h4>
                    <div className="space-y-2">
                      {['Within 5 miles', 'Within 10 miles', 'Within 25 miles', 'Any distance'].map((distance) => (
                        <label key={distance} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="distance"
                            className="border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm">{distance}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium mb-3">Availability</h4>
                    <div className="space-y-2">
                      {['In Stock', 'Low Stock', 'Pre-Order', 'Out of Stock'].map((availability) => (
                        <label key={availability} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm">{availability}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {loading ? 'Searching...' : `${searchResults.length} Results`}
                </h2>
                {searchQuery && (
                  <span className="text-gray-600">for "{searchQuery}"</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
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

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price">Sort by Price</option>
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {filters.map((filter) => (
                    <span
                      key={filter.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-sm"
                    >
                      {filter.label}: {filter.value}
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="ml-1 hover:text-brand-green/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setFilters([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Search Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching with AI...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}>
                {searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getAvailabilityColor(result.availability)}`}>
                          {result.availability.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{result.title}</h3>
                        {result.price && (
                          <span className="font-bold text-brand-green">${result.price}</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{result.description}</p>

                      {result.vendor && (
                        <Link href={`/vendors/${result.vendorId}`}>
                          <span className="text-sm text-brand-green hover:text-brand-green/80 cursor-pointer">
                            {result.vendor}
                          </span>
                        </Link>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(result.rating)}
                        </div>
                        <span className="text-sm text-gray-600">({result.reviewCount})</span>
                        {result.distance && (
                          <span className="text-sm text-gray-500">• {result.distance} mi</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {result.dietaryTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Brain className="w-4 h-4 text-brand-green" />
                          {Math.round(result.relevancyScore * 100)}% match
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-brand-green" />
                  <span className="text-sm text-gray-500">AI is learning from this query to improve future searches</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your search</h3>
                <p className="text-gray-600">Try searching for products, vendors, or categories</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Search Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Queries */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Top Search Queries</h3>
                <div className="space-y-2">
                  {analytics.topQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{query.query}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{query.count} searches</span>
                        <span className="text-xs text-green-600">{query.conversionRate * 100}% conversion</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* No Result Queries */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">No Result Queries</h3>
                <div className="space-y-2">
                  {analytics.noResultQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{query.query}</span>
                      <span className="text-xs text-gray-500">{query.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Top Categories</h3>
                <div className="space-y-2">
                  {analytics.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{category.searches} searches</span>
                        <span className="text-xs text-green-600">{category.conversions} conversions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap Data */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Geographic Heatmap</h3>
                <div className="space-y-2">
                  {analytics.heatmapData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{data.zipCode}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{data.searches} searches</span>
                        <span className="text-xs text-green-600">{data.conversions} conversions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
