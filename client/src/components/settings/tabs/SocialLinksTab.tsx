import React from 'react';
import { LinkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

export function SocialLinksTab() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social & Links</h2>
          <p className="text-gray-600">Manage your social media profiles and external links.</p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <LinkIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Social Links</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to manage your website, social media profiles, and other external links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
