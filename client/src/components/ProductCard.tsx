import { Link } from 'wouter';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: string[];
  availability: 'in_stock' | 'low' | 'out';
  onAdd?: () => void;
}

export function ProductCard({ id, title, price, imageUrl, tags, availability, onAdd }: ProductCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'In Stock';
      case 'low':
        return 'Low Stock';
      case 'out':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <Link href={`/product/${id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/product/${id}`} className="block">
          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(availability)}`}>
            {getAvailabilityText(availability)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {onAdd && availability !== 'out' && (
          <button
            onClick={onAdd}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
