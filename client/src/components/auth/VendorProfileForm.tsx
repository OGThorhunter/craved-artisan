import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface VendorProfileData {
  storeName: string;
  bio: string;
  phone: string;
  zip_code: string;
  slug?: string;
}

interface VendorProfileFormProps {
  onDataChange: (data: VendorProfileData, isValid: boolean) => void;
  initialData?: Partial<VendorProfileData>;
  disabled?: boolean;
  className?: string;
}

const VendorProfileForm: React.FC<VendorProfileFormProps> = ({
  onDataChange,
  initialData = {},
  disabled = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<VendorProfileData>({
    storeName: initialData.storeName || '',
    bio: initialData.bio || '',
    phone: initialData.phone || '',
    zip_code: initialData.zip_code || '',
    slug: initialData.slug || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Generate slug from store name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate form data
  const validateForm = (data: VendorProfileData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Store name validation
    if (!data.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    } else if (data.storeName.trim().length < 2) {
      newErrors.storeName = 'Store name must be at least 2 characters';
    } else if (data.storeName.length > 100) {
      newErrors.storeName = 'Store name must be less than 100 characters';
    }

    // Phone validation (optional)
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)\.]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation (optional)
    if (data.zip_code && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
      newErrors.zip_code = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    // Bio validation (optional)
    if (data.bio && data.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    return newErrors;
  };

  // Wrap onDataChange with useCallback to prevent infinite loops
  const handleDataChange = useCallback((data: VendorProfileData, isValid: boolean) => {
    onDataChange(data, isValid);
  }, [onDataChange]);

  // Update form data and validation
  useEffect(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0 && formData.storeName.trim() !== '';
    
    // Auto-generate slug from store name
    const updatedData = {
      ...formData,
      slug: generateSlug(formData.storeName)
    };
    
    handleDataChange(updatedData, isValid);
  }, [formData, handleDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Profile Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Tell us about your business. This information will be displayed on your vendor profile.
        </p>
      </div>

      {/* Store Name */}
      <div>
        <label htmlFor="storeName" className="block text-sm font-medium text-black">
          Store Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
              getFieldError('storeName') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="Enter your store or business name"
            maxLength={100}
          />
          {getFieldError('storeName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('storeName')}</p>
          )}
        </div>
      </div>

      {/* Store URL Preview */}
      {formData.storeName && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-xs text-gray-500 mb-1">Your store URL will be:</p>
          <p className="text-sm font-mono text-gray-700">
            cravedartisan.com/vendor/{generateSlug(formData.storeName) || 'your-store'}
          </p>
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-black">
          Business Description
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black resize-vertical ${
              getFieldError('bio') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="Describe your business, products, and what makes you unique..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {getFieldError('bio') ? (
              <p className="text-sm text-red-600">{getFieldError('bio')}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Tell customers about your business and what you offer
              </p>
            )}
            <p className="text-xs text-gray-500">{formData.bio.length}/500</p>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-black">
          Phone Number
        </label>
        <div className="mt-1">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
              getFieldError('phone') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="(555) 123-4567"
          />
          {getFieldError('phone') ? (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Optional - For customers to contact you directly
            </p>
          )}
        </div>
      </div>

      {/* ZIP Code */}
      <div>
        <label htmlFor="zip_code" className="block text-sm font-medium text-black">
          ZIP Code
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="zip_code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
              getFieldError('zip_code') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="12345"
            maxLength={10}
          />
          {getFieldError('zip_code') ? (
            <p className="mt-1 text-sm text-red-600">{getFieldError('zip_code')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Optional - Helps customers find local vendors
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfileForm;

