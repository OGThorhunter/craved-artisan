
import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TailwindTest } from '../components/TailwindTest';

export const HomePage = () => {
  const { user, login, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Craved Artisan | Home";
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream text-foreground">
      <Header />

      {/* Tailwind Test Component */}
      <div className="pt-16">
        <TailwindTest />
      </div>

      {/* Main content with proper spacing for fixed header */}
      <div className="pt-16"> {/* Add padding-top to account for fixed header */}
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
          {/* Section 1: Hero */}
          <section
            id="hero"
            className="snap-start h-screen relative bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center"
          >
            <div className="text-center text-white p-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Join the Movement</h1>
              <p className="text-lg mb-6">Support 142 vendors across 19 ZIPs</p>
              <div className="flex gap-4 flex-wrap justify-center">
                <button className="bg-brand-green hover:bg-brand-green-hover text-white px-6 py-3 rounded-xl transition">Join Now</button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl border border-white transition">View Marketplace</button>
              </div>
              <div className="mt-10 animate-bounce text-xl">↓</div>
            </div>
          </section>

          {/* Section 2: Local Buzz */}
          <section
            id="buzz"
            className="snap-start h-screen relative bg-gradient-to-br from-brand-cream-dark to-brand-cream-darker flex items-center justify-center"
          >
            <div className="text-center p-6">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8">Local Buzz</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/90 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-brand-green mb-2">142</div>
                  <div className="text-gray-600">Active Vendors</div>
                </div>
                <div className="bg-white/90 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-brand-green mb-2">19</div>
                  <div className="text-gray-600">ZIP Codes</div>
                </div>
                <div className="bg-white/90 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-brand-green mb-2">1.2k</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Welcome Video */}
          <section id="video" className="snap-start h-screen relative bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h2 className="text-3xl md:text-5xl font-bold">Meet the Makers</h2>
              <p className="text-lg mt-4">Our Story • Vendor Voices • Marketplace Tour</p>
              <button className="mt-6 bg-brand-green text-white px-6 py-3 rounded-xl">Watch the Tour</button>
            </div>
          </section>

          {/* Section 4: Join Us Cards */}
          <section id="join" className="snap-start h-screen bg-brand-cream flex items-center justify-center px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Which Role Fits You Best?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                {[
                  { title: "Vendor", tagline: "Share your craft", color: "from-brand-green to-brand-green-light" },
                  { title: "Supplier", tagline: "Fuel the movement", color: "from-brand-cream-dark to-brand-cream-darker" },
                  { title: "Customer", tagline: "Eat better, support local", color: "from-brand-green-light to-brand-green" },
                  { title: "Event Coordinator", tagline: "Organize impact", color: "from-brand-cream-darker to-brand-cream-dark" },
                  { title: "Drop-Off Partner", tagline: "Host the heart of pickup", color: "from-brand-green-hover to-brand-green" },
                ].map((role, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 text-center">
                    <div className={`w-full h-32 bg-gradient-to-br ${role.color} rounded-md mb-3 flex items-center justify-center`}>
                      <span className="text-white font-semibold text-lg">{role.title}</span>
                    </div>
                    <h3 className="font-bold">{role.title}</h3>
                    <p className="text-sm text-[#777]">{role.tagline}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}; 