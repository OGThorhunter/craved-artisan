import { Link, useLocation } from 'wouter';
import { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Receipt, 
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronDown
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard/vendor', icon: Home },
  { 
    label: 'Analytics & CRM', 
    href: '/dashboard/vendor/analytics-crm',
    icon: BarChart3,
    hasSubmenu: true,
    subItems: [
      { label: 'Business Snapshot', href: '/dashboard/vendor/analytics-crm?tab=business-snapshot', icon: BarChart3 },
      { label: 'Taxes', href: '/dashboard/vendor/analytics-crm?tab=taxes', icon: Receipt },
      { label: 'Customer 360', href: '/dashboard/vendor/analytics-crm?tab=customer-360', icon: Users },
      { label: 'Pipeline', href: '/dashboard/vendor/analytics-crm?tab=pipeline', icon: BarChart3 },
      { label: 'Tasks', href: '/dashboard/vendor/analytics-crm?tab=tasks', icon: Receipt },
      { label: 'Customer Health', href: '/dashboard/vendor/analytics-crm?tab=customer-health', icon: BarChart3 },
    ]
  },
  { label: 'Products', href: '/dashboard/vendor/products', icon: Package },
  { label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { label: 'Settings', href: '/dashboard/vendor/site-settings', icon: Settings },
];

export default function VendorTopNav() {
  const [location] = useLocation();
  const [isAnalyticsCrmOpen, setIsAnalyticsCrmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location === path;
  const isAnalyticsActive = location.includes('/dashboard/vendor/analytics-crm');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAnalyticsCrmOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  console.log('VendorTopNav - Current location:', location);

  return (
    <>
      {/* Secondary Navigation */}
      <header className="bg-[#F0F8FF] border-b-2 border-[#5B6E02] shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-4 lg:space-x-6 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.href} className="flex items-center relative">
                    {item.hasSubmenu ? (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setIsAnalyticsCrmOpen(!isAnalyticsCrmOpen)}
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isAnalyticsActive
                              ? 'text-[#5B6E02] bg-[#F7F2EC]'
                              : 'text-[#2C2C2C] hover:text-[#5B6E02] hover:bg-[#F7F2EC]'
                          }`}
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isAnalyticsCrmOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Analytics & CRM Dropdown */}
                        {isAnalyticsCrmOpen && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000]">
                            <div className="py-2">
                              {item.subItems?.map((subItem) => {
                                const SubIcon = subItem.icon;
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setIsAnalyticsCrmOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5B6E02] transition-colors"
                                  >
                                    <SubIcon className="w-4 h-4" />
                                    {subItem.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'text-[#5B6E02] bg-[#F7F2EC]'
                            : 'text-[#2C2C2C] hover:text-[#5B6E02] hover:bg-[#F7F2EC]'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </header>


    </>
  );
} 