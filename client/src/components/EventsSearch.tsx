import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Check,
  SlidersHorizontal,
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

type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type SearchFilters = {
  q: string;
  category: string;
  tags: string[];
  city: string;
  state: string;
  from: string;
  to: string;
  lat: number | null;
  lng: number | null;
  radius: number;
  sort: 'relevance' | 'date' | 'distance' | 'popular';
};

interface EventsSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: FilterOption[];
  tags: FilterOption[];
  locations: FilterOption[];
  onSearch: () => void;
  loading?: boolean;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function EventsSearch({
  filters,
  onFiltersChange,
  categories,
  tags,
  locations,
  onSearch,
  loading = false,
  showFilters = false,
  onToggleFilters
}: EventsSearchProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const tagsButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (showMobileFilters) {
      const firstInput = document.querySelector('#mobile-filters input, #mobile-filters select') as HTMLElement;
      firstInput?.focus();
    }
  }, [showMobileFilters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  }, [onSearch]);

  const clearFilters = useCallback(() => {
    onFiltersChange({
      q: '',
      category: '',
      tags: [],
      city: '',
      state: '',
      from: '',
      to: '',
      lat: null,
      lng: null,
      radius: 25,
      sort: 'relevance'
    });
  }, [onFiltersChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter(tag => tag !== tagToRemove));
  }, [filters.tags, updateFilter]);

  const toggleTag = useCallback((tag: string) => {
    if (filters.tags.includes(tag)) {
      updateFilter('tags', filters.tags.filter(t => t !== tag));
    } else {
      updateFilter('tags', [...filters.tags, tag]);
    }
  }, [filters.tags, updateFilter]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFilter('lat', position.coords.latitude);
          updateFilter('lng', position.coords.longitude);
          updateFilter('radius', 25);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [updateFilter]);

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Date (Soonest First)' },
    { value: 'distance', label: 'Distance (Nearest First)' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const hasActiveFilters = filters.q || filters.category || filters.tags.length > 0 || 
                          filters.city || filters.state || filters.from || filters.to ||
                          filters.lat !== null || filters.lng !== null;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4b4b4b]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search events, e.g., 'farmers market'"
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#7F232E]/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                aria-label="Search events"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search for events by name, description, or keywords
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6 py-3"
              aria-label="Search events"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              ref={locationButtonRef}
              variant="secondary"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2"
              aria-expanded={isLocationOpen}
              aria-haspopup="true"
              aria-label="Filter by location"
            >
              <MapPin className="h-4 w-4" />
              {filters.city ? `${filters.city}, ${filters.state}` : 'Location'}
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Button
              ref={categoryButtonRef}
              variant="secondary"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2"
              aria-expanded={isCategoryOpen}
              aria-haspopup="true"
              aria-label="Filter by category"
            >
              <Calendar className="h-4 w-4" />
              {filters.category || 'Category'}
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Button
              ref={sortButtonRef}
              variant="secondary"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2"
              aria-expanded={isSortOpen}
              aria-haspopup="true"
              aria-label="Sort events"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {sortOptions.find(opt => opt.value === filters.sort)?.label || 'Sort'}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {onToggleFilters && (
              <Button
                variant="secondary"
                onClick={onToggleFilters}
                className="flex items-center gap-2"
                aria-label="Toggle advanced filters"
              >
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.q && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.q}
                  <button
                    onClick={() => updateFilter('q', '')}
                    className="ml-1 hover:text-red-600"
                    aria-label={`Remove search filter: ${filters.q}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.category}
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="ml-1 hover:text-red-600"
                    aria-label={`Remove category filter: ${filters.category}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                    aria-label={`Remove tag filter: ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {(filters.city || filters.state) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.city}, {filters.state}
                  <button
                    onClick={() => {
                      updateFilter('city', '');
                      updateFilter('state', '');
                    }}
                    className="ml-1 hover:text-red-600"
                    aria-label="Remove location filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-[#7F232E] hover:text-[#6b1e27]"
                aria-label="Clear all filters"
              >
                Clear All
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Location Dropdown */}
      <AnimatePresence>
        {isLocationOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-64"
            style={{ top: locationButtonRef.current?.offsetTop + 40, left: locationButtonRef.current?.offsetLeft }}
          >
            <Card className="p-4 space-y-3">
              <h3 className="font-medium text-[#2b2b2b]">Location</h3>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  aria-label="City"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={filters.state}
                  onChange={(e) => updateFilter('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  aria-label="State"
                />
              </div>

              <Button
                variant="secondary"
                onClick={getCurrentLocation}
                className="w-full flex items-center gap-2"
                aria-label="Use my current location"
              >
                <MapPin className="h-4 w-4" />
                Use My Location
              </Button>

              {locations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#4b4b4b]">Popular Locations</p>
                  {locations.slice(0, 5).map(location => (
                    <button
                      key={location.value}
                      onClick={() => {
                        const [city, state] = location.value.split(', ');
                        updateFilter('city', city);
                        updateFilter('state', state);
                        setIsLocationOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      aria-label={`Select location: ${location.value}`}
                    >
                      {location.value} ({location.count})
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Dropdown */}
      <AnimatePresence>
        {isCategoryOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-64"
            style={{ top: categoryButtonRef.current?.offsetTop + 40, left: categoryButtonRef.current?.offsetLeft }}
          >
            <Card className="p-4 space-y-3">
              <h3 className="font-medium text-[#2b2b2b]">Category</h3>
              
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateFilter('category', '');
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-sm rounded flex items-center gap-2 ${
                    !filters.category ? 'bg-[#7F232E]/10 text-[#7F232E]' : 'hover:bg-gray-100'
                  }`}
                  aria-label="Clear category filter"
                >
                  {!filters.category && <Check className="h-4 w-4" />}
                  All Categories
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => {
                      updateFilter('category', category.value);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm rounded flex items-center gap-2 ${
                      filters.category === category.value ? 'bg-[#7F232E]/10 text-[#7F232E]' : 'hover:bg-gray-100'
                    }`}
                    aria-label={`Select category: ${category.label}`}
                  >
                    {filters.category === category.value && <Check className="h-4 w-4" />}
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Dropdown */}
      <AnimatePresence>
        {isSortOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-48"
            style={{ top: sortButtonRef.current?.offsetTop + 40, left: sortButtonRef.current?.offsetLeft }}
          >
            <Card className="p-4 space-y-1">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateFilter('sort', option.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-sm rounded flex items-center gap-2 ${
                    filters.sort === option.value ? 'bg-[#7F232E]/10 text-[#7F232E]' : 'hover:bg-gray-100'
                  }`}
                  aria-label={`Sort by ${option.label}`}
                >
                  {filters.sort === option.value && <Check className="h-4 w-4" />}
                  {option.label}
                </button>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          id="mobile-filters"
        >
          <Card className="p-4 space-y-4">
            <h3 className="font-medium text-[#2b2b2b]">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => updateFilter('from', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  aria-label="Start date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => updateFilter('to', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  aria-label="End date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.tags.includes(tag.value)
                        ? 'bg-[#7F232E] text-white border-[#7F232E]'
                        : 'bg-white text-[#4b4b4b] border-[#7F232E]/20 hover:border-[#7F232E]/40'
                    }`}
                    aria-label={`${filters.tags.includes(tag.value) ? 'Remove' : 'Add'} tag: ${tag.label}`}
                    aria-pressed={filters.tags.includes(tag.value)}
                  >
                    {tag.label} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
