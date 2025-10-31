'use client';

import { motion } from 'framer-motion';
import { RoleCard } from '../../components/join/RoleCard';

export default function JoinMovement() {
  const roleData = [
    { 
      img: '/images/vendor_1750622113753.png', 
      label: 'Vendor', 
      tagline: 'Produce',
      description: 'Share your handmade goods with a community that values craftsmanship and quality.',
      learnMore: '/signup?role=VENDOR',
      joinHref: '/signup?role=VENDOR'
    },
    { 
      img: '/images/supplier_1750627234352.png', 
      label: 'B2B Vendors', 
      tagline: 'Supply',
      description: 'Supply ingredients and materials to help other vendors create their best products.',
      learnMore: '/signup?role=B2B',
      joinHref: '/signup?role=B2B'
    },
    { 
      img: '/images/winecheese_1750622113753.png', 
      label: 'Customer', 
      tagline: 'Support Local',
      description: 'Discover and support local artisans while enjoying fresh, high-quality products.',
      learnMore: '/signup?role=CUSTOMER',
      joinHref: '/signup?role=CUSTOMER'
    },
    { 
      img: '/images/Event coordinator_1750627631683.png', 
      label: 'Coordinator', 
      tagline: 'Promote',
      description: 'Organize events and markets that bring the community together around local goods.',
      learnMore: '/signup?role=EVENT_COORDINATOR',
      joinHref: '/signup?role=EVENT_COORDINATOR'
    },
    { 
      img: '/images/DoL1_1750621743272.png', 
      label: 'Drop-Off', 
      tagline: 'Logistics',
      description: 'Host pickup locations that serve as community hubs for local commerce.',
      learnMore: '/signup?role=DROPOFF_MANAGER',
      joinHref: '/signup?role=DROPOFF_MANAGER'
    },
  ];

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <section className="relative w-full bg-cover bg-center px-4 sm:px-6 py-16 sm:py-20"
        style={{ 
          backgroundImage: `url('/images/Banner5.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-brand-cream/80" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-charcoal mb-6">
              Join the Movement
            </h1>
            <p className="text-lg md:text-xl text-brand-grey mb-8 max-w-3xl mx-auto">
              This is the network of creators, customers, and community partners who power our local artisan economy. 
              Together, they make business possible for hardworking tradespeople across every ZIP.
            </p>
            <p className="text-base text-brand-grey max-w-2xl mx-auto">
              Choose your role and start building a sustainable, community-driven marketplace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {roleData.map((role) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: roleData.indexOf(role) * 0.1 }}
              >
                <RoleCard
                  image={role.img}
                  label={role.label}
                  tagline={role.tagline}
                  description={role.description}
                  learnMoreHref={role.learnMore}
                  joinHref={role.joinHref}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

