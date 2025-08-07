import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import VendorTopNav from '@/components/dashboard/vendor/VendorTopNav';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333]">
      {/* Primary Navigation - Main site header */}
      <Header />
      
      {/* Secondary Navigation - Dashboard-specific navigation */}
      <div className="pt-16"> {/* Add top padding to account for fixed header */}
        <VendorTopNav />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
} 