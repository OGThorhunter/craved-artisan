
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, DollarSign, TrendingUp, Package, MessageSquare, MapPin, Calendar, ExternalLink, Copy, Edit } from 'lucide-react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Link } from 'wouter';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState('');

  // Generate real storefront URL based on user data
  useEffect(() => {
    // Use the actual working storefront URL
    setStorefrontUrl(`https://craved-artisan.com/store/artisan-bakes-atlanta`);
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8 pt-8">
        
        {/* User Info Card */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-[#5B6E02] shadow-md">
                <img 
                  src="/vendor-logo.png" 
                  alt="Vendor Logo" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-[#5B6E02] rounded-full flex items-center justify-center text-white font-bold text-lg hidden">
                  {user?.email?.charAt(0).toUpperCase() || 'V'}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">
                  Welcome back, {user?.email || 'User'}!
                </h1>
                <p className="text-[#2C2C2C]">Role: {user?.role || 'Unknown'}</p>
                <button
                  onClick={() => setLocation('/dashboard/vendor/site-settings')}
                  className="text-[#5B6E02] hover:text-[#8B4513] underline text-sm mt-1 transition-colors"
                >
                  Manage Profile & Settings →
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Storefront URL */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#2C2C2C]">Storefront URL</h3>
            <ExternalLink className="w-5 h-5 text-[#5B6E02]" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2">
              <span className="text-gray-600">https://craved-artisan.com/store/</span>
              <span className="font-semibold text-[#5B6E02]">artisan-bakes-atlanta</span>
            </div>
            <button 
              onClick={handleCopyUrl}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-3">
            <Link href="/store/artisan-bakes-atlanta">
              <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Store
              </button>
            </Link>
            <Link href="/store/artisan-bakes-atlanta">
              <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Store
              </button>
            </Link>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <DollarSign className="w-6 h-6 text-[#5B6E02] mr-2" />
              Revenue Overview
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/financials')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Financials →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Today's Revenue</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$847.50</div>
              <div className="text-xs text-green-600">+12.5%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Month to Date</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$12,847.50</div>
              <div className="text-xs text-green-600">+8.2%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Quarterly Revenue</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$38,847.50</div>
              <div className="text-xs text-green-600">+15.7%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Yearly Revenue</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$147,847.50</div>
              <div className="text-xs text-green-600">+22.3%</div>
            </div>
          </div>
        </div>

        {/* Product Analytics */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <TrendingUp className="w-6 h-6 text-[#5B6E02] mr-2" />
              Product Analytics
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/analytics')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Analytics →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Top 3 Most Popular Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Artisan Sourdough Bread</span>
                  <span className="text-sm font-semibold text-[#5B6E02]">127 orders</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Handmade Soap Bar</span>
                  <span className="text-sm font-semibold text-[#5B6E02]">89 orders</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Organic Honey</span>
                  <span className="text-sm font-semibold text-[#5B6E02]">76 orders</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Top 3 Best Profit Margin Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Custom Jewelry</span>
                  <span className="text-sm font-semibold text-green-600">78% margin</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Handmade Candles</span>
                  <span className="text-sm font-semibold text-green-600">65% margin</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Artisan Cheese</span>
                  <span className="text-sm font-semibold text-green-600">58% margin</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Top 3 Least Popular Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Specialty Vinegar</span>
                  <span className="text-sm font-semibold text-red-600">12 orders</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Herbal Tea Blend</span>
                  <span className="text-sm font-semibold text-red-600">8 orders</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Artisan Pickles</span>
                  <span className="text-sm font-semibold text-red-600">5 orders</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Top 3 Worst Profit Margin Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Fresh Produce</span>
                  <span className="text-sm font-semibold text-red-600">15% margin</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Bulk Grains</span>
                  <span className="text-sm font-semibold text-red-600">22% margin</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Dairy Products</span>
                  <span className="text-sm font-semibold text-red-600">28% margin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Events */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <Package className="w-6 h-6 text-[#5B6E02] mr-2" />
              Sales Events
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/orders')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Sales Events →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total Pending</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">23</div>
              <div className="text-xs text-blue-600">$2,847.50 value</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Next Cutoff</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">Today</div>
              <div className="text-xs text-orange-600">3:00 PM EST</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Revenue Pending</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$2,847.50</div>
              <div className="text-xs text-green-600">+15.2% vs last week</div>
            </div>
          </div>
        </div>

        {/* Customer Messages */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <MessageSquare className="w-6 h-6 text-[#5B6E02] mr-2" />
              Customer Messages
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/messaging')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Messages →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5B6E02] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  SM
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C]">Sarah Mitchell</div>
                  <div className="text-sm text-gray-600">When will my order ship?</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  JD
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C]">John Davis</div>
                  <div className="text-sm text-gray-600">Can I change my delivery address?</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">5 hours ago</div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5B6E02] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ML
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C]">Maria Lopez</div>
                  <div className="text-sm text-gray-600">Do you have gluten-free options?</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>

        {/* Dropoff Location Relationships */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <MapPin className="w-6 h-6 text-[#5B6E02] mr-2" />
              Dropoff Location Relationships
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/relationships')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Relationships →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-[#2C2C2C] mb-2">Atlanta Farmers Market</div>
              <div className="text-sm text-gray-600">Weekly dropoffs on Saturdays</div>
              <div className="text-xs text-green-600 mt-1">Active partnership</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-[#2C2C2C] mb-2">East Atlanta Village</div>
              <div className="text-sm text-gray-600">Bi-weekly dropoffs on Wednesdays</div>
              <div className="text-xs text-green-600 mt-1">Active partnership</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-[#2C2C2C] mb-2">Buckhead Community Center</div>
              <div className="text-sm text-gray-600">Monthly dropoffs on first Sunday</div>
              <div className="text-xs text-blue-600 mt-1">Pending approval</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-[#2C2C2C] mb-2">Decatur Square</div>
              <div className="text-sm text-gray-600">Weekly dropoffs on Fridays</div>
              <div className="text-xs text-green-600 mt-1">Active partnership</div>
            </div>
          </div>
        </div>

        {/* Events I'm Signed Up For */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <Calendar className="w-6 h-6 text-[#5B6E02] mr-2" />
              Events I'm Signed Up For
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/events')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Events →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Atlanta Food & Wine Festival</div>
                <div className="text-sm text-gray-600">June 15-17, 2024 • Atlanta, GA</div>
              </div>
              <div className="text-xs text-green-600 font-medium">Confirmed</div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Summer Artisan Market</div>
                <div className="text-sm text-gray-600">July 8-10, 2024 • Piedmont Park</div>
              </div>
              <div className="text-xs text-green-600 font-medium">Confirmed</div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Fall Harvest Celebration</div>
                <div className="text-sm text-gray-600">October 12-14, 2024 • Grant Park</div>
              </div>
              <div className="text-xs text-blue-600 font-medium">Pending</div>
            </div>
          </div>
        </div>

        {/* Events I'm Not Signed Up For */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C] flex items-center">
              <Calendar className="w-6 h-6 text-[#5B6E02] mr-2" />
              Events I'm Not Signed Up For
            </h3>
            <button
              onClick={() => setLocation('/dashboard/vendor/events')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
            >
              View Events →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Spring Craft Fair</div>
                <div className="text-sm text-gray-600">April 20-22, 2024 • Marietta, GA</div>
              </div>
              <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-1 rounded text-xs transition-colors">
                Sign Up
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Downtown Market Days</div>
                <div className="text-sm text-gray-600">May 5-7, 2024 • Downtown Atlanta</div>
              </div>
              <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-1 rounded text-xs transition-colors">
                Sign Up
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium text-[#2C2C2C]">Holiday Bazaar</div>
                <div className="text-sm text-gray-600">December 14-16, 2024 • Buckhead</div>
              </div>
              <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-1 rounded text-xs transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage; 