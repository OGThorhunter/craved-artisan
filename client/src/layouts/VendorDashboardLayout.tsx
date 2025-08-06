import { ReactNode } from 'react';
import VendorTopNav from '@/components/dashboard/vendor/VendorTopNav';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333]">
      <VendorTopNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 