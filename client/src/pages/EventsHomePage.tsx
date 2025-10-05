import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  Plus,
  Map,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SEOHead from '../components/SEOHead';

const colors = {
  bg: 'bg-[#F7F2EC]',
  card: 'bg-white/70',
  border: 'border-[#7F232E]/15',
  primary: 'bg-[#7F232E] text-white hover:bg-[#6b1e27]',
  secondary: 'border-[#7F232E]/30 text-[#7F232E] bg-white/80 hover:bg-white',
  accent: 'text-[#5B6E02]',
  ink: 'text-[#2b2b2b]',
  sub: 'text-[#4b4b4b]',
};

type Event = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  city?: string;
  state?: string;
  category?: string;
  tags: string[];
  minStallPrice?: number;
  _count: {
    interests: number;
    favorites: number;
    reviews: number;
  };
  stalls: Array<{
    id: string;
    name: string;
    price: number;
    qtyTotal: number;
    qtySold: number;
  }>;
};

export default function EventsHomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch featured events
  const { data: featuredEvents = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/events/search?sort=popular&pageSize=6');
      if (!response.ok) throw new Error('Failed to fetch featured events');
      const data = await response.json();
      return data.events as Event[];
    },
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const from = new Date().toISOString();
      const response = await fetch(`/api/events/search?from=${from}&sort=date&pageSize=8`);
      if (!response.ok) throw new Error('Failed to fetch upcoming events');
      const data = await response.json();
      return data.events as Event[];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['events', 'categories'],
    queryFn: async () => {
      const response = await fetch('/api/events/facets');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories || [];
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
    };
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    setLocation(`/events/search?${params.toString()}`);
  };

  const renderEventCard = (event: Event, variant: 'featured' | 'upcoming' = 'upcoming') => {
    const dateInfo = formatDate(event.startAt);
    const stallsAvailable = event.stalls.reduce((sum, stall) => sum + (stall.qtyTotal - stall.qtySold), 0);

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colors.card} border ${colors.border} rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${
          variant === 'featured' ? 'hover:scale-105' : ''
        }`}
        onClick={() => setLocation(`/events/${event.slug}`)}
      >
        <div className={`relative ${variant === 'featured' ? 'h-48' : 'h-40'}`}>
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
              <CalendarIcon className={`${variant === 'featured' ? 'h-12 w-12' : 'h-8 w-8'} text-[#7F232E]/60`} />
            </div>
          )}
          
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              className="bg-white/90 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle favorite
              }}
              title="Add to favorites"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          {stallsAvailable > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {stallsAvailable} stalls left
              </Badge>
            </div>
          )}
          
          {variant === 'featured' && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="text-xs bg-[#7F232E] text-white">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        <div className={`p-4 ${variant === 'featured' ? 'p-6' : ''}`}>
          <h3 className={`font-semibold text-[#2b2b2b] mb-2 line-clamp-2 ${variant === 'featured' ? 'text-lg' : ''}`}>
            {event.title}
          </h3>
          
          {event.summary && (
            <p className="text-sm text-[#4b4b4b] mb-3 line-clamp-2">{event.summary}</p>
          )}
          
          <div className="space-y-2 text-sm text-[#4b4b4b]">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateInfo.full}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.city}, {event.state}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event._count.interests} interested
            </div>
          </div>
          
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEOHead
        title="Local Events & Artisan Marketplace"
        description="Discover farmers markets, craft fairs, pop-up events, and workshops near you. Connect with local artisans and vendors in your community."
        url="/events"
        type="website"
      />
      <div className={`${colors.bg} min-h-screen`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F232E]/10 to-[#5B6E02]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 text-sm text-[#7F232E] mb-4">
                <Sparkles className="h-4 w-4" />
                Discover local events & connect with vendors
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-[#2b2b2b] mb-6">
                Find Your Next
                <span className="block text-[#7F232E]">Artisan Event</span>
              </h1>
              
              <p className="text-xl text-[#4b4b4b] mb-8 max-w-3xl mx-auto">
                Discover farmers markets, craft fairs, pop-up events, and workshops near you. 
                Connect with local artisans and vendors in your community.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4b4b4b]" />
                  <input
                    type="text"
                    placeholder="Search events, e.g., 'farmers market'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-[#7F232E]/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 text-lg"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="px-6 py-4 text-lg"
                >
                  Search
                </Button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#2b2b2b] mb-6 text-center">Popular Categories</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === '' ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory('')}
            >
              All Events
            </Button>
            {categories.slice(0, 8).map((category: { value: string; count: number }) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'primary' : 'secondary'}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.value} ({category.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Featured Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2b2b2b]">Featured Events</h2>
            <Button
              variant="ghost"
              onClick={() => setLocation('/events/search?sort=popular')}
              className="flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`${colors.card} border ${colors.border} rounded-2xl overflow-hidden animate-pulse`}>
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map(event => renderEventCard(event, 'featured'))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2b2b2b]">Upcoming Events</h2>
            <Button
              variant="ghost"
              onClick={() => setLocation('/events/search?sort=date')}
              className="flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {upcomingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`${colors.card} border ${colors.border} rounded-2xl overflow-hidden animate-pulse`}>
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map(event => renderEventCard(event, 'upcoming'))}
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Card className="p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-[#2b2b2b] mb-4">
                Discover Amazing Events
              </h2>
              <p className="text-lg text-[#4b4b4b] mb-8">
                Explore local farmers markets, craft fairs, workshops, and community events 
                happening in your area.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      </div>
    </>
  );
}
