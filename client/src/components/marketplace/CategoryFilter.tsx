import { Clock, Truck, Package, Users, TrendingUp, Zap, Navigation } from 'lucide-react';
import Button from '../ui/Button';
import { ReactNode } from 'react';

interface CategoryFilterProps {
  onFilterSelect: (filterId: string) => void;
  showLocationError?: boolean;
  onRetryLocation?: () => void;
}

interface FilterOption {
  id: string;
  label: string;
  icon: ReactNode;
}

const filterOptions: FilterOption[] = [
  { id: 'pickup', label: 'Pickup Now', icon: <Clock className="w-4 h-4" /> },
  { id: 'delivery', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
  { id: 'shipping', label: 'Shipping', icon: <Package className="w-4 h-4" /> },
  { id: 'food', label: 'Food', icon: <Users className="w-4 h-4" /> },
  { id: 'crafts', label: 'Crafts', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'services', label: 'Services', icon: <Zap className="w-4 h-4" /> },
];

export function CategoryFilter({ 
  onFilterSelect, 
  showLocationError = false, 
  onRetryLocation 
}: CategoryFilterProps) {
  return (
    <>
      {/* Quick Filter Chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {filterOptions.map((filter) => (
          <Button
            key={filter.id}
            variant="secondary"
            onClick={() => onFilterSelect(filter.id)}
            className="text-sm px-4 py-2"
          >
            {filter.icon}
            <span className="ml-1">{filter.label}</span>
          </Button>
        ))}
      </div>

      {/* Location Status */}
      {showLocationError && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Enable location to see nearby products and pickup windows
          </p>
          {onRetryLocation && (
            <Button
              variant="ghost"
              onClick={onRetryLocation}
              className="text-sm"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      )}
    </>
  );
}

