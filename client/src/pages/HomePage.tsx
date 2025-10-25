'use client';

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowDown, Star, ShoppingBag, Sparkles, Users, TrendingUp, Calendar, MapPin, Clock, Cloud, Sun, Award, Heart } from 'lucide-react';
import { useZip } from '../contexts/ZipContext';
import BetaTesterOverlay from '../components/BetaTesterOverlay';

const storeCTA = (cta: string) => {
  localStorage.setItem('lastCTA', cta);
};

// Mock review data - in a real app, this would come from an API
const mockReviews = [
  { id: 1, name: 'Sarah M.', rating: 5, text: 'Amazing fresh bread from Rustic Bakes!', time: '2 hours ago' },
  { id: 2, name: 'Mike T.', rating: 5, text: 'Best local honey I\'ve ever tasted!', time: '4 hours ago' },
  { id: 3, name: 'Emma L.', rating: 5, text: 'The artisan cheese selection is incredible!', time: '6 hours ago' },
  { id: 4, name: 'David K.', rating: 5, text: 'Love supporting local makers here!', time: '8 hours ago' },
  { id: 5, name: 'Lisa P.', rating: 5, text: 'Fresh produce delivered right to my door!', time: '10 hours ago' },
];

// Mock site news data - in a real app, this would come from an API
const mockSiteNews = [
  { id: 1, type: 'purchase', icon: ShoppingBag, text: 'Sarah just purchased Fresh Sourdough from Rustic Bakes', time: '2 min ago', color: 'text-green-600' },
  { id: 2, type: 'new', icon: Sparkles, text: 'New vendor: Elderberry & Sage Apothecary joined!', time: '15 min ago', color: 'text-blue-600' },
  { id: 3, type: 'trending', icon: TrendingUp, text: 'Artisan Honey is trending this week', time: '1 hour ago', color: 'text-orange-600' },
  { id: 4, type: 'community', icon: Users, text: '25 new customers joined this week', time: '2 hours ago', color: 'text-purple-600' },
  { id: 5, type: 'purchase', icon: ShoppingBag, text: 'Mike ordered Local Honey from Sweet Georgia', time: '3 hours ago', color: 'text-green-600' },
  { id: 6, type: 'new', icon: Sparkles, text: 'New product: Handcrafted Soap Bars available', time: '4 hours ago', color: 'text-blue-600' },
];

// Mock events data - in a real app, this would come from an API based on ZIP code
const getMockEvents = (zipCode: string) => {
  const baseEvents = [
    {
      id: 1,
      title: 'Locust Grove Farmers Market',
      date: 'Saturday, Dec 14',
      time: '9:00 AM - 2:00 PM',
      location: 'Locust Grove City Park',
      distance: '2.3 miles',
      attendees: 45,
      type: 'market'
    },
    {
      id: 2,
      title: 'Artisan Bread Workshop',
      date: 'Sunday, Dec 15',
      time: '1:00 PM - 4:00 PM',
      location: 'Rustic Bakes Kitchen',
      distance: '1.8 miles',
      attendees: 12,
      type: 'workshop'
    },
    {
      id: 3,
      title: 'Holiday Craft Fair',
      date: 'Saturday, Dec 21',
      time: '10:00 AM - 6:00 PM',
      location: 'Downtown Square',
      distance: '0.5 miles',
      attendees: 89,
      type: 'fair'
    },
    {
      id: 4,
      title: 'Local Honey Tasting',
      date: 'Wednesday, Dec 18',
      time: '6:00 PM - 8:00 PM',
      location: 'Sweet Georgia Apiary',
      distance: '4.1 miles',
      attendees: 23,
      type: 'tasting'
    },
    {
      id: 5,
      title: 'Cheese Making Demo',
      date: 'Friday, Dec 20',
      time: '3:00 PM - 5:00 PM',
      location: 'Artisan Dairy Co.',
      distance: '3.2 miles',
      attendees: 18,
      type: 'demo'
    }
  ];

  // Simulate different events based on ZIP code
  if (zipCode === '30248') { // Locust Grove
    return baseEvents;
  } else if (zipCode === '30223') { // McDonough
    return [
      {
        id: 6,
        title: 'McDonough Artisan Market',
        date: 'Saturday, Dec 14',
        time: '8:00 AM - 3:00 PM',
        location: 'Heritage Park',
        distance: '0.8 miles',
        attendees: 67,
        type: 'market'
      },
      {
        id: 7,
        title: 'Candle Making Workshop',
        date: 'Sunday, Dec 15',
        time: '2:00 PM - 5:00 PM',
        location: 'Wax & Wick Studio',
        distance: '1.2 miles',
        attendees: 15,
        type: 'workshop'
      },
      {
        id: 8,
        title: 'Local Wine Tasting',
        date: 'Thursday, Dec 19',
        time: '7:00 PM - 9:00 PM',
        location: 'Vineyard View',
        distance: '2.5 miles',
        attendees: 34,
        type: 'tasting'
      }
    ];
  } else {
    // Default events for other ZIP codes
    return [
      {
        id: 9,
        title: 'Community Artisan Meetup',
        date: 'Saturday, Dec 14',
        time: '10:00 AM - 12:00 PM',
        location: 'Local Community Center',
        distance: '1.5 miles',
        attendees: 28,
        type: 'meetup'
      },
      {
        id: 10,
        title: 'Handmade Soap Workshop',
        date: 'Sunday, Dec 15',
        time: '1:00 PM - 3:00 PM',
        location: 'Natural Creations',
        distance: '2.1 miles',
        attendees: 20,
        type: 'workshop'
      }
    ];
  }
};

