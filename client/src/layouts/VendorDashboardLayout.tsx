import { ReactNode } from 'react';
import NavHeader from '@/components/NavHeader';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333]">
      {/* Primary Navigation - Main site header */}
      <NavHeader />
      
      {/* Secondary Navigation - Dashboard-specific navigation */}
      <div className="pt-20"> {/* Increased padding to account for fixed header */}
        <DashboardNav />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
} 