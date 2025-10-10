import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export function AuditTab() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-gray-600">View activity logs and track changes across your account.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Activity Log</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to view detailed activity logs and track all changes made to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

















