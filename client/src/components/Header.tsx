import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, ShoppingBag, Store } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Craved Artisan</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/products') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}>
                Products
              </span>
            </Link>
            <Link href="/artisans">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/artisans') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}>
                Artisans
              </span>
            </Link>
            <Link href="/events">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/events') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}>
                Events
              </span>
            </Link>
            <Link href="/about">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/about') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}>
                About
              </span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.profile?.firstName || user?.email}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    
                    <Link href="/dashboard">
                      <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        Dashboard
                      </span>
                    </Link>
                    
                    {user?.role === 'CUSTOMER' && (
                      <Link href="/dashboard/customer">
                        <span className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          My Orders
                        </span>
                      </Link>
                    )}
                    
                    {user?.role === 'VENDOR' && (
                      <Link href="/dashboard/vendor">
                        <span className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <Store className="w-4 h-4 mr-2" />
                          My Store
                        </span>
                      </Link>
                    )}
                    
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/join">
                  <button className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Join as Artisan
                  </button>
                </Link>
                <Link href="/login">
                  <button className="btn-secondary text-sm">Sign In</button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary text-sm">Sign Up</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-4">
              <Link href="/products">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/products') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}>
                  Products
                </span>
              </Link>
              <Link href="/artisans">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/artisans') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}>
                  Artisans
                </span>
              </Link>
              <Link href="/events">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/events') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}>
                  Events
                </span>
              </Link>
              <Link href="/about">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/about') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}>
                  About
                </span>
              </Link>
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 text-sm text-gray-700">
                      <div className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <Link href="/dashboard">
                      <button className="w-full text-left text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                        Dashboard
                      </button>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/join">
                      <button className="w-full text-left text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                        Join as Artisan
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="w-full btn-secondary text-sm">Sign In</button>
                    </Link>
                    <Link href="/signup">
                      <button className="w-full btn-primary text-sm">Sign Up</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}; 