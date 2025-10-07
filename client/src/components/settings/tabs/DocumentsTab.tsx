import React from 'react';
import { DocumentIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

export function DocumentsTab() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents & Agreements</h2>
          <p className="text-gray-600">Manage your contracts, agreements, and important documents.</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <DocumentIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Document Management</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to upload, organize, and manage your important business documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
