'use client';

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ShoppingCart, Search, Bell, MapPin, MessageCircle, Send, X as CloseIcon } from 'lucide-react';
import logonobg from '/images/logonobg.png';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { CartDropdown } from './CartDropdown';
import { useZip } from '../contexts/ZipContext';

export default function NavHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { zip, updateZip, isValidZip, isUsingLocation, setUsingLocation } = useZip();
  const { getTotalItems, setIsOpen: setCartOpen } = useCart();
  const [location] = useLocation();
  const [zipInput, setZipInput] = useState(zip);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuTimeout, setUserMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cartTimeout, setCartTimeout] = useState<NodeJS.Timeout | null>(null);
  const [notificationsTimeout, setNotificationsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [chatTimeout, setChatTimeout] = useState<NodeJS.Timeout | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: 'Hi! I\'m your Craved Artisan assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Determine user role from auth context
  const role = user?.role?.toLowerCase() || 'guest';

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Forums', href: '/community' },
    { label: 'Events', href: '/events' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const roleLinks: Record<string, React.ReactElement | null> = {
    coordinator: <Link href="/events/manage">My Events</Link>,
    customer: <Link href="/dashboard/customer">My Orders</Link>,
    admin: <Link href="/admin">The Bridge</Link>,
    guest: null,
  };

  // Handle scroll for transparent header
  useEffect(() => {
    const handleScroll = () => {
      // Use a fixed pixel threshold instead of percentage for snap scrolling
      const scrollThreshold = window.innerHeight * 0.2; // 20% of viewport height
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.search-container')) {
        setIsSearchOpen(false);
      }
      if (!target.closest('.cart-container')) {
        setIsCartOpen(false);
      }
             if (!target.closest('.notifications-container')) {
         setIsNotificationsOpen(false);
       }
       if (!target.closest('.chat-container')) {
         setIsChatOpen(false);
       }
    };

         if (isUserMenuOpen || isSearchOpen || isCartOpen || isNotificationsOpen || isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isSearchOpen, isCartOpen, isNotificationsOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (userMenuTimeout) {
        clearTimeout(userMenuTimeout);
      }
      if (cartTimeout) {
        clearTimeout(cartTimeout);
      }
             if (notificationsTimeout) {
         clearTimeout(notificationsTimeout);
       }
       if (chatTimeout) {
         clearTimeout(chatTimeout);
       }
    };
  }, [userMenuTimeout, cartTimeout, notificationsTimeout]);

  // Hide NavHeader on storefront pages
  if (location.startsWith('/store/')) {
    return null;
  }

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidZip(zipInput)) {
      updateZip(zipInput);
    } else {
      console.warn('Invalid ZIP code format:', zipInput);
    }
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Reverse geocoding to get ZIP from coordinates
          const { latitude, longitude } = position.coords;
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              if (data.postcode) {
                setZipInput(data.postcode);
                updateZip(data.postcode);
                setUsingLocation(true);
              }
            })
            .catch(error => {
              console.error('Error getting ZIP from location:', error);
            })
            .finally(() => {
              setIsLocating(false);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLocating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleChatClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user' as const,
        message: chatMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      setChatMessage('');
      
      // Simulate AI response
      setIsTyping(true);
      setTimeout(() => {
        const aiResponses = [
          "I'd be happy to help you with that! Let me connect you with the right information.",
          "That's a great question! Here's what I can tell you about that.",
          "I understand you're looking for information about that. Let me help you find what you need.",
          "Thanks for asking! I can definitely help you with that.",
          "I'm here to assist you with any questions about Craved Artisan. What specific information are you looking for?"
        ];
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai' as const,
          message: randomResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <header className={`relative z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur shadow-sm border-b border-border' 
        : 'bg-white/80 backdrop-blur shadow-sm border-b border-border'
    }`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        {/* LEFT: Logo + Desktop Nav */}
        <div className="flex items-center space-x-6">
          <Link href="/">
            <img 
              src={logonobg} 
              alt="Craved Artisan Logo" 
              className="h-12 w-auto object-contain max-w-[200px]"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium text-charcoal">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">{link.label}</Link>
            ))}
                         <Link
               href="/join"
               className="bg-accent text-white px-3 py-1 rounded-lg shadow hover:opacity-90 transition-colors"
             >
               Join
             </Link>
            {role !== 'guest' && (
              <span className="text-charcoal hover:text-accent transition-colors">
                {roleLinks[role]}
              </span>
            )}
          </nav>
        </div>

        {/* RIGHT: ZIP + Icons + Auth */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2">
            <form onSubmit={handleZipSubmit} className="flex items-center border border-[#5B6E02]/30 rounded px-2">
              <input
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                placeholder="ZIP"
                className="bg-transparent text-sm text-[#2C2C2C] outline-none w-20 placeholder-gray-400"
              />
              <button type="submit" className="text-xs text-[#5B6E02] hover:text-[#4A5A01] transition-colors">Go</button>
            </form>
            {isUsingLocation && (
              <div className="flex items-center text-xs text-[#5B6E02]">
                <MapPin className="h-3 w-3 mr-1" />
                <span>Located</span>
              </div>
            )}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="p-1.5 rounded-full bg-[#5B6E02] text-white hover:bg-[#4A5A01] transition-colors disabled:opacity-50"
              title="Use my location"
            >
              <MapPin className="h-3 w-3" />
            </button>
          </div>

          <div className="relative hidden sm:block search-container">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              onMouseEnter={() => {
                // Close other dropdowns first
                setIsCartOpen(false);
                setIsNotificationsOpen(false);
                setIsChatOpen(false);
                
                // Clear other timeouts
                if (cartTimeout) {
                  clearTimeout(cartTimeout);
                  setCartTimeout(null);
                }
                if (notificationsTimeout) {
                  clearTimeout(notificationsTimeout);
                  setNotificationsTimeout(null);
                }
                if (chatTimeout) {
                  clearTimeout(chatTimeout);
                  setChatTimeout(null);
                }
              }}
              className="p-1 hover:bg-[#F7F2EC] rounded transition-colors"
              title="Search"
            >
              <Search className="h-5 w-5 text-[#2C2C2C] cursor-pointer" />
            </button>
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#F7F2EC] text-[#2C2C2C] rounded shadow-md p-4 z-[1000] border-2 border-[#5B6E02]">
                <form onSubmit={handleSearch} className="space-y-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, vendors, events..."
                    className="w-full px-3 py-2 border border-[#5B6E02]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6E02] text-[#2C2C2C] bg-white"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-[#5B6E02] text-white px-4 py-1 rounded hover:bg-[#4A5A01] transition-colors"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-[#2C2C2C] hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="relative cart-container">
            <button
              onClick={() => setCartOpen(!isCartOpen)}
              onMouseEnter={() => {
                // Close other dropdowns first
                setIsNotificationsOpen(false);
                setIsChatOpen(false);
                setIsSearchOpen(false);
                
                // Clear other timeouts
                if (notificationsTimeout) {
                  clearTimeout(notificationsTimeout);
                  setNotificationsTimeout(null);
                }
                if (chatTimeout) {
                  clearTimeout(chatTimeout);
                  setChatTimeout(null);
                }
                
                // Open cart dropdown
                if (cartTimeout) {
                  clearTimeout(cartTimeout);
                  setCartTimeout(null);
                }
                setCartOpen(true);
              }}
              className="p-1 hover:bg-[#F7F2EC] rounded transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5 text-[#2C2C2C] cursor-pointer" />
              {/* Cart badge with actual item count */}
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5B6E02] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <CartDropdown />
          </div>

          <div className="relative notifications-container">
            <button
              onClick={handleNotificationsClick}
              onMouseEnter={() => {
                // Close other dropdowns first
                setIsCartOpen(false);
                setIsChatOpen(false);
                setIsSearchOpen(false);
                
                // Clear other timeouts
                if (cartTimeout) {
                  clearTimeout(cartTimeout);
                  setCartTimeout(null);
                }
                if (chatTimeout) {
                  clearTimeout(chatTimeout);
                  setChatTimeout(null);
                }
                
                // Open notifications dropdown
                if (notificationsTimeout) {
                  clearTimeout(notificationsTimeout);
                  setNotificationsTimeout(null);
                }
                setIsNotificationsOpen(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setIsNotificationsOpen(false);
                }, 300);
                setNotificationsTimeout(timeout);
              }}
              className="p-1 hover:bg-[#F7F2EC] rounded transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-[#2C2C2C] cursor-pointer" />
              {/* Notification badge - you can add notification count here */}
              <span className="absolute -top-1 -right-1 bg-[#5B6E02] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
            {isNotificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-[#F7F2EC] text-[#2C2C2C] rounded shadow-md p-4 z-[1000]"
                onMouseEnter={() => {
                  if (notificationsTimeout) {
                    clearTimeout(notificationsTimeout);
                    setNotificationsTimeout(null);
                  }
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setIsNotificationsOpen(false);
                  }, 300);
                  setNotificationsTimeout(timeout);
                }}
              >
                <h3 className="font-semibold mb-3 flex items-center justify-between">
                  Notifications
                  <span className="text-sm text-gray-500">2 new</span>
                </h3>
                
                {/* Notifications Preview */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  <div className="flex items-start gap-3 p-2 bg-white rounded">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Order Shipped!</p>
                      <p className="text-xs text-gray-500">Your order #1234 has been shipped and will arrive tomorrow.</p>
                      <p className="text-xs text-[#5B6E02] mt-1">2 hours ago</p>
                    </div>
                    <div className="w-2 h-2 bg-[#5B6E02] rounded-full flex-shrink-0"></div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-2 bg-white rounded">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🎪</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New Event Near You</p>
                      <p className="text-xs text-gray-500">Locust Grove Farmers Market this Saturday at 9 AM.</p>
                      <p className="text-xs text-[#5B6E02] mt-1">1 day ago</p>
                    </div>
                    <div className="w-2 h-2 bg-[#5B6E02] rounded-full flex-shrink-0"></div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-2 bg-white/50 rounded">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🥖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New Product Available</p>
                      <p className="text-xs text-gray-500">Rustic Bakes just added fresh sourdough to their menu.</p>
                      <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-[#5B6E02]/30">
                  <Link 
                    href="/notifications" 
                    className="w-full bg-[#5B6E02] text-white py-2 px-3 rounded text-sm text-center hover:bg-[#4A5A01] transition-colors block"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
                          )}
          </div>

          {/* AI Chat Widget */}
          <div className="relative chat-container">
            <button
              onClick={handleChatClick}
              onMouseEnter={() => {
                // Close other dropdowns first
                setIsCartOpen(false);
                setIsNotificationsOpen(false);
                setIsSearchOpen(false);
                
                // Clear other timeouts
                if (cartTimeout) {
                  clearTimeout(cartTimeout);
                  setCartTimeout(null);
                }
                if (notificationsTimeout) {
                  clearTimeout(notificationsTimeout);
                  setNotificationsTimeout(null);
                }
                
                // Open chat dropdown
                if (chatTimeout) {
                  clearTimeout(chatTimeout);
                  setChatTimeout(null);
                }
                setIsChatOpen(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setIsChatOpen(false);
                }, 300);
                setChatTimeout(timeout);
              }}
              className="p-1 hover:bg-[#F7F2EC] rounded transition-colors relative"
              title="AI Assistant"
            >
              <MessageCircle className="h-5 w-5 text-[#2C2C2C] cursor-pointer" />
              {/* Chat indicator - shows when there are unread messages */}
              <span className="absolute -top-1 -right-1 bg-[#5B6E02] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                AI
              </span>
            </button>
            {isChatOpen && (
              <div 
                className="absolute right-0 mt-2 w-96 bg-[#F7F2EC] text-[#2C2C2C] rounded shadow-md z-[1000]"
                onMouseEnter={() => {
                  if (chatTimeout) {
                    clearTimeout(chatTimeout);
                    setChatTimeout(null);
                  }
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setIsChatOpen(false);
                  }, 300);
                  setChatTimeout(timeout);
                }}
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#5B6E02]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#5B6E02] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Craved Artisan Assistant</h3>
                      <p className="text-xs text-gray-500">Live AI Support</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-[#F7F2EC] rounded transition-colors"
                    title="Close chat"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-[#5B6E02] text-white'
                            : 'bg-white text-[#2C2C2C]'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-[#2C2C2C] p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-[#5B6E02]/30">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask me anything about Craved Artisan..."
                      className="flex-1 px-3 py-2 border border-[#5B6E02]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6E02] text-sm"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!chatMessage.trim() || isTyping}
                      className="p-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="relative user-menu-container">
           {isAuthenticated && user ? (
             <div className="relative">
               <button
                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                 onMouseEnter={() => {
                   if (userMenuTimeout) {
                     clearTimeout(userMenuTimeout);
                     setUserMenuTimeout(null);
                   }
                 }}
                 onMouseLeave={() => {
                   const timeout = setTimeout(() => {
                     setIsUserMenuOpen(false);
                   }, 1000);
                   setUserMenuTimeout(timeout);
                 }}
                 className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center cursor-pointer hover:bg-brand-green/90 transition-colors"
               >
                 <span className="text-sm font-medium">
                   {user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                 </span>
               </button>
               {isUserMenuOpen && (
                 <div 
                   className="absolute right-0 mt-3 w-56 bg-white border border-brand-green/20 rounded-lg shadow-lg p-4 z-[1000]"
                   onMouseEnter={() => {
                     if (userMenuTimeout) {
                       clearTimeout(userMenuTimeout);
                       setUserMenuTimeout(null);
                     }
                   }}
                   onMouseLeave={() => {
                     const timeout = setTimeout(() => {
                       setIsUserMenuOpen(false);
                     }, 1000);
                     setUserMenuTimeout(timeout);
                   }}
                 >
                   {/* User Info Section */}
                   <div className="pb-3 border-b border-brand-cream/50 mb-3">
                     <p className="text-sm text-gray-500 mb-1">Hello,</p>
                     <p className="text-sm font-medium text-brand-charcoal">{user.profile?.firstName || user.email}</p>
                   </div>
                   
                   {/* Navigation Links */}
                   <div className="space-y-2">
                     <Link 
                       href="/dashboard" 
                       className="block w-full text-left px-3 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-green rounded-md transition-colors"
                     >
                       Dashboard
                     </Link>
                     <Link 
                       href="/settings" 
                       className="block w-full text-left px-3 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-green rounded-md transition-colors"
                     >
                       Settings
                     </Link>
                   </div>
                   
                   {/* Logout Button */}
                   <div className="pt-3 border-t border-brand-cream/50 mt-3">
                     <button 
                       onClick={logout} 
                       className="block w-full text-left px-3 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-green rounded-md transition-colors"
                     >
                       Logout
                     </button>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <Link href="/login" className="text-sm text-[#2C2C2C]">Login</Link>
           )}
         </div>

         {/* Mobile menu toggle */}
         <button className="md:hidden" onClick={() => setMobileOpen(!isMobileOpen)}>
           {isMobileOpen ? <X className="h-6 w-6 text-[#2C2C2C]" /> : <Menu className="h-6 w-6 text-[#2C2C2C]" />}
         </button>
       </div>
     </div>

     {/* Mobile Slideout */}
     {isMobileOpen && (
       <div className="md:hidden bg-[#F7F2EC] border-t px-6 py-4 space-y-4 text-[#2C2C2C]">
         {/* Mobile ZIP input */}
         <div className="flex items-center space-x-2 pb-4 border-b border-[#5B6E02]/30">
           <form onSubmit={handleZipSubmit} className="flex-1 flex items-center border border-[#5B6E02]/30 rounded px-2">
             <input
               type="text"
               value={zipInput}
               onChange={(e) => setZipInput(e.target.value)}
               placeholder="ZIP"
               className="bg-transparent text-sm text-[#2C2C2C] outline-none w-full placeholder-gray-400"
             />
             <button type="submit" className="text-xs text-[#5B6E02] hover:text-[#4A5A01] transition-colors">Go</button>
           </form>
           {isUsingLocation && (
             <div className="flex items-center text-xs text-[#5B6E02]">
               <MapPin className="h-3 w-3 mr-1" />
               <span>Located</span>
             </div>
           )}
           <button
             onClick={handleLocateMe}
             disabled={isLocating}
             className="p-2 rounded-full bg-[#5B6E02] text-white hover:bg-[#4A5A01] transition-colors disabled:opacity-50"
             title="Use my location"
           >
             <MapPin className="h-4 w-4" />
           </button>
         </div>
         
         {navLinks.map(link => (
           <Link key={link.href} href={link.href}>{link.label}</Link>
         ))}
                   <Link href="/join" className="block bg-[#5B6E02] text-white px-3 py-1 rounded shadow">Join</Link>
         {role !== 'guest' && (
           <span className="text-[#2C2C2C] hover:text-[#5B6E02] transition-colors">
             {roleLinks[role]}
           </span>
         )}
       </div>
     )}
   </header>
 );
} 