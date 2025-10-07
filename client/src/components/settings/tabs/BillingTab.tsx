import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

export function BillingTab() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h2>
          <p className="text-gray-600">Manage your subscription, billing information, and payment methods.</p>
        </div>
        <Button variant="secondary">
          Manage Billing
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <CreditCardIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Billing Management</h3>
            <p className="text-blue-700">
              This feature is coming soon. You'll be able to view invoices, manage subscriptions, and update payment methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
