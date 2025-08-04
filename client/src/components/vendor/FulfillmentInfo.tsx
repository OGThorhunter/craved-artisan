import { Clock, MapPin, Truck } from 'lucide-react';

interface Vendor {
  nextPickup: string;
  pickupLocation: string;
  deliveryAreas: string[];
  businessHours: string;
}

interface FulfillmentInfoProps {
  vendor: Vendor;
}

export default function FulfillmentInfo({ vendor }: FulfillmentInfoProps) {
  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fulfillment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-brand-green" />
              <h3 className="font-semibold">Next Pickup</h3>
            </div>
            <p className="text-gray-700">{vendor.nextPickup}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-brand-green" />
              <h3 className="font-semibold">Pickup Location</h3>
            </div>
            <p className="text-gray-700">{vendor.pickupLocation}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-brand-green" />
              <h3 className="font-semibold">Delivery Areas</h3>
            </div>
            <p className="text-gray-700">{vendor.deliveryAreas.join(', ')}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-brand-cream rounded-lg">
          <h3 className="font-semibold mb-2">Business Hours</h3>
          <p className="text-gray-700">{vendor.businessHours}</p>
        </div>
      </div>
    </div>
  );
} 