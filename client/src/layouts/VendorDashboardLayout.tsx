import { ReactNode } from 'react';
import NavHeader from '@/components/NavHeader';
import VendorTopNav from '@/components/dashboard/vendor/VendorTopNav';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333]">
      {/* Primary Navigation - Main site header */}
      <NavHeader />
      
      {/* Secondary Navigation - Dashboard-specific navigation */}
      <div className="pt-16"> {/* Add top padding to account for fixed header */}
        <VendorTopNav />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
} 