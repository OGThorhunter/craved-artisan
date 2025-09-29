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
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              {isScrolled ? (
                // Scrolled state - show compact logo with text
                <>
                  <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg">
                    <img
                      src="/images/logonobg.png"
                      alt="Craved Artisan Logo"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold text-brand-charcoal">
                    Craved Artisan
                  </span>
                </>
              ) : (
                // Transparent state - show just the logo (hero page has its own logo)
                <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg">
                  <img
                    src="/images/logonobg.png"
                    alt="Craved Artisan Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/products">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/products') 
                  ? (isScrolled ? 'text-brand-green' : 'text-white') 
                  : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
              }`}>
                Products
              </span>
            </Link>
            <Link href="/artisans">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/artisans') 
                  ? (isScrolled ? 'text-brand-green' : 'text-white') 
                  : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
              }`}>
                Artisans
              </span>
            </Link>
            <Link href="/events">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/events') 
                  ? (isScrolled ? 'text-brand-green' : 'text-white') 
                  : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
              }`}>
                Events
              </span>
            </Link>
            <Link href="/about">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                isActive('/about') 
                  ? (isScrolled ? 'text-brand-green' : 'text-white') 
                  : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
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
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    isScrolled 
                      ? 'text-brand-charcoal hover:text-brand-green' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.profile?.firstName || user?.email}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-[1000] border border-gray-200">
                    <div className="px-4 py-3 text-sm text-brand-charcoal border-b border-gray-200 bg-brand-cream/50">
                      <div className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                      <div className="text-brand-grey">{user?.email}</div>
                    </div>
                    
                    <Link href="/dashboard">
                      <span className="block px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream cursor-pointer transition-colors">
                        Dashboard
                      </span>
                    </Link>
                    
                    {user?.role === 'CUSTOMER' && (
                      <Link href="/dashboard/customer">
                        <span className="flex items-center px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream cursor-pointer transition-colors">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          My Orders
                        </span>
                      </Link>
                    )}
                    
                    {user?.role === 'VENDOR' && (
                      <>
                        <Link href="/dashboard/vendor">
                          <span className="flex items-center px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream cursor-pointer transition-colors">
                            <Store className="w-4 h-4 mr-2" />
                            My Store
                          </span>
                        </Link>
                        <Link href="/dashboard/vendor/products">
                          <span className="flex items-center px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream cursor-pointer transition-colors">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Manage Products
                          </span>
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-green transition-colors"
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
                  <button className={`text-sm font-medium transition-colors ${
                    isScrolled 
                      ? 'text-brand-charcoal hover:text-brand-green' 
                      : 'text-white/90 hover:text-white'
                  }`}>
                    Join as Artisan
                  </button>
                </Link>
                <Link href="/login">
                  <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-brand-cream text-brand-charcoal hover:bg-brand-beige' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  }`}>
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-brand-green text-white hover:bg-brand-green-hover' 
                      : 'bg-brand-maroon text-white hover:bg-[#681b24]'
                  }`}>
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? 'text-brand-charcoal hover:bg-brand-cream' 
                : 'text-white hover:bg-white/20'
            }`}
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
          <div className={`md:hidden border-t ${
            isScrolled ? 'border-gray-200 bg-white' : 'border-white/20 bg-black/20 backdrop-blur-lg'
          }`}>
            <div className="px-6 py-4 space-y-4">
              <Link href="/products">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/products') 
                    ? (isScrolled ? 'text-brand-green' : 'text-white') 
                    : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
                }`}>
                  Products
                </span>
              </Link>
              <Link href="/artisans">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/artisans') 
                    ? (isScrolled ? 'text-brand-green' : 'text-white') 
                    : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
                }`}>
                  Artisans
                </span>
              </Link>
              <Link href="/events">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/events') 
                    ? (isScrolled ? 'text-brand-green' : 'text-white') 
                    : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
                }`}>
                  Events
                </span>
              </Link>
              <Link href="/about">
                <span className={`block text-sm font-medium transition-colors cursor-pointer ${
                  isActive('/about') 
                    ? (isScrolled ? 'text-brand-green' : 'text-white') 
                    : (isScrolled ? 'text-brand-charcoal hover:text-brand-green' : 'text-white/90 hover:text-white')
                }`}>
                  About
                </span>
              </Link>
              
              <div className={`pt-4 border-t ${
                isScrolled ? 'border-gray-200' : 'border-white/20'
              } space-y-3`}>
                {isAuthenticated ? (
                  <>
                    <div className={`px-2 py-2 text-sm ${
                      isScrolled ? 'text-brand-charcoal' : 'text-white'
                    }`}>
                      <div className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                      <div className={isScrolled ? 'text-brand-grey' : 'text-white/75'}>{user?.email}</div>
                    </div>
                    <Link href="/dashboard">
                      <button className={`w-full text-left text-sm font-medium transition-colors ${
                        isScrolled 
                          ? 'text-brand-charcoal hover:text-brand-green' 
                          : 'text-white/90 hover:text-white'
                      }`}>
                        Dashboard
                      </button>
                    </Link>
                    {user?.role === 'VENDOR' && (
                      <>
                        <Link href="/dashboard/vendor">
                          <button className={`w-full text-left text-sm font-medium transition-colors ${
                            isScrolled 
                              ? 'text-brand-charcoal hover:text-brand-green' 
                              : 'text-white/90 hover:text-white'
                          }`}>
                            My Store
                          </button>
                        </Link>
                        <Link href="/dashboard/vendor/products">
                          <button className={`w-full text-left text-sm font-medium transition-colors ${
                            isScrolled 
                              ? 'text-brand-charcoal hover:text-brand-green' 
                              : 'text-white/90 hover:text-white'
                          }`}>
                            Manage Products
                          </button>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/join">
                      <button className={`w-full text-left text-sm font-medium transition-colors ${
                        isScrolled 
                          ? 'text-brand-charcoal hover:text-brand-green' 
                          : 'text-white/90 hover:text-white'
                      }`}>
                        Join as Artisan
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isScrolled 
                          ? 'bg-brand-cream text-brand-charcoal hover:bg-brand-beige' 
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                      }`}>
                        Sign In
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isScrolled 
                          ? 'bg-brand-green text-white hover:bg-brand-green-hover' 
                          : 'bg-brand-maroon text-white hover:bg-[#681b24]'
                      }`}>
                        Sign Up
                      </button>
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