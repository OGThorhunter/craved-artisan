import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

export function DangerZoneTab() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Danger Zone</h2>
        <p className="text-gray-600">Irreversible and destructive actions for your account.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900">Transfer Ownership</h3>
              <p className="text-red-700">
                Transfer ownership of this account to another user. This action cannot be undone.
              </p>
            </div>
            <Button variant="secondary" className="text-red-600 border-red-300 hover:bg-red-50">
              Transfer Ownership
            </Button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900">Close Account</h3>
              <p className="text-red-700">
                Permanently close this account and delete all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="secondary" className="text-red-600 border-red-300 hover:bg-red-50">
              Close Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
