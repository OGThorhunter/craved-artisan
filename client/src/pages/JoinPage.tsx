'use client';

import { useState } from 'react';
import { Link } from 'wouter';
import { Chrome, Facebook, Apple } from 'lucide-react';
import toast from 'react-hot-toast';

export const JoinPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialJoin = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);

    try {
      // TODO: Implement social join logic
      toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup coming soon!`);
      console.log(`Joining with ${provider}`);
    } catch (error) {
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup failed`);
      console.error(`${provider} signup failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Join as an Artisan
          </h1>
          <p className="text-xl text-gray-600">
            Share your craft with the world and connect with customers who value handmade quality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div className="bg-brand-cream rounded-2xl p-8 shadow-2xl">
            <h2 className="responsive-heading text-gray-900 mb-6">
              Why Join Craved Artisan?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-2">Keep More of Your Earnings</h3>
                  <p className="text-gray-600">Lower fees than traditional marketplaces, so you keep more of what you earn.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-2">Connect with Your Community</h3>
                  <p className="text-gray-600">Build relationships with customers who appreciate the story behind your work.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-2">Easy Setup & Management</h3>
                  <p className="text-gray-600">Simple tools to showcase your work, manage orders, and grow your business.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-2">AI-Powered Automation</h3>
                  <p className="text-gray-600">Smart AI assistance handles repetitive tasks, inventory management, and customer inquiries so you can focus on your craft.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-2">Customer Relationship Management</h3>
                  <p className="text-gray-600">Built-in CRM tools help you track customer preferences, manage repeat business, and build lasting relationships that drive growth.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="bg-brand-cream/30 rounded-2xl p-8 shadow-2xl">
            <h2 className="responsive-heading text-gray-900 mb-6">Get Started Today</h2>
            
            {/* Social Join Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocialJoin('google')}
                disabled={isLoading}
                className="w-full flex justify-center items-center responsive-button border border-gray-300 rounded-md shadow-sm bg-white responsive-text font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome className="h-5 w-5 mr-2 text-red-600" />
                Continue with Google
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialJoin('facebook')}
                disabled={isLoading}
                className="w-full flex justify-center items-center responsive-button border border-gray-300 rounded-md shadow-sm bg-white responsive-text font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                Continue with Facebook
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialJoin('apple')}
                disabled={isLoading}
                className="w-full flex justify-center items-center responsive-button border border-gray-300 rounded-md shadow-sm bg-white responsive-text font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Apple className="h-5 w-5 mr-2 text-gray-900" />
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-brand-cream/30 text-gray-500">Or continue with email</span>
              </div>
            </div>
            
            <form className="space-y-6">
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Select your category"
                >
                  <option>Select your category</option>
                  <option>Customer</option>
                  <option>Vendor</option>
                  <option>B2B Vendor</option>
                  <option>Event Coordinator</option>
                  <option>Drop-Off Location</option>
                </select>
                <div className="mt-2 text-center">
                  <a 
                    href="mailto:support@cravedartisan.com?subject=Category%20Question%20-%20Join%20Craved%20Artisan"
                    className="inline-flex items-center text-sm text-brand-green hover:text-brand-green/80 font-medium"
                  >
                    <span>Unsure? Contact us</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Tell us about your craft
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your craft, experience, and what makes your work unique..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-lg py-4"
              >
                Apply to Join
              </button>
            </form>

            <div className="mt-6 text-center responsive-text text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
