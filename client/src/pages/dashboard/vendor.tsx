import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import SalesSnapshot from '@/components/dashboard/vendor/SalesSnapshot';
import BusinessHealth from '@/components/dashboard/vendor/BusinessHealth';
import AIInsightsPanel from '@/components/dashboard/vendor/AIInsightsPanel';
import QuickActionsPanel from '@/components/dashboard/vendor/QuickActionsPanel';
import VendorInbox from '@/components/dashboard/vendor/VendorInbox';
import LeaderboardWidget from '@/components/dashboard/vendor/LeaderboardWidget';
import OptionalWidgets from '@/components/dashboard/vendor/OptionalWidgets';

export default function VendorDashboardPage() {
  return (
    <VendorDashboardLayout>
      <div className="space-y-6 p-6">
        <SalesSnapshot />
        <BusinessHealth />
        <AIInsightsPanel />
        <QuickActionsPanel />
        <VendorInbox />
        <LeaderboardWidget />
        <OptionalWidgets />
      </div>
    </VendorDashboardLayout>
  );
} 