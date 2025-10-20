import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionSetup } from '../../components/vendor/SubscriptionSetup';

const SubscriptionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/vendor/dashboard">
            <a className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your vendor subscription and billing details
          </p>
        </div>

        {/* Subscription Details */}
        <SubscriptionSetup />
      </div>
    </div>
  );
};

export default SubscriptionPage;

