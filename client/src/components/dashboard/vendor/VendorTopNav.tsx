import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { Lightbulb, BarChart3, Receipt, Tag, Briefcase } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard/vendor' },
  { 
    label: 'Analytics', 
    href: '/dashboard/vendor/analytics',
    hasSubmenu: true,
    subItems: [
      { label: 'Insights', href: '/dashboard/vendor/analytics', icon: Lightbulb },
      { label: 'Financials', href: '/dashboard/vendor/analytics?tab=financials', icon: BarChart3 },
      { label: 'Taxes', href: '/dashboard/vendor/analytics?tab=taxes', icon: Receipt },
      { label: 'Pricing Optimizer', href: '/dashboard/vendor/analytics?tab=pricing', icon: Tag },
      { label: 'Portfolio Builder', href: '/dashboard/vendor/analytics?tab=portfolio', icon: Briefcase },
    ]
  },
  { label: 'Products', href: '/dashboard/vendor/products' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Inventory', href: '/dashboard/vendor/inventory' },
  { label: 'CRM', href: '/dashboard/vendor/crm' },
  { label: 'Settings', href: '/dashboard/vendor/site-settings' },
];

export default function VendorTopNav() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;
  const isAnalyticsActive = location.includes('/dashboard/vendor/analytics');

  const isSubItemActive = (href: string) => {
    if (href.includes('?tab=')) {
      const urlParams = new URLSearchParams(location.split('?')[1]);
      const tabParam = urlParams.get('tab');
      console.log('Checking subItem active:', href, 'tabParam:', tabParam, 'location:', location);
      return href.includes(`tab=${tabParam}`);
    }
    return isActive(href);
  };

  const handleTertiaryNavClick = (href: string, label: string) => {
    console.log('=== TERTIARY NAVIGATION DEBUG ===');
    console.log('Clicking tertiary nav item:', label);
    console.log('Target href:', href);
    console.log('Current location before navigation:', location);
    console.log('Navigating to:', href);
    setLocation(href);
  };

  console.log('VendorTopNav - Current location:', location, 'isAnalyticsActive:', isAnalyticsActive);

  return (
    <>
      {/* Secondary Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <div key={item.href} className="flex items-center">
                  {item.hasSubmenu ? (
                    <Link
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isAnalyticsActive
                          ? 'text-[#5B6E02] bg-[#F7F2EC]'
                          : 'text-gray-700 hover:text-[#5B6E02] hover:bg-[#F7F2EC]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'text-[#5B6E02] bg-[#F7F2EC]'
                          : 'text-gray-700 hover:text-[#5B6E02] hover:bg-[#F7F2EC]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Tertiary Navigation - Only show when Analytics is active */}
      {isAnalyticsActive && (
        <div className="bg-[#F7F2EC] border-b border-[#5B6E02] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-3">
              {navItems.find(item => item.hasSubmenu)?.subItems?.map((subItem) => {
                const Icon = subItem.icon;
                const isActive = isSubItemActive(subItem.href);
                return (
                  <button
                    key={subItem.href}
                    onClick={() => handleTertiaryNavClick(subItem.href, subItem.label)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#5B6E02] text-white shadow-md'
                        : 'text-[#5B6E02] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#5B6E02]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {subItem.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 