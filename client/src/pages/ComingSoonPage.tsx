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
      title: "Artisan Marketplace",
      description: "Discover unique, handcrafted goods from local creators and artisans in your area."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Community-Driven",
      description: "Connect directly with makers, learn their stories, and support small businesses."
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: "Local Focus",
      description: "Find amazing products and experiences right in your neighborhood."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Quality Assured",
      description: "Every artisan is carefully vetted to ensure you get exceptional quality."
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-blue-100/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-2xl shadow-lg">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
              <h1 className="ml-4 text-5xl font-bold bg-gradient-to-r from-amber-700 to-amber-800 bg-clip-text text-transparent">
                Craved
              </h1>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Where Artisans
              <span className="block bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
                Meet Community
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The marketplace for authentic, handcrafted goods and local experiences. 
              Supporting creators, connecting communities.
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-blue-100 text-amber-800 px-6 py-3 rounded-full text-lg font-semibold mb-12 shadow-md">
              <Star className="w-5 h-5 mr-2" />
              Coming Soon - Get Early Access
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
            What Makes Craved Special
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building more than a marketplace - we're creating a community that celebrates craftsmanship and creativity.
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-3 rounded-xl mr-3">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold">Craved</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="mailto:hello@craved.com" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 mr-2" />
                hello@craved.com
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Craved. Building something amazing for creators and communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonPage;

