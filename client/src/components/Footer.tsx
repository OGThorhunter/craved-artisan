import { Link } from 'wouter';
import { Facebook, Instagram, MapPin } from 'lucide-react';
import { useZip } from '../contexts/ZipContext';

export default function Footer() {
  const { zip } = useZip();
  
  return (
    <footer className="bg-brand-green text-white px-6 py-10">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Branding */}
        <div>
          <h3 className="text-xl font-bold tracking-wide mb-2">Craved Artisan</h3>
          <p className="text-sm">
            A Rose Creek Family Farms Co.  
            <br />Handcrafted goods. Local impact.
          </p>
          <p className="mt-2 text-xs text-white/70">&copy; 2025 Craved Artisan</p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-md font-semibold mb-2">Explore</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/vendors">Vendors</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Social + ZIP CTA */}
        <div>
          <h4 className="text-md font-semibold mb-2">Connect</h4>
          <div className="flex space-x-4 mb-3">
            <a href="https://facebook.com/share/1FR8cWMRqz/" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-5 w-5 hover:scale-110 transition" />
            </a>
            <a href="https://instagram.com/rosecreekfamilyfarms?igsh=b2drMGQzMGdjYzl2" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 hover:scale-110 transition" />
            </a>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Shopping locally in <strong>{zip}</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
} 