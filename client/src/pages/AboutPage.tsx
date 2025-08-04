'use client';

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Users, Heart, Award, MapPin, Star, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Local Vendors', value: '150+', icon: Users },
  { label: 'Happy Customers', value: '2,500+', icon: Heart },
  { label: 'Products Sold', value: '15,000+', icon: Award },
  { label: 'Communities Served', value: '25+', icon: MapPin }
];

const values = [
  {
    title: 'Local First',
    description: 'We believe in supporting local economies and keeping money in our communities.',
    icon: '🏘️'
  },
  {
    title: 'Quality Craftsmanship',
    description: 'Every product on our platform meets our high standards for quality and authenticity.',
    icon: '✨'
  },
  {
    title: 'Sustainable Practices',
    description: 'We promote environmentally conscious practices and reduce food waste.',
    icon: '🌱'
  },
  {
    title: 'Community Connection',
    description: 'We build bridges between makers and consumers, fostering meaningful relationships.',
    icon: '🤝'
  }
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    bio: 'Former farmer\'s market coordinator with a passion for connecting local artisans with their communities.',
    image: '/images/team-sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Technology',
    bio: 'Tech enthusiast focused on building platforms that serve real people and real communities.',
    image: '/images/team-michael.jpg'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Community Director',
    bio: 'Local food advocate with experience in community organizing and sustainable agriculture.',
    image: '/images/team-emma.jpg'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <div className="bg-brand-maroon text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6">About Craved Artisan</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              We're building a new food economy that connects local artisans with their communities, 
              one handmade product at a time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-brand-maroon" />
                </div>
                <div className="text-3xl font-bold text-brand-charcoal mb-2">{stat.value}</div>
                <div className="text-brand-grey">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-brand-charcoal mb-6">Our Story</h2>
              <div className="space-y-4 text-brand-grey">
                <p>
                  Craved Artisan was born from a simple observation: local artisans were creating 
                  incredible products, but they struggled to reach customers beyond their immediate area.
                </p>
                <p>
                  What started as a small farmers market in Georgia has grown into a platform that 
                  connects hundreds of local makers with thousands of customers who value quality, 
                  authenticity, and community.
                </p>
                <p>
                  Today, we're proud to support a network of creators, customers, and community 
                  partners who power our local artisan economy across every ZIP code.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-brand-beige rounded-lg p-8"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-2xl font-semibold text-brand-charcoal mb-4">Started in 2020</h3>
                <p className="text-brand-grey">
                  From a single market to a statewide network of local commerce
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-brand-charcoal mb-6">Our Values</h2>
            <p className="text-xl text-brand-grey max-w-3xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg bg-brand-cream"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-brand-charcoal mb-3">{value.title}</h3>
                <p className="text-brand-grey">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-brand-charcoal mb-6">Meet Our Team</h2>
            <p className="text-xl text-brand-grey max-w-3xl mx-auto">
              The passionate people behind Craved Artisan who are building the future of local commerce.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-brand-beige rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-charcoal mb-2">{member.name}</h3>
                <p className="text-brand-maroon font-medium mb-4">{member.role}</p>
                <p className="text-brand-grey">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-brand-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Whether you're a customer looking for quality local goods or an artisan ready to grow your business, 
              we'd love to have you as part of our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/join"
                className="bg-white text-brand-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Vendor
              </Link>
              <Link
                href="/marketplace"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-green transition-colors"
              >
                Shop Local
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 