import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Download,
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
  description?: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  addressText?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone: string;
  category?: string;
  tags: string[];
  status: string;
  capacity?: number;
  minStallPrice?: number;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  avgRating: number;
  stalls: Array<{
    id: string;
    name: string;
    price: number;
    qtyTotal: number;
    qtySold: number;
    perks: string[];
    notes?: string;
  }>;
  vendors: Array<{
    id: string;
    status: string;
    message?: string;
    vendor: {
      id: string;
      storeName: string;
      imageUrl?: string;
      slug: string;
      city?: string;
      state?: string;
    };
    stall?: {
      name: string;
      price: number;
    };
  }>;
  perks: Array<{
    id: string;
    title: string;
    details?: string;
    code?: string;
    kind: string;
  }>;
  faqs: Array<{
    id: string;
    q: string;
    a: string;
    order: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    body?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    interests: number;
    favorites: number;
    reviews: number;
    vendors: number;
  };
};

type TabType = 'overview' | 'stalls' | 'vendors' | 'map' | 'reviews';

export default function EventDetailPage() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestStatus, setInterestStatus] = useState<'INTERESTED' | 'GOING'>('INTERESTED');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionMessage, setQuestionMessage] = useState('');

  // Extract slug from URL
  const slug = location.split('/').pop() || '';

  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const response = await fetch(`/api/events/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json() as Promise<Event>;
    },
  });

  // Interest mutation
  const interestMutation = useMutation({
    mutationFn: async (status: 'INTERESTED' | 'GOING') => {
      const response = await fetch(`/api/events/${event?.id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update interest');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      setShowInterestModal(false);
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${event?.id}/favorite`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to toggle favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
    },
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${event?.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, body: reviewBody }),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      setShowReviewModal(false);
      setReviewBody('');
      setReviewRating(5);
    },
  });

  // Question mutation
  const questionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${event?.id}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: questionMessage }),
      });
      if (!response.ok) throw new Error('Failed to submit question');
      return response.json();
    },
    onSuccess: () => {
      setShowQuestionModal(false);
      setQuestionMessage('');
    },
  });

  if (isLoading) {
    return (
      <div className={`${colors.bg} min-h-screen`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`${colors.bg} min-h-screen flex items-center justify-center`}>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2b2b2b] mb-2">Event not found</h2>
          <p className="text-[#4b4b4b] mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => setLocation('/events')}>
            Browse Events
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      }),
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const dateInfo = formatDate(event.startAt);
  const endTime = formatTime(event.endAt);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {event.description && (
              <div>
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-3">About this event</h3>
                <p className="text-[#4b4b4b] leading-relaxed">{event.description}</p>
              </div>
            )}
            
            {event.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {event.perks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-3">Event perks</h3>
                <div className="grid gap-3">
                  {event.perks.map(perk => (
                    <Card key={perk.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-[#2b2b2b]">{perk.title}</h4>
                          {perk.details && (
                            <p className="text-sm text-[#4b4b4b] mt-1">{perk.details}</p>
                          )}
                        </div>
                        {perk.code && (
                          <Badge variant="primary" className="text-xs">
                            {perk.code}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {event.faqs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-3">Frequently asked questions</h3>
                <div className="space-y-3">
                  {event.faqs.map(faq => (
                    <details key={faq.id} className="group">
                      <summary className="cursor-pointer font-medium text-[#2b2b2b] hover:text-[#7F232E] transition-colors">
                        {faq.q}
                        <ChevronRight className="inline-block h-4 w-4 ml-2 transform group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-[#4b4b4b] mt-2 ml-6">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'stalls':
        return (
          <div className="space-y-4">
            {event.stalls.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No stalls available</h3>
                <p className="text-[#4b4b4b]">This event doesn't have any vendor stalls for purchase.</p>
              </Card>
            ) : (
              event.stalls.map(stall => {
                const available = stall.qtyTotal - stall.qtySold;
                return (
                  <Card key={stall.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#2b2b2b] mb-2">{stall.name}</h3>
                        <div className="text-2xl font-bold text-[#7F232E] mb-3">
                          ${stall.price.toFixed(2)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-[#4b4b4b] mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {available} of {stall.qtyTotal} stalls available
                          </div>
                          {stall.perks.length > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Includes: {stall.perks.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        {stall.notes && (
                          <p className="text-sm text-[#4b4b4b] mb-4">{stall.notes}</p>
                        )}
                      </div>
                      
                      <div className="ml-6">
                        {available > 0 ? (
                          <Button
                            variant="primary"
                            className="flex items-center gap-2"
                            onClick={() => {
                              // Handle stall purchase
                              console.log('Purchase stall:', stall.id);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Purchase Stall
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-sm">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        );

      case 'vendors':
        return (
          <div className="space-y-4">
            {event.vendors.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No vendors yet</h3>
                <p className="text-[#4b4b4b]">Vendors will appear here once they join the event.</p>
              </Card>
            ) : (
              event.vendors.map(vendor => (
                <Card key={vendor.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {vendor.vendor.imageUrl ? (
                        <img 
                          src={vendor.vendor.imageUrl} 
                          alt={vendor.vendor.storeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-[#7F232E]/60" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#2b2b2b] truncate">
                        {vendor.vendor.storeName}
                      </h3>
                      <p className="text-sm text-[#4b4b4b]">
                        {vendor.vendor.city}, {vendor.vendor.state}
                      </p>
                      {vendor.stall && (
                        <p className="text-sm text-[#7F232E]">
                          {vendor.stall.name} - ${vendor.stall.price}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={vendor.status === 'APPROVED' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {vendor.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        onClick={() => setLocation(`/marketplace/vendor/${vendor.vendor.slug}`)}
                        title="View vendor profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Event Location</h3>
              
              {event.addressText && (
                <div className="mb-4">
                  <div className="flex items-start gap-2 text-[#4b4b4b]">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{event.addressText}</p>
                      <p>{event.city}, {event.state} {event.country}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-[#4b4b4b]">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Map view coming soon</p>
                  <p className="text-sm">Interactive map will be displayed here</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Open in external map
                    const address = encodeURIComponent(event.addressText || `${event.city}, ${event.state}`);
                    window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Maps
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2b2b2b]">Reviews</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(event.avgRating))}
                  </div>
                  <span className="text-sm text-[#4b4b4b]">
                    {event.avgRating.toFixed(1)} ({event._count.reviews} reviews)
                  </span>
                </div>
              </div>
              
              <Button
                variant="primary"
                onClick={() => setShowReviewModal(true)}
              >
                Write a Review
              </Button>
            </div>
            
            {event.reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <Star className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No reviews yet</h3>
                <p className="text-[#4b4b4b]">Be the first to review this event!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {event.reviews.map(review => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7F232E]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-[#7F232E]">
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#2b2b2b]">{review.user.name}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-[#4b4b4b]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {review.body && (
                          <p className="text-[#4b4b4b] text-sm">{review.body}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {event && (
        <SEOHead
          title={event.title}
          description={event.summary || event.description || `Join us for ${event.title} in ${event.city}, ${event.state}`}
          image={event.imageUrl}
          url={`/events/${event.slug}`}
          type="event"
          event={{
            name: event.title,
            startDate: event.startAt,
            endDate: event.endAt,
            location: {
              name: `${event.city}, ${event.state}`,
              address: event.addressText || '',
              city: event.city || '',
              state: event.state || '',
              country: event.country || 'USA'
            },
            description: event.description || event.summary || '',
            image: event.imageUrl,
            organizer: {
              name: 'Craved Artisan',
              url: 'https://craved-artisan.com'
            }
          }}
        />
      )}
      <div className={`${colors.bg} min-h-screen`}>
      {/* Hero Section */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                {event.summary && (
                  <p className="text-lg opacity-90 mb-4 max-w-2xl">{event.summary}</p>
                )}
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateInfo.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {dateInfo.time} - {endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.city}, {event.state}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={() => favoriteMutation.mutate()}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={() => {
                    // Handle share
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowInterestModal(true)}
                >
                  I'm Interested
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-white/50 rounded-xl p-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'stalls', label: 'Stalls' },
                { id: 'vendors', label: 'Vendors' },
                { id: 'map', label: 'Map' },
                { id: 'reviews', label: 'Reviews' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#7F232E] text-white'
                      : 'text-[#4b4b4b] hover:text-[#7F232E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-[#2b2b2b] mb-4">Event Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#7F232E]" />
                  <span className="text-[#4b4b4b]">{dateInfo.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#7F232E]" />
                  <span className="text-[#4b4b4b]">{dateInfo.time} - {endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#7F232E]" />
                  <span className="text-[#4b4b4b]">{event.city}, {event.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#7F232E]" />
                  <span className="text-[#4b4b4b]">{event._count.interests} interested</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#7F232E]" />
                    <span className="text-[#4b4b4b]">Capacity: {event.capacity}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#7F232E]/10">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    // Generate and download iCal
                    window.open(`/api/events/${event.id}/ical`, '_blank');
                  }}
                >
                  <Download className="h-4 w-4" />
                  Add to Calendar
                </Button>
              </div>
            </Card>
            
            {/* Social Links */}
            {event.socialLinks && (
              <Card className="p-6">
                <h3 className="font-semibold text-[#2b2b2b] mb-4">Follow Event</h3>
                <div className="space-y-2">
                  {event.socialLinks.website && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => window.open(event.socialLinks!.website, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
                  {event.socialLinks.instagram && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => window.open(event.socialLinks!.instagram, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                  )}
                  {event.socialLinks.facebook && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => window.open(event.socialLinks!.facebook, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                  )}
                </div>
              </Card>
            )}
            
            {/* Contact Coordinator */}
            <Card className="p-6">
              <h3 className="font-semibold text-[#2b2b2b] mb-4">Have Questions?</h3>
              <p className="text-sm text-[#4b4b4b] mb-4">
                Contact the event coordinator for more information.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowQuestionModal(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Show Interest</h3>
            <p className="text-[#4b4b4b] mb-4">
              Let the coordinator know you're interested in this event.
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="interest"
                  value="INTERESTED"
                  checked={interestStatus === 'INTERESTED'}
                  onChange={(e) => setInterestStatus(e.target.value as 'INTERESTED' | 'GOING')}
                  className="text-[#7F232E]"
                />
                <span className="text-[#4b4b4b]">I'm interested</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="interest"
                  value="GOING"
                  checked={interestStatus === 'GOING'}
                  onChange={(e) => setInterestStatus(e.target.value as 'INTERESTED' | 'GOING')}
                  className="text-[#7F232E]"
                />
                <span className="text-[#4b4b4b]">I'm going</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowInterestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => interestMutation.mutate(interestStatus)}
                disabled={interestMutation.isPending}
              >
                {interestMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Write a Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setReviewRating(rating)}
                    className="focus:outline-none"
                    title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Review</label>
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Ask a Question</h3>
            <p className="text-[#4b4b4b] mb-4">
              Send a message to the event coordinator.
            </p>
            
            <div className="mb-6">
              <textarea
                value={questionMessage}
                onChange={(e) => setQuestionMessage(e.target.value)}
                placeholder="What would you like to know?"
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowQuestionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => questionMutation.mutate()}
                disabled={questionMutation.isPending || !questionMessage.trim()}
              >
                {questionMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}