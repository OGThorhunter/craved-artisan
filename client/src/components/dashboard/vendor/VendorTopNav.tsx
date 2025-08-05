import { Link, useLocation } from 'wouter';

const navItems = [
  { label: 'Overview', href: '/dashboard/vendor' },
  { label: 'Analytics', href: '/dashboard/vendor/analytics' },
  { label: 'Products', href: '/dashboard/vendor/products' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Inventory', href: '/dashboard/vendor/inventory' },
  { label: 'Financials', href: '/vendor/financial' },
  { label: 'Settings', href: '/dashboard/vendor/site-settings' },
];

export default function VendorTopNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#333]">Vendor Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-[#777]">Craved Artisan</span>
            <img src="/logo-icon.png" alt="Craved Logo" className="h-6 w-6 rounded-full" />
          </div>
        </div>
        
        {/* Horizontal Navigation */}
        <nav className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive(item.href) 
                  ? 'bg-[#5B6E02] text-white' 
                  : 'text-[#333] hover:bg-[#E8CBAE] hover:text-[#7F232E]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
} 