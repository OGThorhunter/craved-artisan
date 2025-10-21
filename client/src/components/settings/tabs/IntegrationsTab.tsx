import React from 'react';
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';

export function IntegrationsTab() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        <p className="text-gray-600">Connect with third-party services and manage your integrations.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <PuzzlePieceIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Third-party Integrations</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to connect with Stripe, social media platforms, and other services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




























