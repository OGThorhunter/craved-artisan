import React from 'react';
import { DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { AcceptedAgreementsList } from '../../legal/AcceptedAgreementsList';

export function DocumentsTab() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Legal Documents & Agreements</h2>
          <p className="text-gray-600">View your accepted legal agreements and their current status.</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Legal compliance tracking
        </div>
      </div>

      {/* Accepted Agreements Section */}
      <div className="mb-8">
        <div className="border-b border-gray-200 mb-6">
          <h3 className="text-lg font-medium text-gray-900 pb-2">Your Accepted Agreements</h3>
          <p className="text-sm text-gray-600 pb-4">
            These are the legal documents you've accepted during registration or when updates were required.
          </p>
        </div>
        
        <AcceptedAgreementsList />
      </div>

      {/* Future Document Management Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <DocumentIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Business Document Management</h3>
            <p className="text-blue-700">
              Coming soon! You'll be able to upload, organize, and manage your business documents like contracts, certifications, and vendor agreements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
