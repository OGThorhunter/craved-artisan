import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs = () => {
  const [location] = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard/vendor' }
    ];

    if (pathSegments.includes('vendor')) {
      if (pathSegments.includes('analytics')) {
        breadcrumbs.push({ label: 'Analytics' });
        
        // Check for tab parameter
        const urlParams = new URLSearchParams(location.split('?')[1]);
        const tab = urlParams.get('tab');
        if (tab) {
          const tabLabels: Record<string, string> = {
            'financials': 'Financials',
            'taxes': 'Taxes',
            'pricing': 'Pricing Optimizer',
            'portfolio': 'Portfolio Builder'
          };
          breadcrumbs.push({ label: tabLabels[tab] || 'Insights' });
        }
      } else if (pathSegments.includes('products')) {
        breadcrumbs.push({ label: 'Products' });
      } else if (pathSegments.includes('inventory')) {
        breadcrumbs.push({ label: 'Inventory' });
      } else if (pathSegments.includes('crm')) {
        breadcrumbs.push({ label: 'CRM' });
      } else if (pathSegments.includes('site-settings')) {
        breadcrumbs.push({ label: 'Settings' });
      }
    } else if (pathSegments.includes('orders')) {
      breadcrumbs.push({ label: 'Orders' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          {breadcrumb.href ? (
            <Link
              href={breadcrumb.href}
              className="hover:text-[#5B6E02] transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="text-[#5B6E02] font-medium flex items-center gap-1">
              {index === 0 && <Home className="w-4 h-4" />}
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

