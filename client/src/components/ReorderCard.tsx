import { useState } from 'react';
import { Link } from 'wouter';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  MapPin, 
  Plus, 
  Minus,
  Info
} from 'lucide-react';

interface ReorderCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: {
      id: string;
      name: string;
      logo?: string;
    };
    lastOrdered: string;
    reorderCount: number;
    inStock: boolean;
  };
  onReorder: (productId: string, quantity: number, deliveryType: 'pickup' | 'delivery') => void;
  className?: string;
  showQuantitySelector?: boolean;
  showDeliveryToggle?: boolean;
  compact?: boolean;
}

export const ReorderCard: React.FC<ReorderCardProps> = ({
  product,
  onReorder,
  className = '',
  showQuantitySelector = true,
  showDeliveryToggle = true,
  compact = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleReorder = () => {
    onReorder(product.id, quantity, deliveryType);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex gap-3">
        {/* Product Thumbnail */}
        <div className="flex-shrink-0">
          <div className={`bg-gray-100 rounded-lg overflow-hidden ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product & Vendor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {product.name}
              </h3>
              
              {/* Vendor Info */}
              <div className="flex items-center gap-2 mt-1">
                {product.vendor.logo && (
                  <img
                    src={product.vendor.logo}
                    alt={product.vendor.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                <span className={`text-brand-grey ${compact ? 'text-xs' : 'text-sm'}`}>
                  {product.vendor.name}
                </span>
              </div>

              {/* Last Ordered Date */}
              <p className={`text-brand-grey mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                Last ordered {formatDate(product.lastOrdered)}
              </p>

              {/* Price */}
              <p className={`font-semibold text-brand-maroon mt-1 ${compact ? 'text-sm' : 'text-base'}`}>
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Reorder Count Tooltip */}
                         <div className="relative flex-shrink-0">
               <button
                 onMouseEnter={() => setShowTooltip(true)}
                 onMouseLeave={() => setShowTooltip(false)}
                 className="text-brand-grey hover:text-brand-green transition-colors"
                 title={`Reordered ${product.reorderCount} times`}
               >
                 <Info className="w-4 h-4" />
               </button>
              
              {showTooltip && (
                <div className="absolute top-full right-0 mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Reordered {product.reorderCount}x
                  <div className="absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {showQuantitySelector && (
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-brand-grey ${compact ? 'text-xs' : 'text-sm'}`}>Qty:</span>
                             <div className="flex items-center border border-gray-300 rounded-lg">
                 <button
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   className="p-1 hover:bg-gray-50 transition-colors"
                   disabled={quantity <= 1}
                   title="Decrease quantity"
                 >
                   <Minus className="w-3 h-3" />
                 </button>
                 <span className={`px-2 ${compact ? 'text-sm' : 'text-base'}`}>{quantity}</span>
                 <button
                   onClick={() => setQuantity(quantity + 1)}
                   className="p-1 hover:bg-gray-50 transition-colors"
                   title="Increase quantity"
                 >
                   <Plus className="w-3 h-3" />
                 </button>
               </div>
            </div>
          )}

          {/* Delivery/Pickup Toggle */}
          {showDeliveryToggle && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-brand-grey ${compact ? 'text-xs' : 'text-sm'}`}>Delivery:</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    deliveryType === 'pickup'
                      ? 'bg-brand-green text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Pickup
                </button>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    deliveryType === 'delivery'
                      ? 'bg-brand-green text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="w-3 h-3 inline mr-1" />
                  Delivery
                </button>
              </div>
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Package className="w-3 h-3 mr-1" />
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reorder Button */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleReorder}
          disabled={!product.inStock}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            product.inStock
              ? 'bg-brand-green text-white hover:bg-brand-green/80'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Reorder
        </button>
        
        <Link href={`/product/${product.id}`}>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            View
          </button>
        </Link>
      </div>
    </div>
  );
}; 