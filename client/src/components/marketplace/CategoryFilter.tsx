import { Clock, Truck, Package, Users, TrendingUp, Zap, Navigation } from 'lucide-react';
import Button from '../ui/Button';

interface CategoryFilterProps {
  onFilterSelect: (filterId: string) => void;
  showLocationError?: boolean;
  onRetryLocation?: () => void;
}

interface FilterOption {
  id: string;
  label: string;
  Icon: typeof Clock;
}

const filterOptions: FilterOption[] = [
  { id: 'pickup', label: 'Pickup Now', Icon: Clock },
  { id: 'delivery', label: 'Delivery', Icon: Truck },
  { id: 'shipping', label: 'Shipping', Icon: Package },
  { id: 'food', label: 'Food', Icon: Users },
  { id: 'crafts', label: 'Crafts', Icon: TrendingUp },
  { id: 'services', label: 'Services', Icon: Zap },
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
        {filterOptions.map((filter) => {
          const Icon = filter.Icon;
          return (
            <Button
              key={filter.id}
              variant="secondary"
              onClick={() => onFilterSelect(filter.id)}
              className="text-sm px-4 py-2"
            >
              <Icon className="w-4 h-4 mr-1" />
              {filter.label}
            </Button>
          );
        })}
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

