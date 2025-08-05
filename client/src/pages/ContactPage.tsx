'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Get in touch with our support team',
    contact: 'hello@cravedartisan.com',
    action: 'Send Email'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak with a team member directly',
    contact: '(404) 555-0123',
    action: 'Call Now'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our AI assistant',
    contact: 'Available 24/7',
    action: 'Start Chat'
  }
];

const officeLocations = [
  {
    city: 'Atlanta',
    address: '123 Peachtree St NE, Atlanta, GA 30308',
    hours: 'Mon-Fri: 9AM-6PM',
    phone: '(404) 555-0123'
  },
  {
    city: 'Macon',
    address: '456 Cherry St, Macon, GA 31201',
    hours: 'Mon-Fri: 9AM-5PM',
    phone: '(478) 555-0456'
  }
];

const faqs = [
  {
    question: 'How do I become a vendor?',
    answer: 'Visit our join page and select "Vendor" to start your application. We\'ll guide you through the process and help you set up your shop.'
  },
  {
    question: 'What areas do you serve?',
    answer: 'We currently serve communities across Georgia, with plans to expand to neighboring states. Enter your ZIP code to see if we\'re in your area.'
  },
  {
    question: 'How do I report an issue with an order?',
    answer: 'Contact our support team through email, phone, or live chat. We\'ll work with you and the vendor to resolve any issues quickly.'
  },
  {
    question: 'Do you offer delivery?',
    answer: 'Delivery options vary by vendor and location. Most vendors offer local pickup, and some provide delivery within their service area.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
    
    // Show success message (in a real app, you'd use a toast notification)
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="page-container bg-brand-cream">
      {/* Hero Section */}
      <div className="bg-brand-maroon text-white py-20">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg bg-brand-cream"
              >
                <div className="flex justify-center mb-4">
                  <method.icon className="h-12 w-12 text-brand-maroon" />
                </div>
                <h3 className="responsive-subheading text-brand-charcoal mb-2">{method.title}</h3>
                <p className="text-brand-grey mb-4">{method.description}</p>
                <p className="text-brand-maroon font-medium mb-4">{method.contact}</p>
                <button className="bg-brand-maroon text-white px-6 py-2 rounded-lg hover:bg-[#681b24] transition-colors">
                  {method.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form and Office Locations */}
      <div className="py-20">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="responsive-heading text-brand-charcoal mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block responsive-text font-medium text-brand-charcoal mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block responsive-text font-medium text-brand-charcoal mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block responsive-text font-medium text-brand-charcoal mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="vendor">Vendor Support</option>
                    <option value="customer">Customer Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block responsive-text font-medium text-brand-charcoal mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-maroon text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#681b24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Office Locations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="responsive-heading text-brand-charcoal mb-6">Our Offices</h2>
              <div className="space-y-6">
                {officeLocations.map((office, index) => (
                  <div key={office.city} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="responsive-subheading text-brand-charcoal mb-4">{office.city}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-brand-maroon mt-0.5" />
                        <p className="text-brand-grey">{office.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-brand-maroon" />
                        <p className="text-brand-grey">{office.hours}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-brand-maroon" />
                        <p className="text-brand-grey">{office.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto responsive-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="responsive-heading text-brand-charcoal mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-brand-grey">
              Find quick answers to common questions about Craved Artisan.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-brand-cream rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-brand-charcoal mb-3">{faq.question}</h3>
                <p className="text-brand-grey">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-brand-green text-white">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of customers and vendors who are already part of the Craved Artisan community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/join"
                className="bg-white text-brand-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Vendor
              </a>
              <a
                href="/marketplace"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-green transition-colors"
              >
                Shop Local
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
