import { Leaf, ShieldCheck } from 'lucide-react';

interface Vendor {
  description: string;
  values: string[];
  certifications: string[];
}

interface VendorBioProps {
  vendor: Vendor;
}

export default function VendorBio({ vendor }: VendorBioProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {vendor.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Values & Certifications</h3>
            <div className="space-y-3">
              {vendor.values.map((value, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <span>{value}</span>
                </div>
              ))}
              {vendor.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 