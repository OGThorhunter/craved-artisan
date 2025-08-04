import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Globe, Instagram, Facebook, Twitter, X } from 'lucide-react';

interface VendorContact {
  email: string;
  phone?: string;
  website?: string;
}

interface VendorSocial {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  contact: VendorContact;
  social: VendorSocial;
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  vendorName, 
  contact, 
  social 
}: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contact {vendorName}</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-green" />
                <a 
                  href={`mailto:${contact.email}`} 
                  className="text-brand-green hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-green" />
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="text-brand-green hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              
              {contact.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-brand-green" />
                  <a 
                    href={contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-brand-green hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                {social.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={`https://instagram.com/${social.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                    title="Follow on Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                )}
                {social.facebook && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={`https://facebook.com/${social.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Follow on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                )}
                {social.twitter && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={`https://twitter.com/${social.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Follow on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 