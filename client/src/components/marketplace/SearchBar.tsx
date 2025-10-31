import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import Button from '../ui/Button';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SearchBar({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  placeholder = 'Search for products, vendors, or categories...'
}: SearchBarProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="pl-10 pr-4 py-3 text-lg"
        />
        <Button
          onClick={onSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          Search
        </Button>
      </div>
    </div>
  );
}

