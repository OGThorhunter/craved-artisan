import { Link, useLocation } from 'wouter';

const navItems = [
  { label: 'Overview', href: '/dashboard/vendor' },
  { label: 'Analytics', href: '/dashboard/vendor/analytics' },
  { label: 'Products', href: '/dashboard/vendor/enhanced-products' },
  { label: 'Inventory', href: '/dashboard/vendor/inventory' },
  { label: 'Orders', href: '/dashboard/vendor/orders' },
  { label: 'CRM', href: '/dashboard/vendor/crm' },
  { label: 'Customer Service', href: '/dashboard/vendor/support' },
  { label: 'Site Management', href: '/dashboard/vendor/site' },
  { label: 'Settings', href: '/dashboard/vendor/site-settings' },
];

export default function VendorSidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-64 bg-[#E8CBAE] h-screen p-4 sticky top-0 flex flex-col gap-2 shadow-md">
      <h2 className="text-xl font-bold mb-4">📊 Vendor Panel</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[#333] hover:text-[#7F232E] transition font-medium ${
              isActive(item.href) ? 'text-[#5B6E02] font-semibold' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 