import { Link, useLocation } from 'wouter';
import { 
  BarChart3,
  Package,
  ShoppingCart,
  Database,
  Home,
  ClipboardList,
  Percent
} from 'lucide-react';

const navItems = [
  { label: 'Pulse', href: '/dashboard/vendor/pulse', icon: Home },
  { label: 'Analytics & CRM', href: '/dashboard/vendor/analytics-crm', icon: BarChart3 },
  { label: 'Inventory', href: '/dashboard/vendor/inventory', icon: Database },
  { label: 'Products', href: '/dashboard/vendor/products', icon: Package },
  { label: 'Sales Windows', href: '/dashboard/vendor/sales-windows', icon: ShoppingCart },
  { label: 'Orders', href: '/dashboard/vendor/orders', icon: ClipboardList },
  { label: 'Promotions', href: '/dashboard/vendor/promotions', icon: Percent },
];

export default function DashboardNav() {
  const [location] = useLocation();

  // Only show navigation for vendor-specific routes
  const isVendorRoute = location.startsWith('/dashboard/vendor/');

  if (!isVendorRoute) {
    return null;
  }

  // Compute active state by comparing current location to each item href
  const isActive = (path: string) => {
    if (path === '/dashboard/vendor/analytics-crm') {
      return location.startsWith('/dashboard/vendor/analytics-crm');
    }
    return location === path;
  };

  return (
    <>
      {/* Secondary Navigation - Only for vendor routes */}
      <header className="bg-[#F0F8FF] border-b-2 border-[#5B6E02] shadow-md relative z-40 min-h-[64px]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-4 lg:space-x-6 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isItemActive ? "page" : undefined}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isItemActive
                        ? 'text-[#5B6E02] bg-[#F7F2EC] border-2 border-[#5B6E02] shadow-md'
                        : 'text-[#2C2C2C] hover:text-[#5B6E02] hover:bg-[#F7F2EC] hover:border-2 hover:border-[#5B6E02] hover:shadow-md'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
