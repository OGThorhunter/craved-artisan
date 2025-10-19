import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface BetaTesterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  businessName: string;
}

export const BetaTesterOverlay: React.FC<BetaTesterOverlayProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    location: '',
    businessType: '',
    businessName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.businessType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send beta tester signup to support email
      await axios.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        subject: 'Beta Tester Application - Craved Artisan Platform',
        message: `
Beta Tester Application

Name: ${formData.name}
Phone: ${formData.phone || 'Not provided'}
Email: ${formData.email}
Location: ${formData.location || 'Not provided'}
Business Type: ${formData.businessType}
Business Name: ${formData.businessName || 'Not provided'}

This user is interested in being a beta tester for the Craved Artisan platform.
        `.trim()
      }, {
        withCredentials: true
      });

      setSubmitted(true);
      toast.success('Application submitted! We\'ll be in touch soon.');

      // Close overlay after 3 seconds
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          businessType: '',
          businessName: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting beta application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Construction Tape Border */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top tape */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 transform -rotate-1 opacity-90"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 20px, #fbbf24 20px, #fbbf24 40px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              />
              {/* Bottom tape */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 transform rotate-1 opacity-90"
                style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, #000 0px, #000 20px, #fbbf24 20px, #fbbf24 40px)',
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-16 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close overlay"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Content */}
            <div className="relative pt-20 pb-16 px-8">
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ rotate: -5 }}
                      animate={{ rotate: 5 }}
                      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                      className="inline-block mb-4"
                    >
                      <h1 className="text-5xl md:text-6xl font-black text-yellow-500 transform -rotate-2 drop-shadow-lg"
                        style={{ 
                          textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                          WebkitTextStroke: '2px black'
                        }}
                      >
                        COMING SOON!
                      </h1>
                    </motion.div>
                    
                    <p className="text-xl text-gray-700 font-semibold mb-2">
                      Interested in being a <span className="text-blue-600">Beta Tester</span>?
                    </p>
                    <p className="text-gray-600">
                      For this new small business platform?
                    </p>
                  </div>

                  {/* Beta Tester Perks */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Beta Tester Perks
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          <strong className="text-gray-900">Founders Account:</strong> Get early access to new features before anyone else
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          <strong className="text-gray-900">Free During Beta:</strong> Use the platform completely free during the testing phase
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          <strong className="text-gray-900">50% Off For Life:</strong> After testing, enjoy half-off monthly subscription cost forever!
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location (City, State)
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Atlanta, GA"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Business <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select business type</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Food Vendor">Food Vendor</option>
                        <option value="Artisan/Crafts">Artisan/Crafts</option>
                        <option value="Farmer/Produce">Farmer/Produce</option>
                        <option value="Specialty Foods">Specialty Foods</option>
                        <option value="Event Coordinator">Event Coordinator</option>
                        <option value="B2B Supplier">B2B Supplier</option>
                        <option value="Retail Location">Retail/Drop-off Location</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Business Name"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      {isSubmitting ? 'Submitting...' : 'Join Beta Waitlist'}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      We'll notify you when the beta window opens for testers!
                    </p>
                  </form>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    You're on the list!
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Thank you for your interest in becoming a beta tester.
                  </p>
                  <p className="text-gray-600">
                    We'll email you at <strong className="text-blue-600">{formData.email}</strong> when we're ready!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BetaTesterOverlay;

