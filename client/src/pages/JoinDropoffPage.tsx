'use client';

import { CheckCircle, MapPin, Package, Clock, Users, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export const JoinDropoffPage = () => {
  return (
    <section className="bg-brand-cream text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-[80vh] flex flex-col justify-center items-center text-center px-6"
        style={{ backgroundImage: `url('/images/DoL1_1750621743272.png')` }}>
        <div className="absolute inset-0 bg-[#F7F2EC]/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Become a Drop-Off Location on Craved Artisan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Host pickup locations that serve as community hubs for local commerce and convenience.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold mb-6">Why Drop-Off Locations Choose Craved Artisan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <MapPin />, label: 'Community Hub' },
            { icon: <Package />, label: 'Easy Package Management' },
            { icon: <Clock />, label: 'Flexible Hours' },
            { icon: <TrendingUp />, label: 'Additional Revenue' },
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
          <h2 className="text-xl font-semibold mb-4">What You'll Need</h2>
          <ul className="flex flex-wrap gap-4 justify-center text-sm">
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Accessible Location</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Secure Storage Space</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Regular Business Hours</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Customer Service Skills</li>
          </ul>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-xl font-semibold mb-6 text-center">Get Started in 5 Simple Steps</h2>
        <ul className="space-y-4">
          {[
            'Create your drop-off location account',
            'Set up your location profile and hours',
            'Install our package management system',
            'Start receiving packages for pickup',
            'Earn revenue from each transaction!',
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
        <h2 className="text-xl font-semibold mb-4">What Drop-Off Locations Are Saying</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-sm italic">
          <p>"It's a great way to bring more foot traffic to our store and help the local community."</p>
          <p>"The system is so easy to use and the extra income really helps our business."</p>
        </div>
      </div>

      {/* Location Types */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Perfect Locations for Drop-Off Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Coffee Shops', description: 'High foot traffic, comfortable waiting areas' },
            { title: 'Convenience Stores', description: 'Extended hours, central locations' },
            { title: 'Community Centers', description: 'Trusted community spaces' },
            { title: 'Local Businesses', description: 'Existing customer relationships' },
            { title: 'Libraries', description: 'Public access, secure environments' },
            { title: 'Churches & Temples', description: 'Community trust and accessibility' },
          ].map((location, i) => (
            <motion.div 
              key={location.title}
              className="bg-white rounded-lg shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-brand-charcoal mb-2">{location.title}</h3>
              <p className="text-sm text-gray-600">{location.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">How the Drop-Off System Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="font-semibold mb-2">1. Receive Packages</h3>
              <p className="text-sm text-gray-600">Vendors deliver packages to your location during your business hours</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="font-semibold mb-2">2. Customer Pickup</h3>
              <p className="text-sm text-gray-600">Customers pick up their orders using our secure verification system</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Revenue</h3>
              <p className="text-sm text-gray-600">You earn a fee for each successful pickup at your location</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How much space do I need?</summary>
              <p className="mt-2 text-sm text-gray-600">A small secure area for package storage is sufficient. We provide storage solutions.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I get paid?</summary>
              <p className="mt-2 text-sm text-gray-600">You earn a fee for each package picked up at your location, paid monthly via Stripe.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What if packages aren't picked up?</summary>
              <p className="mt-2 text-sm text-gray-600">We have a 48-hour pickup policy. After that, packages are returned to vendors.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">Do I need special insurance?</summary>
              <p className="mt-2 text-sm text-gray-600">We provide basic coverage for packages in your care during pickup hours.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Role Suggestions */}
      <div className="text-center py-12 px-6">
        <p className="text-sm text-gray-600 mb-4">Not quite what you're looking for?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/join/vendor" className="underline text-brand-green">Join as a Vendor</Link>
          <Link href="/join" className="underline text-brand-green">View All Roles</Link>
          <Link href="/contact" className="underline text-brand-green">Contact Support</Link>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 w-full bg-brand-green text-white px-6 py-4 flex justify-between items-center z-40 shadow-lg">
        <span>Ready to become a community hub?</span>
        <div className="flex gap-4">
          <Link
            href="/join"
            className="bg-white text-brand-green px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <a
            href="mailto:support@cravedartisan.com?subject=Drop-Off%20Location%20Questions"
            className="text-white underline"
          >
            Ask Questions
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinDropoffPage; 