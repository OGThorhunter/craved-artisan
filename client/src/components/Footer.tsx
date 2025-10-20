import { Link } from 'wouter';
import { Facebook, Instagram, MapPin, Mail, Phone, Clock, HelpCircle } from 'lucide-react';
import { useZip } from '../contexts/ZipContext';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  const { zip } = useZip();
  
  return (
    <footer className="bg-brand-green text-white">
      {/* Main Footer Content */}
      <div className="px-6 py-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold tracking-wide mb-3">Craved Artisan</h3>
            <p className="text-sm text-white/90 mb-3">
              A Rose Creek Family Farms Company
            </p>
            <p className="text-sm text-white/80 mb-1">
              Handcrafted goods. Local impact.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Locust Grove, GA 30248</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Mon–Fri: 9AM–6PM ET</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4" />
              <span>Shopping in <strong>{zip}</strong></span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-white/80 hover:text-white transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-white/80 hover:text-white transition">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white/80 hover:text-white transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white/80 hover:text-white transition">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Help Center
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-md font-semibold mb-3">Support & Legal</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <a 
                  href="mailto:support@cravedartisan.com" 
                  className="text-white/80 hover:text-white transition flex items-center gap-2"
                >
                  <Mail className="h-3 w-3" />
                  support@cravedartisan.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+14045550123" 
                  className="text-white/80 hover:text-white transition flex items-center gap-2"
                >
                  <Phone className="h-3 w-3" />
                  (404) 555-0123
                </a>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white/80 hover:text-white transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <NewsletterSignup />
            
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com/share/1FR8cWMRqz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com/rosecreekfamilyfarms?igsh=b2drMGQzMGdjYzl2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <p>&copy; 2025 Craved Artisan. A Rose Creek Family Farms Company. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>
              <span>•</span>
              <Link href="/contact?subject=data-deletion" className="hover:text-white transition">
                Delete Data
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
