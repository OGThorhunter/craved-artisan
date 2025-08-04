import { ReactNode } from 'react';
import VendorSidebar from '@/components/dashboard/vendor/VendorSidebar';
import VendorTopNav from '@/components/dashboard/vendor/VendorTopNav';

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F7F2EC] text-[#333]">
      <VendorSidebar />
      <main className="flex-1 flex flex-col">
        <VendorTopNav />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
} 