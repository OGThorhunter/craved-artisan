import React from 'react';
import { Link } from 'wouter';
import {
  CreditCard,
  AlertCircle,
  ExternalLink,
  Shield,
  DollarSign,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const OnboardingPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Stripe Setup
            </h1>
            <p className="text-lg text-gray-600">
              Connect your Stripe account to start receiving payments and payouts
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Automated Payments</h3>
              </div>
              <p className="text-green-700 text-sm">
                Receive payments directly to your bank account with automatic 2% platform fee
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Secure & Compliant</h3>
              </div>
              <p className="text-blue-700 text-sm">
                PCI compliant payment processing with fraud protection and dispute handling
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center mb-3">
                <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-800">Transparent Fees</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Clear 2% commission structure with detailed payout history and analytics
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center mb-3">
                <ExternalLink className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-800">Easy Integration</h3>
              </div>
              <p className="text-orange-700 text-sm">
                Quick setup process with guided onboarding and 24/7 support
              </p>
            </div>
          </div>

          {/* Commission Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Commission Structure</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">2%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Vendor Payout</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Payout Time</div>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Setup Process</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Stripe Connect Account</p>
                  <p className="text-sm text-gray-600">Set up your business profile and banking information</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verify Your Identity</p>
                  <p className="text-sm text-gray-600">Complete identity verification and business verification</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Start Receiving Payments</p>
                  <p className="text-sm text-gray-600">Begin accepting orders and receiving automatic payouts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/vendor/onboarding">
              <button className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Start Stripe Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </Link>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              You must complete Stripe onboarding to receive payments from customers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPrompt; 