'use client';

import { CheckCircle, LayoutDashboard, Store, Users, MessageSquareText, Package, Truck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export const JoinB2BPage = () => {
  return (
    <section className="bg-brand-cream text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-[80vh] flex flex-col justify-center items-center text-center px-6"
        style={{ backgroundImage: `url('/images/supplier_1750627234352.png')` }}>
        <div className="absolute inset-0 bg-[#F7F2EC]/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Become a B2B Vendor on Craved Artisan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Supply local artisans with the ingredients and materials they need to create amazing products.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="responsive-heading mb-6">Why B2B Vendors Choose Craved Artisan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Package />, label: 'Bulk Order Management' },
            { icon: <Truck />, label: 'Local Delivery Network' },
            { icon: <TrendingUp />, label: 'Steady Customer Base' },
            { icon: <Users />, label: 'Direct Vendor Relationships' },
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
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Wholesale Business License</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Quality Ingredients/Materials</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Reliable Delivery System</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Stripe Business Account</li>
          </ul>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-6 text-center">Get Started in 5 Simple Steps</h2>
        <ul className="space-y-4">
          {[
            'Create your B2B account',
            'Verify your business credentials',
            'List your products and pricing',
            'Set up delivery zones and schedules',
            'Start receiving orders!',
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
        <h2 className="responsive-subheading mb-4">What B2B Vendors Are Saying</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-sm italic">
          <p>"The local artisan community is my best customer base. They appreciate quality and pay fair prices."</p>
          <p>"Craved Artisan helped me connect with vendors I never would have found otherwise."</p>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-4 text-center">What Your B2B Dashboard Looks Like</h2>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <LayoutDashboard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">B2B Vendor Dashboard Preview</p>
            <p className="responsive-text text-gray-500 mt-2">Complete with order management, inventory tracking, and vendor analytics</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="responsive-subheading mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What types of products can I supply?</summary>
              <p className="mt-2 responsive-text text-gray-600">Ingredients, raw materials, packaging, tools, and supplies that local artisans need for their crafts.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I handle delivery?</summary>
              <p className="mt-2 responsive-text text-gray-600">You can offer local delivery, pickup at your location, or use our drop-off network.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What are the minimum order requirements?</summary>
              <p className="mt-2 responsive-text text-gray-600">You set your own minimums and pricing structure for your products.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I get paid?</summary>
              <p className="mt-2 responsive-text text-gray-600">Secure payments via Stripe with instant payouts once orders are fulfilled.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Role Suggestions */}
      <div className="text-center py-12 px-6">
        <p className="responsive-text text-gray-600 mb-4">Not quite what you're looking for?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/join/vendor" className="underline text-brand-green">Join as a Vendor</Link>
          <Link href="/join" className="underline text-brand-green">View All Roles</Link>
          <Link href="/contact" className="underline text-brand-green">Contact Support</Link>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 w-full bg-brand-green text-white px-6 py-4 flex justify-between items-center z-40 shadow-lg">
        <span>Ready to supply local artisans?</span>
        <div className="flex gap-4">
          <Link
            href="/signup?role=B2B"
            className="bg-white text-brand-green responsive-button rounded shadow hover:bg-gray-100 transition"
          >
            Get Started as B2B Vendor
          </Link>
          <a
            href="mailto:support@cravedartisan.com?subject=B2B%20Vendor%20Questions"
            className="text-white underline"
          >
            Ask Questions
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinB2BPage; 
