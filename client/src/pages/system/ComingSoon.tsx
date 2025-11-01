import React, { useState } from 'react';
import { ChefHat, Users, MapPin, Shield, Star, ArrowRight, Mail, CheckCircle, XCircle } from 'lucide-react';

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <ChefHat className="w-8 h-8 text-amber-600" />,
      title: "Built for Makers, by Makers",
      description: "A marketplace that empowers small artisans, farms, and creators to sell locally and online without big-box barriers."
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      title: "Smart, Seamless Tools",
      description: "AI-assisted dashboards handle orders, inventory, and analytics so you can focus on your craft — not the code."
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: "Community-Driven Commerce",
      description: "Connect with nearby customers, events, and fellow artisans through zip-based discovery and real-world collaborations."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Founders First Promise",
      description: "Transparent pricing, fair fees, and lifetime discounts for early adopters who help shape the movement."
    }
  ];

  const testimonials = [
    {
      text: "The platform I've been waiting for as a small business owner!",
      author: "Sarah, Local Baker"
    },
    {
      text: "Finally, a way to discover truly unique products in my area.",
      author: "Mike, Customer"
    },
    {
      text: "Perfect for showcasing my handmade jewelry collection.",
      author: "Lisa, Artisan"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="relative h-16 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 transform -rotate-1 opacity-95"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          <span className="text-black font-bold text-lg tracking-wider">🚧 COMING SOON 🚧</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Craved Artisan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A marketplace built by makers, for makers. We're putting the finishing touches on something amazing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Get Notified When We Launch
            </h2>
            
            {isSubscribed ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">You're all set!</p>
                <p className="text-gray-600 text-sm mt-2">We'll send you an email when we're ready.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSignup} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Subscribing...' : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <ChefHat className="w-8 h-8 mr-2" />
              <span className="text-xl font-bold">Craved Artisan</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="mailto:hello@cravedartisan.com" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 mr-2" />
                hello@cravedartisan.com
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Craved Artisan. Building something amazing for makers and communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;