export default function Home() {
  const { zip } = useZip();
  const [currentReview, setCurrentReview] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [showBetaOverlay, setShowBetaOverlay] = useState(false);
  
  // Get events based on current ZIP code
  const events = getMockEvents(zip);

  // Show beta overlay - acts as password gate for site access
  useEffect(() => {
    const hasAccess = localStorage.getItem('siteAccessGranted');
    if (!hasAccess) {
      // Show overlay immediately to block access
      setShowBetaOverlay(true);
    }
  }, []);

  const handleCloseBetaOverlay = () => {
    // Only allow closing if access was granted (via password)
    const hasAccess = localStorage.getItem('siteAccessGranted');
    if (hasAccess) {
      setShowBetaOverlay(false);
    }
  };

  useEffect(() => {
    // Rotate through reviews every 4 seconds
    const reviewInterval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % mockReviews.length);
    }, 4000);

    // Rotate through news every 3 seconds
    const newsInterval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % mockSiteNews.length);
    }, 3000);

    // Rotate through events every 5 seconds
    const eventInterval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    // Rotate through community spotlight every 6 seconds
    const spotlightInterval = setInterval(() => {
      setCurrentSpotlightIndex((prev) => (prev + 1) % 3);
    }, 6000);

    return () => {
      clearInterval(reviewInterval);
      clearInterval(newsInterval);
      clearInterval(eventInterval);
      clearInterval(spotlightInterval);
    };
  }, [events.length]);

  return (
    <>
      {/* Beta Tester Overlay */}
      <BetaTesterOverlay 
        isOpen={showBetaOverlay} 
        onClose={handleCloseBetaOverlay} 
      />

      <div className="min-h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory">
             {/* Section 1: Hero */}
               <section className="snap-start min-h-screen w-full relative overflow-hidden flex flex-col">
          <img
            src="/images/Banner1.1-jcN30aow.png"
            alt="Craved Artisan Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          
                                {/* Logo at top center */}
            <div className="absolute top-16 sm:top-20 md:top-24 lg:top-28 left-1/2 transform -translate-x-1/2 z-20">
              <img
                src="/images/logonobg.png"
                alt="Craved Artisan Logo"
                className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48 w-auto drop-shadow-lg"
              />
            </div>
          
                                                                 <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 flex-1 py-12 sm:py-16 md:py-20">
            <motion.div
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
                             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-10 drop-shadow-lg">
                 Welcome to Craved Artisan — a new kind of marketplace.
               </h1>
               <p className="text-white/90 mb-10 sm:mb-12 text-sm sm:text-base md:text-lg drop-shadow">We're connecting farmers, bakers, makers, and neighbors through a local-first platform built for transparency, trust, and real human connection.</p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full sm:w-auto mt-6 sm:mt-8">
                <Link
                  href="/signup"
                  onClick={() => storeCTA('join')}
                  className="bg-brand-maroon text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-lg hover:bg-[#681b24] transition shadow w-full sm:w-auto text-center font-medium"
                >
                  Join the Movement
                </Link>
                                <Link
                   href="/products"
                   onClick={() => storeCTA('marketplace')}
                   className="bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-lg hover:bg-white/30 transition border border-white/30 w-full sm:w-auto text-center font-medium"
                 >
                   View Marketplace
                 </Link>
                            </div>
            </motion.div>
            
                                       {/* Customer Review Widget */}
                                                           <motion.div
                  className="absolute left-4 right-4 bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                                   <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 text-white shadow-2xl">
                                     {/* Header with rating and review count */}
                                       <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                                             <div className="flex items-center gap-1">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                         ))}
                       </div>
                      <div className="flex flex-col">
                                                 <span className="text-base md:text-lg font-bold">5.0</span>
                         <span className="text-xs opacity-75">Based on 1,247 reviews</span>
                      </div>
                    </div>
                                         <div className="text-right">
                       <div className="text-xs opacity-75">Featured Review</div>
                       <div className="text-xs opacity-60">Updated daily</div>
                     </div>
                  </div>
                  
                                     {/* Review content */}
                   <div className="mb-4">
                                         <p className="text-sm md:text-base italic leading-relaxed mb-3">"{mockReviews[currentReview]?.text || ''}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                                               <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
                         <span className="text-xs md:text-sm font-semibold">
                           {mockReviews[currentReview]?.name?.charAt(0) || ''}
                         </span>
                       </div>
                                                 <div>
                           <div className="font-medium text-xs md:text-sm">{mockReviews[currentReview]?.name || ''}</div>
                           <div className="text-xs opacity-75">Verified Customer</div>
                         </div>
                      </div>
                                             <div className="text-right">
                         <div className="text-xs opacity-75">{mockReviews[currentReview]?.time || ''}</div>
                         <div className="text-xs opacity-60">Local Community</div>
                       </div>
                    </div>
                  </div>
                  
                  {/* Bottom indicator */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
          </div>
                     <ArrowDown className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce text-white" />
       </section>

             {/* Section 2: Local Buzz */}
               <section
          className="relative snap-start min-h-screen w-full bg-cover bg-center px-4 sm:px-6 py-8 sm:py-10 flex flex-col justify-center items-center text-center"
          style={{ backgroundImage: `url('/images/bepartofit_1750623784608.png')` }}
        >
         <div className="absolute inset-0 bg-[#F7F2EC]/50 backdrop-blur-sm" />
         <motion.div
           className="relative z-10 max-w-6xl w-full"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
         >
                       <h2 className="text-3xl font-semibold text-brand-charcoal mb-4">Local Buzz</h2>
            <p className="text-brand-grey mb-8">See what's happening around you in real time.</p>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-8">
              <Link
                href="/events"
                className="bg-brand-maroon text-white px-6 py-3 rounded-lg hover:bg-[#681b24] transition shadow-lg font-medium"
              >
                View Events
              </Link>
              <Link
                href="/community"
                className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/80 transition shadow-lg font-medium"
              >
                Community Forum
              </Link>
            </div>
           
                       {/* Site News Widget */}
            <motion.div
              className="bg-white/80 backdrop-blur-md border border-brand-beige/50 rounded-xl p-6 mb-6 max-w-2xl mx-auto shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-brand-charcoal">Live Updates</h3>
              </div>
              
              <motion.div
                key={currentNewsIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg bg-brand-cream ${mockSiteNews[currentNewsIndex]?.color || ''}`}>
                  {(() => {
                    const IconComponent = mockSiteNews[currentNewsIndex]?.icon;
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="text-brand-charcoal font-medium">{mockSiteNews[currentNewsIndex]?.text || ''}</p>
                  <p className="text-brand-grey text-sm mt-1">{mockSiteNews[currentNewsIndex]?.time || ''}</p>
                </div>
              </motion.div>
            </motion.div>

                         {/* Upcoming Events Widget */}
             <motion.div
               className="bg-white/80 backdrop-blur-md border border-brand-beige/50 rounded-xl p-6 mb-6 max-w-2xl mx-auto shadow-lg"
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 0.5 }}
             >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-brand-maroon" />
                <h3 className="text-lg font-semibold text-brand-charcoal">Upcoming Events</h3>
                <span className="text-sm text-brand-grey">Near {zip}</span>
              </div>
              
              <motion.div
                key={currentEventIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-maroon/10">
                    <Calendar className="h-4 w-4 text-brand-maroon" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-brand-charcoal font-semibold text-sm">{events[currentEventIndex]?.title || ''}</h4>
                    <div className="flex items-center gap-4 text-xs text-brand-grey mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{events[currentEventIndex]?.date || ''} • {events[currentEventIndex]?.time || ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-brand-grey mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{events[currentEventIndex]?.location || ''}</span>
                      </div>
                      <span>• {events[currentEventIndex]?.distance || ''}</span>
                      <span>• {events[currentEventIndex]?.attendees || ''} attending</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="mt-4 pt-3 border-t border-brand-beige/30">
                <Link 
                  href="/events" 
                  className="text-brand-maroon hover:text-brand-maroon/80 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View All Events →
                </Link>
                             </div>
             </motion.div>

             {/* Local Weather & Market Conditions Widget */}
             <motion.div
               className="bg-white/80 backdrop-blur-md border border-brand-beige/50 rounded-xl p-6 mb-6 max-w-2xl mx-auto shadow-lg"
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.6, duration: 0.5 }}
             >
               <div className="flex items-center gap-3 mb-4">
                 <Sun className="h-5 w-5 text-orange-500" />
                 <h3 className="text-lg font-semibold text-brand-charcoal">Local Conditions</h3>
                 <span className="text-sm text-brand-grey">Perfect for markets!</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-3 bg-brand-cream rounded-lg">
                   <div className="flex items-center justify-center gap-2 mb-2">
                     <Sun className="h-4 w-4 text-orange-500" />
                     <span className="text-sm font-medium text-brand-charcoal">Weather</span>
                   </div>
                   <div className="text-2xl font-bold text-brand-maroon">72°F</div>
                   <div className="text-xs text-brand-grey">Sunny & Clear</div>
                 </div>
                 
                 <div className="text-center p-3 bg-brand-cream rounded-lg">
                   <div className="flex items-center justify-center gap-2 mb-2">
                     <TrendingUp className="h-4 w-4 text-green-600" />
                     <span className="text-sm font-medium text-brand-charcoal">Market Status</span>
                   </div>
                   <div className="text-2xl font-bold text-brand-green">Open</div>
                   <div className="text-xs text-brand-grey">12 vendors active</div>
                 </div>
               </div>
               
               <div className="mt-4 pt-3 border-t border-brand-beige/30">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-brand-grey">Next market day: Saturday</span>
                   <span className="text-brand-maroon font-medium">9:00 AM - 2:00 PM</span>
                 </div>
               </div>
             </motion.div>

             {/* Community Spotlight Widget */}
             <motion.div
               className="bg-white/80 backdrop-blur-md border border-brand-beige/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto shadow-lg"
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.8, duration: 0.5 }}
             >
               <div className="flex items-center gap-3 mb-4">
                 <Award className="h-5 w-5 text-brand-maroon" />
                 <h3 className="text-lg font-semibold text-brand-charcoal">Community Spotlight</h3>
                 <Heart className="h-4 w-4 text-red-500" />
               </div>
               
               <motion.div
                 key={currentSpotlightIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
                 className="space-y-3"
               >
                 {currentSpotlightIndex === 0 && (
                   <div className="flex items-start gap-3">
                     <div className="w-12 h-12 bg-brand-maroon/10 rounded-full flex items-center justify-center">
                       <span className="text-brand-maroon font-bold text-lg">🥖</span>
                     </div>
                     <div className="flex-1">
                       <h4 className="text-brand-charcoal font-semibold text-sm">Vendor of the Week</h4>
                       <p className="text-brand-grey text-sm mt-1">Rustic Bakes - Fresh sourdough every morning</p>
                       <div className="flex items-center gap-2 mt-2">
                         <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                         <span className="text-xs text-brand-grey">4.9/5 (89 reviews)</span>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {currentSpotlightIndex === 1 && (
                   <div className="flex items-start gap-3">
                     <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center">
                       <span className="text-brand-green font-bold text-lg">🌿</span>
                     </div>
                     <div className="flex-1">
                       <h4 className="text-brand-charcoal font-semibold text-sm">Sustainability Champion</h4>
                       <p className="text-brand-grey text-sm mt-1">Elderberry & Sage - Zero waste packaging</p>
                       <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Eco-Friendly</span>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {currentSpotlightIndex === 2 && (
                   <div className="flex items-start gap-3">
                     <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                       <span className="text-orange-500 font-bold text-lg">🏆</span>
                     </div>
                     <div className="flex-1">
                       <h4 className="text-brand-charcoal font-semibold text-sm">Community Hero</h4>
                       <p className="text-brand-grey text-sm mt-1">Mike T. - Organized 5 local markets this year</p>
                       <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Volunteer</span>
                       </div>
                     </div>
                   </div>
                 )}
               </motion.div>
               
               <div className="mt-4 pt-3 border-t border-brand-beige/30">
                 <Link 
                   href="/community" 
                   className="text-brand-maroon hover:text-brand-maroon/80 text-sm font-medium transition-colors flex items-center gap-1"
                 >
                   Join the Community →
                 </Link>
               </div>
             </motion.div>
           

          </motion.div>
        </section>

                           {/* Section 3: Who We Are */}
                 <section className="snap-start min-h-screen w-full relative overflow-hidden flex flex-col">
                    <img
             src="/images/Untitled design (9)_1750654286460.png"
             alt="Who We Are"
             className="absolute inset-0 w-full h-full object-cover"
           />
          <div className="absolute inset-0 bg-black/30" />
                     <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 flex-1">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">Who We Are</h2>
              <p className="max-w-xl text-lg text-white/90 mb-8 drop-shadow">
                Discover the story behind Craved Artisan and how we're building a new food economy.
              </p>
              
              {/* Video Frame */}
              <motion.div
                className="relative w-full max-w-3xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl">
                  {/* Video Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-brand-maroon/80 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-white/90 text-lg font-medium">Craved Artisan Intro</p>
                      <p className="text-white/70 text-sm mt-2">Coming Soon</p>
                    </div>
                  </div>
                  
                  {/* Video Overlay for when video is ready */}
                  {/* <video
                    className="w-full h-full object-cover"
                    controls
                    poster="/images/video-poster.jpg"
                  >
                    <source src="/videos/craved-artisan-intro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video> */}
                </div>
                
                {/* Video Frame Border */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

                     {/* Section 4: Join Us Cards */}
                 <section 
           className="snap-start min-h-screen w-full bg-brand-cream px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center items-center relative"
          style={{ 
            backgroundImage: `url('/images/Banner5.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-brand-cream/70" />
          <div className="relative z-10 w-full">
         <motion.div
           className="max-w-6xl mx-auto text-center"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
         >
                       <h2 className="text-3xl font-semibold text-brand-charcoal mb-4">The Craved Artisan Ecosystem</h2>
            <p className="text-brand-grey mb-8 max-w-4xl mx-auto">
              This is the network of creators, customers, and community partners who power our local artisan economy. Together, they make business possible for hardworking tradespeople across every ZIP.
            </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                {[
             { 
               img: 'vendor_1750622113753', 
               label: 'Vendor', 
               description: 'Share your handmade goods with a community that values craftsmanship and quality.',
               learnMore: '/signup?role=VENDOR',
               joinHref: '/signup?role=VENDOR'
             },
             { 
               img: 'supplier_1750627234352', 
               label: 'B2B Vendors', 
               description: 'Supply ingredients and materials to help other vendors create their best products.',
               learnMore: '/signup?role=B2B',
               joinHref: '/signup?role=B2B'
             },
             { 
               img: 'winecheese_1750622113753', 
               label: 'Customer', 
               description: 'Discover and support local artisans while enjoying fresh, high-quality products.',
               learnMore: '/signup?role=CUSTOMER',
               joinHref: '/signup?role=CUSTOMER'
             },
             { 
               img: 'Event coordinator_1750627631683', 
               label: 'Coordinator', 
               description: 'Organize events and markets that bring the community together around local goods.',
               learnMore: '/signup?role=EVENT_COORDINATOR',
               joinHref: '/signup?role=EVENT_COORDINATOR'
             },
             { 
               img: 'DoL1_1750621743272', 
               label: 'Drop-Off', 
               description: 'Host pickup locations that serve as community hubs for local commerce.',
               learnMore: '/signup?role=DROPOFF_MANAGER',
               joinHref: '/signup?role=DROPOFF_MANAGER'
             },
           ].map(({ img, label, description, learnMore, joinHref }) => (
             <div
               key={label}
               className="bg-white border border-brand-charcoal text-brand-charcoal rounded-lg shadow-lg hover:scale-105 transition-all duration-300 text-center overflow-hidden flex flex-col"
             >
                               <div className="h-48 bg-brand-beige overflow-hidden">
                  <img
                    src={`/images/${img}.png`}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                </div>
                               <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-1">{label}</h3>
                  <p className="text-sm text-brand-grey italic mb-4">
                    {label === 'Vendor' && 'Produce'}
                    {label === 'B2B Vendors' && 'Supply'}
                    {label === 'Customer' && 'Support Local'}
                    {label === 'Coordinator' && 'Promote'}
                    {label === 'Drop-Off' && 'Logistics'}
                  </p>
                  <p className="text-sm text-brand-grey mb-4 flex-1">{description}</p>
                 <div className="flex flex-col gap-2">
                   <Link
                     href={learnMore}
                     className="text-brand-green hover:text-brand-green/80 text-sm font-medium transition-colors"
                   >
                     Learn More →
                   </Link>
                   <Link
                     href={joinHref}
                     onClick={() => storeCTA(label)}
                     className="bg-brand-maroon text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#681b24] transition-colors"
                   >
                     Join Now
                   </Link>
                 </div>
               </div>
             </div>
                       ))}
          </div>
          </motion.div>
          </div>
        </section>
      </div>
    </>
  );
} 