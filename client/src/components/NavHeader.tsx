'use client';

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Search, User, Bell } from 'lucide-react';

type UserRole = 'guest' | 'vendor' | 'coordinator' | 'customer' | 'admin';

interface Props {
  role: UserRole;
  currentZip: string;
  onZipChange: (zip: string) => void;
}

export default function NavHeader({ role, currentZip, onZipChange }: Props) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zipInput, setZipInput] = useState(currentZip);
  const [isZipValid, setIsZipValid] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // Optional: Browser geolocation logic
    // navigator.geolocation.getCurrentPosition(...) -> reverse lookup ZIP
  }, []);

  const roleLinks = {
    vendor: <Link href="/vendor"><span>Manage Shop</span></Link>,
    coordinator: <Link href="/events/manage"><span>My Events</span></Link>,
    customer: <Link href="/orders"><span>My Orders</span></Link>,
    admin: <Link href="/admin"><span>The Bridge</span></Link>,
    guest: null,
  };

  const validateZip = (zip: string) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateZip(zipInput)) {
      setIsZipValid(true);
      onZipChange(zipInput);
    } else {
      setIsZipValid(false);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/95 shadow-sm border-b border-brand-soft-beige/20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        
        {/* Left: Logo + Primary Nav */}
        <div className="flex items-center space-x-6">
          <Link href="/">
            <span className="text-xl font-bold tracking-wide text-brand-verdun-green">Craved Artisan</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium text-brand-charcoal">
            <Link href="/categories" className="hover:text-brand-verdun-green transition-colors">Marketplace</Link>
            <Link href="/vendors" className="hover:text-brand-verdun-green transition-colors">Vendors</Link>
            <Link href="/events" className="hover:text-brand-verdun-green transition-colors">Events</Link>
            <Link href="/about" className="hover:text-brand-verdun-green transition-colors">About</Link>
            <Link href="/contact" className="hover:text-brand-verdun-green transition-colors">Contact</Link>
            <Link href="/join" className="bg-brand-crown-thorns text-white px-3 py-1 rounded-lg shadow hover:bg-brand-crown-thorns/90 transition-colors">Join</Link>
            {roleLinks[role]}
          </nav>
        </div>

        {/* Right: ZIP + Search + Cart + Auth */}
        <div className="flex items-center space-x-4">
          {/* ZIP Code Input */}
          <form onSubmit={handleZipSubmit} className="hidden lg:flex items-center border border-brand-soft-beige rounded-lg px-2 bg-white">
            <input
              type="text"
              value={zipInput}
              onChange={(e) => {
                setZipInput(e.target.value);
                setIsZipValid(true);
              }}
              placeholder="Enter ZIP"
              className={`bg-transparent px-2 py-1 text-sm outline-none w-20 text-brand-charcoal ${
                !isZipValid ? 'border-red-500' : ''
              }`}
            />
            <button type="submit" className="text-xs text-brand-verdun-green hover:text-brand-verdun-green/80 transition-colors">Go</button>
          </form>

          {/* Search */}
          <div className="relative group hidden sm:block">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1 hover:bg-brand-off-white rounded-lg transition-colors"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-brand-charcoal" />
            </button>
            
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-brand-soft-beige p-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, vendors, events..."
                  className="w-full px-3 py-2 border border-brand-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-verdun-green text-brand-charcoal"
                  autoFocus
                />
                {/* Search results would go here */}
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <div className="relative group">
            <Link href="/cart" className="p-1 hover:bg-brand-off-white rounded-lg transition-colors relative">
              <ShoppingCart className="h-5 w-5 text-brand-charcoal" />
              {/* Cart badge would go here */}
            </Link>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <Link href="/notifications" className="p-1 hover:bg-brand-off-white rounded-lg transition-colors relative">
              <Bell className="h-5 w-5 text-brand-charcoal" />
              {/* Notification badge would go here */}
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 hover:bg-brand-off-white rounded-lg transition-colors"
              aria-label="User menu"
            >
              <User className="h-5 w-5 text-brand-charcoal" />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-soft-beige">
                <Link href="/login" className="block px-4 py-2 hover:bg-brand-off-white text-brand-charcoal">Login</Link>
                <Link href="/signup" className="block px-4 py-2 hover:bg-brand-off-white text-brand-charcoal">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-1 hover:bg-brand-off-white rounded-lg transition-colors" 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-brand-charcoal" /> : <Menu className="h-6 w-6 text-brand-charcoal" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="md:hidden bg-brand-off-white border-t border-brand-soft-beige px-6 py-4 space-y-4"
        >
          <Link href="/categories" className="block text-brand-charcoal hover:text-brand-verdun-green transition-colors">Marketplace</Link>
          <Link href="/vendors" className="block text-brand-charcoal hover:text-brand-verdun-green transition-colors">Vendors</Link>
          <Link href="/events" className="block text-brand-charcoal hover:text-brand-verdun-green transition-colors">Events</Link>
          <Link href="/about" className="block text-brand-charcoal hover:text-brand-verdun-green transition-colors">About</Link>
          <Link href="/contact" className="block text-brand-charcoal hover:text-brand-verdun-green transition-colors">Contact</Link>
          <Link href="/join" className="block bg-brand-crown-thorns text-white px-3 py-2 rounded-lg shadow text-center">Join</Link>
          {role !== 'guest' && roleLinks[role]}
        </motion.div>
      )}
    </header>
  );
} 