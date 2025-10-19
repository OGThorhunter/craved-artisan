'use client';

import { CheckCircle, LayoutDashboard, Store, Users, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export const JoinVendorPage = () => {
  return (
    <section className="bg-brand-cream text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-[80vh] flex flex-col justify-center items-center text-center px-6"
        style={{ backgroundImage: `url('/images/vendor_1750622113753.png')` }}>
        <div className="absolute inset-0 bg-[#F7F2EC]/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Become a Vendor on Craved Artisan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Sell directly to your community with tools built for local makers.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="responsive-heading mb-6">Why Vendors Love Craved Artisan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Store />, label: 'Custom Storefront' },
            { icon: <LayoutDashboard />, label: 'Smart Inventory Tools' },
            { icon: <MessageSquareText />, label: 'Direct Customer Messaging' },
            { icon: <Users />, label: 'Affiliate Product Access (B2B)' },
          ].map(({ icon, label }) => (
            <motion.div 
              key={label} 
              className="flex flex-col items-center text-center p-4 bg-white rounded shadow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-brand-green mb-2">{icon}</div>
              <p className="font-semibold">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="responsive-subheading mb-4">What You'll Need</h2>
          <ul className="flex flex-wrap gap-4 justify-center text-sm">
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Food/Artisan Business</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Locally Made Products</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Pickup/Delivery Plan</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Stripe Account (or ready to create)</li>
          </ul>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-6 text-center">Get Started in 5 Simple Steps</h2>
        <ul className="space-y-4">
          {[
            'Create an account',
            'Complete your profile',
            'Upload your first product',
            'Connect your Stripe account',
            'Go live!',
          ].map((step, i) => (
            <motion.li 
              key={i} 
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CheckCircle className="text-brand-green mt-1" />
              <span className="text-gray-700">{step}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Social Proof */}
      <div className="bg-brand-cream py-12 px-6 text-center">
        <h2 className="responsive-subheading mb-4">What Vendors Are Saying</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-sm italic">
          <p>"It's the first platform that actually feels like it was made for local sellers like me."</p>
          <p>"Setting up was shockingly easy. I had my first order the same week."</p>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-4 text-center">What Your Dashboard Looks Like</h2>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <LayoutDashboard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Vendor Dashboard Preview</p>
            <p className="responsive-text text-gray-500 mt-2">Complete with inventory management, order tracking, and customer insights</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="responsive-subheading mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">Do I need a license or permit to sell?</summary>
              <p className="mt-2 responsive-text text-gray-600">Vendors must follow local cottage food laws or submit licenses if required for their products.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I get paid?</summary>
              <p className="mt-2 responsive-text text-gray-600">Instant payouts via Stripe once your account is connected.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What are the fees?</summary>
              <p className="mt-2 responsive-text text-gray-600">Lower fees than traditional marketplaces - you keep more of your earnings.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I handle shipping and delivery?</summary>
              <p className="mt-2 responsive-text text-gray-600">You can offer local pickup, delivery, or use our network of drop-off locations.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Role Suggestions */}
      <div className="text-center py-12 px-6">
        <p className="responsive-text text-gray-600 mb-4">Not quite what you're looking for?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/join/customer" className="underline text-brand-green">Join as a Customer</Link>
          <Link href="/join" className="underline text-brand-green">View All Roles</Link>
          <Link href="/contact" className="underline text-brand-green">Contact Support</Link>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 w-full bg-brand-green text-white px-6 py-4 flex justify-between items-center z-40 shadow-lg">
        <span>Ready to start selling?</span>
        <div className="flex gap-4">
          <Link
            href="/signup?role=VENDOR"
            className="bg-white text-brand-green responsive-button rounded shadow hover:bg-gray-100 transition"
          >
            Get Started as a Vendor
          </Link>
          <a
            href="mailto:support@cravedartisan.com?subject=Vendor%20Questions"
            className="text-white underline"
          >
            Ask Questions
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinVendorPage; 
