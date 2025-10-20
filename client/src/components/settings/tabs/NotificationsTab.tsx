import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export function NotificationsTab() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-gray-600">Configure your notification preferences and communication settings.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <BellIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Notification Settings</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to configure email, SMS, and in-app notification preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


























