'use client';

import { CheckCircle, Heart, Star, MapPin, ShoppingBag, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export const JoinCustomerPage = () => {
  return (
    <section className="bg-brand-cream text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-[80vh] flex flex-col justify-center items-center text-center px-6"
        style={{ backgroundImage: `url('/images/winecheese_1750622113753.png')` }}>
        <div className="absolute inset-0 bg-[#F7F2EC]/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Join as a Customer on Craved Artisan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover and support local artisans while enjoying fresh, high-quality products from your community.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold mb-6">Why Customers Love Craved Artisan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Heart />, label: 'Support Local Makers' },
            { icon: <Star />, label: 'Quality Artisan Products' },
            { icon: <MapPin />, label: 'Local Pickup & Delivery' },
            { icon: <Shield />, label: 'Secure Transactions' },
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

      {/* What You Can Find */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">What You Can Discover</h2>
          <ul className="flex flex-wrap gap-4 justify-center text-sm">
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Fresh Baked Goods</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Handmade Crafts</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Local Produce</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Artisan Foods</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Unique Gifts</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Home Decor</li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-xl font-semibold mb-6 text-center">How Shopping Works</h2>
        <ul className="space-y-4">
          {[
            'Browse local vendors and their products',
            'Place orders with secure payment',
            'Choose pickup or delivery options',
            'Enjoy fresh, local products',
            'Support your community!',
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
        <h2 className="text-xl font-semibold mb-4">What Customers Are Saying</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-sm italic">
          <p>"I love knowing exactly who made my food and supporting local bakers and farmers."</p>
          <p>"The quality is amazing and I feel good about where my money is going."</p>
        </div>
      </div>

      {/* Marketplace Preview */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-xl font-semibold mb-4 text-center">What the Marketplace Looks Like</h2>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Local Marketplace Preview</p>
            <p className="text-sm text-gray-500 mt-2">Browse products from local vendors, read reviews, and place orders</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I know the products are safe?</summary>
              <p className="mt-2 text-sm text-gray-600">All vendors must follow local food safety laws and we verify their credentials.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What are the delivery options?</summary>
              <p className="mt-2 text-sm text-gray-600">Local pickup, vendor delivery, or use our network of drop-off locations.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">Can I return products?</summary>
              <p className="mt-2 text-sm text-gray-600">Return policies vary by vendor, but most offer satisfaction guarantees.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I pay for orders?</summary>
              <p className="mt-2 text-sm text-gray-600">Secure payments via credit card, with funds held until you receive your order.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Role Suggestions */}
      <div className="text-center py-12 px-6">
        <p className="text-sm text-gray-600 mb-4">Interested in selling instead?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/join/vendor" className="underline text-brand-green">Join as a Vendor</Link>
          <Link href="/join" className="underline text-brand-green">View All Roles</Link>
          <Link href="/contact" className="underline text-brand-green">Contact Support</Link>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 w-full bg-brand-green text-white px-6 py-4 flex justify-between items-center z-40 shadow-lg">
        <span>Ready to discover local artisans?</span>
        <div className="flex gap-4">
          <Link
            href="/join"
            className="bg-white text-brand-green px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <a
            href="mailto:support@cravedartisan.com?subject=Customer%20Questions"
            className="text-white underline"
          >
            Ask Questions
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinCustomerPage; 