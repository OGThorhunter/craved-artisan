import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SettingsLayout } from '../components/settings/SettingsLayout';
import { ProfileTab } from '../components/settings/tabs/ProfileTab';
import { OrganizationTab } from '../components/settings/tabs/OrganizationTab';
import { TeamTab } from '../components/settings/tabs/TeamTab';
import { SocialLinksTab } from '../components/settings/tabs/SocialLinksTab';
import { SecurityTab } from '../components/settings/tabs/SecurityTab';
import { NotificationsTab } from '../components/settings/tabs/NotificationsTab';
import { BillingTab } from '../components/settings/tabs/BillingTab';
import { DocumentsTab } from '../components/settings/tabs/DocumentsTab';
import { IntegrationsTab } from '../components/settings/tabs/IntegrationsTab';
import { AuditTab } from '../components/settings/tabs/AuditTab';
import { DangerZoneTab } from '../components/settings/tabs/DangerZoneTab';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorCard } from '../components/ui/ErrorCard';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', component: ProfileTab },
  { id: 'organization', label: 'Organization', component: OrganizationTab },
  { id: 'team', label: 'Team', component: TeamTab },
  { id: 'social-links', label: 'Social & Links', component: SocialLinksTab },
  { id: 'security', label: 'Security', component: SecurityTab },
  { id: 'notifications', label: 'Notifications', component: NotificationsTab },
  { id: 'billing', label: 'Billing & Subscriptions', component: BillingTab },
  { id: 'documents', label: 'Documents & Agreements', component: DocumentsTab },
  { id: 'integrations', label: 'Integrations', component: IntegrationsTab },
  { id: 'audit', label: 'Audit Log', component: AuditTab },
  { id: 'danger-zone', label: 'Danger Zone', component: DangerZoneTab },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch settings overview data
  const { data: overviewData, isLoading, error } = useQuery({
    queryKey: ['settings', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/settings/overview', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch settings overview');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorCard 
          title="Failed to load settings"
          message="There was an error loading your settings. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const currentTab = SETTINGS_TABS.find(tab => tab.id === activeTab);
  const TabComponent = currentTab?.component || ProfileTab;

  return (
    <SettingsLayout
      account={overviewData?.data?.account}
      userProfile={overviewData?.data?.userProfile}
      currentUserRole={overviewData?.data?.currentUserAccountRole}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={SETTINGS_TABS}
    >
      <TabComponent />
    </SettingsLayout>
  );
}
