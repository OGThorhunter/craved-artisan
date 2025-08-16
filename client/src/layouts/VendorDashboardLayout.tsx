import { ReactNode } from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import InspirationalQuote from '@/components/dashboard/InspirationalQuote';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2EC] text-[#333]">
      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <InspirationalQuote />
          {children}
        </div>
      </main>
    </div>
  );
} 