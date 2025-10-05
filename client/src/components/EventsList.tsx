import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

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

interface EventsListProps {
  events: Event[];
  loading?: boolean;
  onEventClick: (event: Event) => void;
  onFavoriteClick?: (event: Event) => void;
  variant?: 'list' | 'card' | 'compact';
  showFilters?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function EventsList({
  events,
  loading = false,
  onEventClick,
  onFavoriteClick,
  variant = 'list',
  showFilters = false,
  onLoadMore,
  hasMore = false
}: EventsListProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set());

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const toggleExpanded = useCallback((eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((event: Event) => {
    setFavoriteEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(event.id)) {
        newSet.delete(event.id);
      } else {
        newSet.add(event.id);
      }
      return newSet;
    });
    onFavoriteClick?.(event);
  }, [onFavoriteClick]);

  const renderStars = useCallback((rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  }, []);

  const renderEventCard = useCallback((event: Event) => {
    const dateInfo = formatDate(event.startAt);
    const stallsAvailable = event.stalls.reduce((sum, stall) => sum + (stall.qtyTotal - stall.qtySold), 0);
    const isExpanded = expandedEvents.has(event.id);
    const isFavorited = favoriteEvents.has(event.id);

    if (variant === 'compact') {
      return (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${colors.card} border ${colors.border} rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer`}
          onClick={() => onEventClick(event)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#7F232E]/60" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#2b2b2b] truncate text-sm">{event.title}</h3>
              <div className="flex items-center gap-2 text-xs text-[#4b4b4b] mt-1">
                <Calendar className="h-3 w-3" />
                {dateInfo.date}
                <MapPin className="h-3 w-3" />
                {event.city}
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(event);
              }}
              className="p-1"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </motion.div>
      );
    }

    if (variant === 'card') {
      return (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${colors.card} border ${colors.border} rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer`}
          onClick={() => onEventClick(event)}
        >
          <div className="h-48 bg-gray-100 relative">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-[#7F232E]/60" />
              </div>
            )}
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                className="bg-white/90 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(event);
                }}
                title="Add to favorites"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            
            {stallsAvailable > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
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
                <Calendar className="h-4 w-4" />
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
    }

    // Default list variant
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colors.card} border ${colors.border} rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer`}
        onClick={() => onEventClick(event)}
      >
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-[#7F232E]/60" />
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
                    <Calendar className="h-4 w-4" />
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
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {stallsAvailable} stalls left
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event);
                  }}
                  title="Add to favorites"
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [
    variant,
    formatDate,
    expandedEvents,
    favoriteEvents,
    onEventClick,
    toggleFavorite
  ]);

  const loadingSkeleton = useMemo(() => {
    const skeletonItems = Array.from({ length: 6 }, (_, i) => (
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
    ));

    return skeletonItems;
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {loadingSkeleton}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No events found</h3>
        <p className="text-[#4b4b4b]">
          Try adjusting your search criteria or browse all events.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {events.map(event => renderEventCard(event))}
      </AnimatePresence>
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            className="flex items-center gap-2"
          >
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
}
