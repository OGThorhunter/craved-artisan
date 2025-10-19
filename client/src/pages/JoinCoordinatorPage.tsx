'use client';

import { CheckCircle, Calendar, Users, MapPin, Megaphone, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export const JoinCoordinatorPage = () => {
  return (
    <section className="bg-brand-cream text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-[80vh] flex flex-col justify-center items-center text-center px-6"
        style={{ backgroundImage: `url('/images/Event coordinator_1750627631683.png')` }}>
        <div className="absolute inset-0 bg-[#F7F2EC]/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Become an Event Coordinator on Craved Artisan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Organize events and markets that bring the community together around local goods and artisans.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="responsive-heading mb-6">Why Event Coordinators Choose Craved Artisan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Calendar />, label: 'Event Management Tools' },
            { icon: <Users />, label: 'Vendor & Customer Network' },
            { icon: <Megaphone />, label: 'Marketing & Promotion' },
            { icon: <TrendingUp />, label: 'Revenue Sharing' },
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
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Event Planning Experience</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Venue Access or Permits</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Marketing Skills</li>
            <li className="bg-white border border-gray-300 px-3 py-2 rounded shadow">Community Connections</li>
          </ul>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-6 text-center">Get Started in 5 Simple Steps</h2>
        <ul className="space-y-4">
          {[
            'Create your coordinator account',
            'Set up your event profile',
            'Plan your first event',
            'Invite vendors and customers',
            'Host successful events!',
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
        <h2 className="responsive-subheading mb-4">What Event Coordinators Are Saying</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-sm italic">
          <p>"Craved Artisan made it so easy to connect with local vendors and customers for my farmers market."</p>
          <p>"The platform handles all the logistics so I can focus on creating amazing community events."</p>
        </div>
      </div>

      {/* Event Types */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="responsive-subheading mb-4 text-center">Types of Events You Can Host</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Farmers Markets', description: 'Weekly or monthly markets featuring local produce and goods' },
            { title: 'Artisan Fairs', description: 'Showcase local craftspeople and their unique creations' },
            { title: 'Food Festivals', description: 'Celebrate local food culture and culinary talent' },
            { title: 'Holiday Markets', description: 'Seasonal events perfect for gift-giving and community celebration' },
            { title: 'Pop-up Events', description: 'Temporary markets in unique locations around the community' },
            { title: 'Workshop Series', description: 'Educational events where vendors teach their crafts' },
          ].map((event, i) => (
            <motion.div 
              key={event.title}
              className="bg-white rounded-lg shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-brand-charcoal mb-2">{event.title}</h3>
              <p className="responsive-text text-gray-600">{event.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="responsive-subheading mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I get paid for hosting events?</summary>
              <p className="mt-2 responsive-text text-gray-600">You earn a percentage of vendor fees and can set your own event entry fees.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">What support does Craved Artisan provide?</summary>
              <p className="mt-2 responsive-text text-gray-600">Marketing tools, vendor connections, payment processing, and event management software.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">Do I need insurance for events?</summary>
              <p className="mt-2 responsive-text text-gray-600">We provide basic coverage, but you may need additional insurance depending on your event type.</p>
            </details>
            <details className="bg-white p-4 rounded shadow">
              <summary className="cursor-pointer font-medium">How do I find vendors for my events?</summary>
              <p className="mt-2 responsive-text text-gray-600">Our platform connects you with local vendors who are looking for events to participate in.</p>
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
        <span>Ready to bring your community together?</span>
        <div className="flex gap-4">
          <Link
            href="/signup?role=EVENT_COORDINATOR"
            className="bg-white text-brand-green responsive-button rounded shadow hover:bg-gray-100 transition"
          >
            Get Started as Event Coordinator
          </Link>
          <a
            href="mailto:support@cravedartisan.com?subject=Event%20Coordinator%20Questions"
            className="text-white underline"
          >
            Ask Questions
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinCoordinatorPage; 
