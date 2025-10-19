import React, { useState } from 'react';
import { ChefHat, Users, MapPin, Shield, Star, ArrowRight, Mail, CheckCircle, XCircle } from 'lucide-react';

const ComingSoonPage: React.FC = () => {
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
      {/* Construction Tape - Top */}
      <div className="relative h-16 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 transform -rotate-1 opacity-95"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 20px, #fbbf24 20px, #fbbf24 40px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-blue-100/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/images/logonobg.png" 
                alt="Craved Artisan Logo" 
                className="h-24 w-auto drop-shadow-lg"
              />
            </div>

            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-black text-yellow-500 transform -rotate-1 drop-shadow-lg mb-4"
                style={{ 
                  textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                  WebkitTextStroke: '2px black'
                }}
              >
                COMING SOON!
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Built for Makers, by Makers
              </h2>
            </div>

            <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
              A marketplace that empowers small artisans, farms, and creators to sell locally and online without big-box barriers.
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-blue-100 text-amber-800 px-6 py-3 rounded-full text-lg font-semibold mb-12 shadow-md border-2 border-amber-300">
              <Star className="w-5 h-5 mr-2" />
              Get Early Access - Limited Spots Available
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Be the First to Know</h3>
            <p className="text-gray-600">Join our community and get notified when we launch!</p>
          </div>

          {!isSubscribed ? (
            <form onSubmit={handleNewsletterSignup} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    'Subscribing...'
                  ) : (
                    <>
                      Notify Me
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}
            </form>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center text-green-600 mb-4">
                <CheckCircle className="w-8 h-8 mr-2" />
                <span className="text-xl font-semibold">You're all set!</span>
              </div>
              <p className="text-gray-600">
                Thanks for subscribing! We'll notify you as soon as we launch.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Craved Artisan?
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building more than a marketplace — we're creating a movement that celebrates craftsmanship, community, and fair commerce.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-amber-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Early Feedback
            </h3>
            <p className="text-xl text-gray-600">
              Here's what beta testers are saying about Craved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-gray-600 font-semibold">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Construction Tape - Bottom */}
      <div className="relative h-16 overflow-hidden mb-0">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 transform rotate-1 opacity-95"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, #000 0px, #000 20px, #fbbf24 20px, #fbbf24 40px)',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.3)'
          }}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/images/logonobg.png" 
                alt="Craved Artisan Logo" 
                className="h-12 w-auto mr-3"
              />
              <span className="text-2xl font-bold">Craved Artisan</span>
            </div>
            
            <div className="flex items-center space-x-6">
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

export default ComingSoonPage;

