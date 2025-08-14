'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Map, Sliders, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoveryMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}

interface LocationData {
  zip: string;
  city: string;
  state: string;
  coordinates?: { lat: number; lng: number };
}

interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
  vendorIds: string[];
  description: string;
}

interface SmartDiscoveryEngineProps {
  userZip: string;
  onZipChange: (zip: string) => void;
  onDiscoveryModeChange: (mode: string) => void;
  onDistanceChange: (distance: number) => void;
  onEventFilterChange: (eventId: string | null) => void;
  events: EventData[];
  maxDistance: number;
}

export default function SmartDiscoveryEngine({
  userZip,
  onZipChange,
  onDiscoveryModeChange,
  onDistanceChange,
  onEventFilterChange,
  events,
  maxDistance
}: SmartDiscoveryEngineProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);
  const [showEventFilter, setShowEventFilter] = useState(false);
  const [tempZip, setTempZip] = useState(userZip);
  const [distance, setDistance] = useState(maxDistance);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<EventData[]>([]);

  const discoveryModes: DiscoveryMode[] = [
    {
      id: 'zip-first',
      name: 'Zip-First',
      description: 'Show vendors in your area',
      icon: <MapPin className="w-4 h-4" />,
      active: true
    },
    {
      id: 'near-me',
      name: 'Near Me',
      description: 'Distance-based discovery',
      icon: <Map className="w-4 h-4" />,
      active: false
    },
    {
      id: 'event-aware',
      name: 'Event Mode',
      description: 'This weekend\'s market vendors',
      icon: <Calendar className="w-4 h-4" />,
      active: false
    }
  ];

  const [activeMode, setActiveMode] = useState('zip-first');

  useEffect(() => {
    // Filter events happening this weekend
    const thisWeekend = events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7; // This week
    });
    setNearbyEvents(thisWeekend);
  }, [events]);

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    onDiscoveryModeChange(modeId);
    
    if (modeId === 'event-aware') {
      setShowEventFilter(true);
      setShowDistanceSlider(false);
    } else if (modeId === 'near-me') {
      setShowDistanceSlider(true);
      setShowEventFilter(false);
    } else {
      setShowDistanceSlider(false);
      setShowEventFilter(false);
    }
  };

  const handleZipSubmit = () => {
    onZipChange(tempZip);
    setShowLocationPicker(false);
  };

  const handleDistanceChange = (newDistance: number) => {
    setDistance(newDistance);
    onDistanceChange(newDistance);
  };

  const handleEventSelect = (eventId: string | null) => {
    setSelectedEvent(eventId);
    onEventFilterChange(eventId);
  };

  const getSmartPlaceholder = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Looking for fresh morning bread?';
    if (hour < 17) return 'Need lunch or afternoon treats?';
    return 'Evening artisan delights?';
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Discovery Mode Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-brand-green" />
            <h3 className="font-semibold text-gray-900">Smart Discovery</h3>
          </div>
          <div className="flex gap-2">
            {discoveryModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  activeMode === mode.id
                    ? 'bg-brand-green text-white border-brand-green'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {mode.icon}
                <div className="text-left">
                  <div className="font-medium text-sm">{mode.name}</div>
                  <div className="text-xs opacity-80">{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Current Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Showing results near</span>
              <button
                onClick={() => setShowLocationPicker(true)}
                className="text-brand-green hover:text-brand-green/80 font-medium"
              >
                {userZip}
              </button>
            </div>

            {/* Active Filters */}
            <AnimatePresence>
              {activeMode === 'near-me' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-gray-600">Within</span>
                  <span className="text-sm font-medium text-brand-green">{distance} miles</span>
                </motion.div>
              )}

              {activeMode === 'event-aware' && selectedEvent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-brand-green" />
                  <span className="text-sm font-medium text-brand-green">
                    {events.find(e => e.id === selectedEvent)?.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeMode === 'near-me' && (
              <button
                onClick={() => setShowDistanceSlider(!showDistanceSlider)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Sliders className="w-4 h-4" />
                Distance
              </button>
            )}

            {activeMode === 'event-aware' && (
              <button
                onClick={() => setShowEventFilter(!showEventFilter)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Calendar className="w-4 h-4" />
                Events
              </button>
            )}
          </div>
        </div>

        {/* Distance Slider */}
        <AnimatePresence>
          {showDistanceSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Distance:</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">{distance} miles</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Filter */}
        <AnimatePresence>
          {showEventFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-green" />
                  <span className="text-sm font-medium text-gray-700">This Week's Events:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEventSelect(null)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      selectedEvent === null
                        ? 'bg-brand-green text-white border-brand-green'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    All Events
                  </button>
                  {nearbyEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        selectedEvent === event.id
                          ? 'bg-brand-green text-white border-brand-green'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={tempZip}
                    onChange={(e) => setTempZip(e.target.value)}
                    placeholder="Enter ZIP code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLocationPicker(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleZipSubmit}
                    className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                  >
                    Update Location
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
