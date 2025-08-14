'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Brain, Sparkles, TrendingUp, Gift, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISuggestion {
  id: string;
  type: 'search' | 'category' | 'bundle' | 'trending' | 'personalized';
  title: string;
  description: string;
  query: string;
  icon: string;
  confidence: number;
  category?: string;
}

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

interface AISearchEngineProps {
  onSearch: (query: string) => void;
  onSuggestionClick: (suggestion: AISuggestion) => void;
  searchHistory: SearchHistory[];
  userPreferences?: {
    dietaryFlags: string[];
    favoriteCategories: string[];
    budget: number;
  };
}

export default function AISearchEngine({
  onSearch,
  onSuggestionClick,
  searchHistory,
  userPreferences
}: AISearchEngineProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock AI suggestions - in real implementation, these would come from an AI service
  const generateAISuggestions = (input: string, userPrefs?: any): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour < 12) {
      suggestions.push({
        id: 'morning-bread',
        type: 'search',
        title: 'Fresh Morning Bread',
        description: 'Perfect artisan breads for breakfast',
        query: 'fresh bread morning breakfast',
        icon: '🍞',
        confidence: 0.9
      });
    } else if (hour < 17) {
      suggestions.push({
        id: 'lunch-snacks',
        type: 'search',
        title: 'Lunch & Afternoon Treats',
        description: 'Great options for lunch or snacks',
        query: 'lunch snacks afternoon',
        icon: '🥪',
        confidence: 0.85
      });
    } else {
      suggestions.push({
        id: 'dinner-desserts',
        type: 'search',
        title: 'Dinner & Desserts',
        description: 'Evening artisan delights',
        query: 'dinner desserts evening',
        icon: '🍰',
        confidence: 0.8
      });
    }

    // Seasonal suggestions
    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) {
      suggestions.push({
        id: 'holiday-gifts',
        type: 'bundle',
        title: 'Holiday Gifts Under $30',
        description: 'Perfect artisan gifts for the food lover',
        query: 'holiday gifts under 30',
        icon: '🎁',
        confidence: 0.95
      });
    }

    if (month >= 8 && month <= 9) {
      suggestions.push({
        id: 'back-to-school',
        type: 'category',
        title: 'Back to School Lunch Kits',
        description: 'Perfect packed lunches for busy families',
        query: 'lunch kits school kids',
        icon: '🍎',
        confidence: 0.9
      });
    }

    // Personalized suggestions based on user preferences
    if (userPrefs?.dietaryFlags?.includes('vegan')) {
      suggestions.push({
        id: 'vegan-favorites',
        type: 'personalized',
        title: 'Vegan Favorites',
        description: 'Based on your preferences',
        query: 'vegan plant-based',
        icon: '🌱',
        confidence: 0.95
      });
    }

    if (userPrefs?.favoriteCategories?.includes('Bread')) {
      suggestions.push({
        id: 'bread-lovers',
        type: 'personalized',
        title: 'For Bread Lovers',
        description: 'New artisan breads in your area',
        query: 'artisan bread sourdough',
        icon: '🥖',
        confidence: 0.9
      });
    }

    // Trending suggestions
    suggestions.push({
      id: 'trending-local',
      type: 'trending',
      title: 'Trending in Your Area',
      description: 'Popular items this week',
      query: 'trending popular local',
      icon: '🔥',
      confidence: 0.8
    });

    // Smart suggestions based on input
    if (input.toLowerCase().includes('bread')) {
      suggestions.push({
        id: 'bread-varieties',
        type: 'search',
        title: 'Artisan Bread Varieties',
        description: 'Sourdough, rye, whole grain, and more',
        query: 'artisan bread varieties',
        icon: '🥖',
        confidence: 0.9
      });
    }

    if (input.toLowerCase().includes('sweet') || input.toLowerCase().includes('dessert')) {
      suggestions.push({
        id: 'sweet-treats',
        type: 'search',
        title: 'Sweet Treats & Desserts',
        description: 'Cakes, pastries, and confections',
        query: 'sweet treats desserts pastries',
        icon: '🍰',
        confidence: 0.85
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
  };

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true);
      // Simulate AI processing delay
      setTimeout(() => {
        const suggestions = generateAISuggestions(query, userPreferences);
        setAiSuggestions(suggestions);
        setIsLoading(false);
      }, 300);
    } else {
      setAiSuggestions([]);
    }
  }, [query, userPreferences]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setQuery(suggestion.query);
    onSuggestionClick(suggestion);
    setShowSuggestions(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const getSmartPlaceholder = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Looking for fresh morning bread?';
    if (hour < 17) return 'Need lunch or afternoon treats?';
    return 'Evening artisan delights?';
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setSearchFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setSearchFocused(false);
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={getSmartPlaceholder()}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            aria-label="Search for products, vendors, or categories"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-green text-white px-4 py-1.5 rounded-md hover:bg-brand-green/90"
            aria-label="Search"
          >
            Search
          </button>
        </form>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showSuggestions && (query.length > 2 || aiSuggestions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-white rounded-lg border shadow-lg overflow-hidden"
            >
              {/* AI Suggestions Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900 text-sm">Smart Suggestions</span>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Suggestions List */}
              <div className="max-h-96 overflow-y-auto">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{suggestion.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {suggestion.title}
                          </span>
                          {suggestion.type === 'personalized' && (
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                          )}
                          {suggestion.type === 'trending' && (
                            <TrendingUp className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(suggestion.confidence * 100)}% match
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && query.length === 0 && (
                <div className="border-t">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700">
                    Recent Searches
                  </div>
                  {searchHistory.slice(0, 3).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(item.query)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-gray-400" />
                      {item.query}
                      <span className="text-xs text-gray-400 ml-auto">
                        {item.resultCount} results
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
