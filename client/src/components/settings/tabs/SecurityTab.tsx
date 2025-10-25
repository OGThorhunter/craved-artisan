import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export function SecurityTab() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Security</h2>
        <p className="text-gray-600">Manage your account security and session settings.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Security Settings</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to manage sessions, enable 2FA, and configure security settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}































