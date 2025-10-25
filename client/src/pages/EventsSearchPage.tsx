import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Heart,
  Grid,
  List,
  Map,
  Calendar as CalendarIcon,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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

type ViewMode = 'calendar' | 'list' | 'cards' | 'map';

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

type SearchParams = {
  q: string;
  category: string;
  tags: string[];
  city: string;
  state: string;
  from: string;
  to: string;
  sort: 'relevance' | 'date' | 'distance' | 'popular';
  lat?: number;
  lng?: number;
  radius: number;
};

type Facets = {
  categories: Array<{ value: string; count: number }>;
  tags: Array<{ value: string; count: number }>;
  locations: Array<{ city: string; state: string; count: number }>;
};

export default function EventsSearchPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    q: '',
    category: '',
    tags: [],
    city: '',
    state: '',
    from: '',
    to: '',
    sort: 'relevance',
    radius: 25,
  });

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'search', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/events/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  // Fetch facets
  const { data: facetsData } = useQuery({
    queryKey: ['events', 'facets', searchParams.lat, searchParams.lng, searchParams.radius],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.lat) params.append('lat', String(searchParams.lat));
      if (searchParams.lng) params.append('lng', String(searchParams.lng));
      params.append('radius', String(searchParams.radius));

      const response = await fetch(`/api/events/facets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch facets');
      return response.json();
    },
  });

  const events: Event[] = eventsData?.events || [];
  const facets: Facets = facetsData || { categories: [], tags: [], locations: [] };

  const updateParams = (updates: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  };

  const removeFilter = (key: keyof SearchParams, value?: string) => {
    if (key === 'tags' && value) {
      updateParams({
        tags: searchParams.tags.filter(tag => tag !== value),
      });
    } else {
      updateParams({ [key]: Array.isArray(searchParams[key]) ? [] : '' });
    }
  };

  const getActiveFilters = () => {
    const active: Array<{ key: string; label: string; value: string }> = [];
    
    if (searchParams.q) active.push({ key: 'q', label: 'Search', value: searchParams.q });
    if (searchParams.category) active.push({ key: 'category', label: 'Category', value: searchParams.category });
    if (searchParams.city) active.push({ key: 'city', label: 'City', value: searchParams.city });
    if (searchParams.state) active.push({ key: 'state', label: 'State', value: searchParams.state });
    if (searchParams.from) active.push({ key: 'from', label: 'From', value: new Date(searchParams.from).toLocaleDateString() });
    if (searchParams.to) active.push({ key: 'to', label: 'To', value: new Date(searchParams.to).toLocaleDateString() });
    searchParams.tags.forEach(tag => {
      active.push({ key: 'tags', label: 'Tag', value: tag });
    });

    return active;
  };

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

  const getDistanceText = () => {
    // In a real implementation, you'd calculate actual distance
    return '2.3 mi';
  };

  const renderEventCard = (event: Event, variant: 'list' | 'card' = 'card') => {
    const dateInfo = formatDate(event.startAt);
    const distance = getDistanceText();
    const stallsAvailable = event.stalls.reduce((sum, stall) => sum + (stall.qtyTotal - stall.qtySold), 0);

    if (variant === 'list') {
      return (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${colors.card} border ${colors.border} rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer`}
          onClick={() => setLocation(`/events/${event.slug}`)}
        >
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-[#7F232E]/60" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2b2b2b] truncate">{event.title}</h3>
                  {event.summary && (
                    <p className="text-sm text-[#4b4b4b] mt-1 line-clamp-2">{event.summary}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#4b4b4b]">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {dateInfo.full}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.city}, {event.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event._count.interests} interested
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {stallsAvailable > 0 && (
                    <Badge variant="default" className="text-xs">
                      {stallsAvailable} stalls left
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite
                    }}
                    title="Add to favorites"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colors.card} border ${colors.border} rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer`}
        onClick={() => setLocation(`/events/${event.slug}`)}
      >
        <div className="h-48 bg-gray-100 relative">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-[#7F232E]/60" />
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
              <Badge variant="default" className="text-xs">
                {stallsAvailable} stalls left
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-[#2b2b2b] mb-2 line-clamp-2">{event.title}</h3>
          
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

  const renderCalendarView = () => {
    // Simplified calendar view - in a real implementation, you'd use a proper calendar library
    return (
      <div className="space-y-4">
        <div className="text-center text-[#4b4b4b]">
          Calendar view coming soon. Showing list view for now.
        </div>
        {events.map(event => renderEventCard(event, 'list'))}
      </div>
    );
  };

  const renderMapView = () => {
    // Simplified map view - in a real implementation, you'd use a map library
    return (
      <div className="space-y-4">
        <div className="text-center text-[#4b4b4b]">
          Map view coming soon. Showing list view for now.
        </div>
        {events.map(event => renderEventCard(event, 'list'))}
      </div>
    );
  };

  return (
    <div className={`${colors.bg} min-h-screen`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4b4b4b]" />
                <input
                  type="text"
                  placeholder="Find events, e.g., 'farmers market'"
                  value={searchParams.q}
                  onChange={(e) => updateParams({ q: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFilters().length > 0 && (
                  <Badge variant="default" className="ml-1">
                    {getActiveFilters().length}
                  </Badge>
                )}
              </Button>
              
              <div className="flex items-center border border-[#7F232E]/20 rounded-xl bg-white/80">
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('calendar')}
                  className="rounded-l-xl rounded-r-none"
                  title="Calendar view"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('cards')}
                  className="rounded-none"
                  title="Cards view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('map')}
                  className="rounded-r-xl rounded-l-none"
                  title="Map view"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {getActiveFilters().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {getActiveFilters().map((filter, index) => (
                <Badge
                  key={`${filter.key}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}: {filter.value}
                  <button
                    onClick={() => removeFilter(filter.key as keyof SearchParams, filter.value)}
                    className="ml-1 hover:bg-[#7F232E]/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 flex-shrink-0"
              >
                <Card className="p-4">
                  <h3 className="font-semibold text-[#2b2b2b] mb-4">Filters</h3>
                  
                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Category</label>
                    <select
                      value={searchParams.category}
                      onChange={(e) => updateParams({ category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                      title="Select category"
                    >
                      <option value="">All Categories</option>
                      {facets.categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.value} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tags */}
                  {facets.tags.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Tags</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {facets.tags.map(tag => (
                          <label key={tag.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={searchParams.tags.includes(tag.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateParams({ tags: [...searchParams.tags, tag.value] });
                                } else {
                                  updateParams({ tags: searchParams.tags.filter(t => t !== tag.value) });
                                }
                              }}
                              className="rounded border-[#7F232E]/20"
                            />
                            <span className="text-[#4b4b4b]">{tag.value} ({tag.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">City</label>
                    <input
                      type="text"
                      value={searchParams.city}
                      onChange={(e) => updateParams({ city: e.target.value })}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">State</label>
                    <input
                      type="text"
                      value={searchParams.state}
                      onChange={(e) => updateParams({ state: e.target.value })}
                      placeholder="Enter state"
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    />
                  </div>
                  
                  {/* Date Range */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">From Date</label>
                    <input
                      type="date"
                      value={searchParams.from}
                      onChange={(e) => updateParams({ from: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">To Date</label>
                    <input
                      type="date"
                      value={searchParams.to}
                      onChange={(e) => updateParams({ to: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    />
                  </div>
                  
                  {/* Sort */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Sort by</label>
                    <select
                      value={searchParams.sort}
                      onChange={(e) => updateParams({ sort: e.target.value as 'relevance' | 'date' | 'distance' | 'popular' })}
                      className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                      title="Sort by"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="distance">Distance</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Content */}
          <div className="flex-1">
            {eventsLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`${colors.card} border ${colors.border} rounded-2xl p-4 animate-pulse`}>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Card className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No events found</h3>
                <p className="text-[#4b4b4b] mb-4">
                  Try adjusting your search criteria or browse all events.
                </p>
                <Button
                  variant="default"
                  onClick={() => setSearchParams({
                    q: '',
                    category: '',
                    tags: [],
                    city: '',
                    state: '',
                    from: '',
                    to: '',
                    sort: 'relevance',
                    radius: 25,
                  })}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[#4b4b4b]">
                    {eventsData?.pagination?.total || events.length} events found
                  </p>
                </div>
                
                {viewMode === 'calendar' && renderCalendarView()}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {events.map(event => renderEventCard(event, 'list'))}
                  </div>
                )}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => renderEventCard(event, 'card'))}
                  </div>
                )}
                {viewMode === 'map' && renderMapView()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
