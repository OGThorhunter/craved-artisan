
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, DollarSign, TrendingUp, Package, MessageSquare, MapPin, Calendar, ExternalLink } from 'lucide-react';
import DashboardNav from '@/components/dashboard/DashboardNav';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState('');

  // Generate real storefront URL based on user data
  useEffect(() => {
    if (user?.email) {
      const storeSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      setStorefrontUrl(`https://craved-artisan.com/store/${storeSlug}`);
    }
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
      <div className="container mx-auto px-4 py-8 pt-20">
        
        {/* User Info Card */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#5B6E02] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">
                  Welcome back, {user?.email || 'User'}!
                </h1>
                <p className="text-[#2C2C2C]">Role: {user?.role || 'Unknown'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors border-2 border-black shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Storefront URL Section */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-semibold text-[#2C2C2C] mb-3">Storefront URL</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-lg px-3 py-2">
              <code className="text-sm text-[#2C2C2C]">{storefrontUrl}</code>
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors border-2 border-black shadow-md hover:shadow-lg"
              title="Copy URL"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setLocation(`/store/${user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
              className="flex-1 px-3 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors text-sm border-2 border-black shadow-md hover:shadow-lg"
            >
              View Storefront
            </button>
            <button
              onClick={() => setLocation('/dashboard/vendor')}
              className="flex-1 px-3 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors text-sm border-2 border-black shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Vendor Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
            <DollarSign className="w-6 h-6 text-[#5B6E02] mr-2" />
            Revenue Overview
          </h3>
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
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 text-[#5B6E02] mr-2" />
            Product Analytics
          </h3>
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
                  <span className="text-sm">Herb Garden Kit</span>
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
                  <span className="text-sm">Dairy Products</span>
                  <span className="text-sm font-semibold text-red-600">22% margin</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">Bulk Grains</span>
                  <span className="text-sm font-semibold text-red-600">28% margin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
            <Package className="w-6 h-6 text-[#5B6E02] mr-2" />
            Pending Orders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total Pending Orders</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">23</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Next Order Cutoff</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">Today 5:00 PM</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Revenue of Pending Orders</div>
              <div className="text-2xl font-bold text-[#2C2C2C]">$1,847.50</div>
            </div>
          </div>
        </div>

        {/* Customer Messages */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 text-[#5B6E02] mr-2" />
            Customer Messages
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#2C2C2C]">Sarah M.</div>
                  <div className="text-sm text-gray-600">"When will my sourdough order be ready?"</div>
                </div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#2C2C2C]">Mike R.</div>
                  <div className="text-sm text-gray-600">"Can you make a custom soap for my wife's birthday?"</div>
                </div>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#2C2C2C]">Lisa K.</div>
                  <div className="text-sm text-gray-600">"Do you deliver to downtown Atlanta?"</div>
                </div>
                <div className="text-xs text-gray-500">2 days ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dropoff Location Relationships */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 mb-8 border-2 border-black hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
            <MapPin className="w-6 h-6 text-[#5B6E02] mr-2" />
            Dropoff Location Relationships
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-semibold text-[#2C2C2C]">Downtown Atlanta Hub</div>
              <div className="text-sm text-gray-600">123 Peachtree St</div>
              <div className="text-xs text-[#5B6E02]">Active Partnership</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-semibold text-[#2C2C2C]">Midtown Market</div>
              <div className="text-sm text-gray-600">456 Piedmont Ave</div>
              <div className="text-xs text-[#5B6E02]">Active Partnership</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="font-semibold text-[#2C2C2C]">Buckhead Collection</div>
              <div className="text-sm text-gray-600">789 Roswell Rd</div>
              <div className="text-xs text-[#5B6E02]">Active Partnership</div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Events I'm Signed Up For */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 border-2 border-black hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
              <Calendar className="w-6 h-6 text-[#5B6E02] mr-2" />
              Events I'm Signed Up For
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Atlanta Food Festival</div>
                <div className="text-sm text-gray-600">March 15, 2024</div>
                <div className="text-xs text-[#5B6E02]">Confirmed Vendor</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Spring Craft Market</div>
                <div className="text-sm text-gray-600">April 22, 2024</div>
                <div className="text-xs text-[#5B6E02]">Confirmed Vendor</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Local Artisan Fair</div>
                <div className="text-sm text-gray-600">May 8, 2024</div>
                <div className="text-xs text-[#5B6E02]">Confirmed Vendor</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events I'm Not Signed Up For */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 border-2 border-black hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center">
              <Calendar className="w-6 h-6 text-[#5B6E02] mr-2" />
              Events I'm Not Signed Up For
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Summer Market Series</div>
                <div className="text-sm text-gray-600">June 12-15, 2024</div>
                <div className="text-xs text-orange-600">Applications Open</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Holiday Craft Show</div>
                <div className="text-sm text-gray-600">December 7-8, 2024</div>
                <div className="text-xs text-orange-600">Applications Open</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-[#2C2C2C]">Farm to Table Expo</div>
                <div className="text-sm text-gray-600">September 20, 2024</div>
                <div className="text-xs text-orange-600">Applications Open</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage; 