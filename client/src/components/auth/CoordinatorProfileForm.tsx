import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface CoordinatorProfileData {
  organizationName: string;
  bio: string;
  website: string;
  phone: string;
  zip_code: string;
}

interface CoordinatorProfileFormProps {
  onDataChange: (data: CoordinatorProfileData, isValid: boolean) => void;
  initialData?: Partial<CoordinatorProfileData>;
  disabled?: boolean;
  className?: string;
}

const CoordinatorProfileForm: React.FC<CoordinatorProfileFormProps> = ({
  onDataChange,
  initialData = {},
  disabled = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<CoordinatorProfileData>({
    organizationName: initialData.organizationName || '',
    bio: initialData.bio || '',
    website: initialData.website || '',
    phone: initialData.phone || '',
    zip_code: initialData.zip_code || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Generate slug from organization name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate form data
  const validateForm = (data: CoordinatorProfileData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Organization name validation
    if (!data.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    } else if (data.organizationName.trim().length < 2) {
      newErrors.organizationName = 'Organization name must be at least 2 characters';
    } else if (data.organizationName.length > 100) {
      newErrors.organizationName = 'Organization name must be less than 100 characters';
    }

    // Website validation (optional)
    if (data.website) {
      try {
        new URL(data.website);
      } catch {
        newErrors.website = 'Please enter a valid website URL (e.g., https://example.com)';
      }
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

  // Update form data and validation
  useEffect(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0 && formData.organizationName.trim() !== '';
    
    onDataChange(formData, isValid);
  }, [formData, onDataChange]);

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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Coordinator Profile</h3>
        <p className="text-sm text-gray-600 mb-6">
          Tell us about your organization. This information will be displayed on your coordinator profile.
        </p>
      </div>

      {/* Organization Name */}
      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-black">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
              getFieldError('organizationName') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="Enter your organization or event company name"
            maxLength={100}
          />
          {getFieldError('organizationName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('organizationName')}</p>
          )}
        </div>
      </div>

      {/* Organization URL Preview */}
      {formData.organizationName && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-xs text-gray-500 mb-1">Your organization URL will be:</p>
          <p className="text-sm font-mono text-gray-700">
            cravedartisan.com/coordinator/{generateSlug(formData.organizationName) || 'your-organization'}
          </p>
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-black">
          Organization Description
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
            placeholder="Describe your organization, the types of events you coordinate, and your experience..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {getFieldError('bio') ? (
              <p className="text-sm text-red-600">{getFieldError('bio')}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Tell vendors and customers about your organization and events
              </p>
            )}
            <p className="text-xs text-gray-500">{formData.bio.length}/500</p>
          </div>
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-black">
          Website
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
              getFieldError('website') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E8CBAE]'
            }`}
            placeholder="https://yourorganization.com"
          />
          {getFieldError('website') ? (
            <p className="mt-1 text-sm text-red-600">{getFieldError('website')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Optional - Link to your organization's website
            </p>
          )}
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
              Optional - For vendors and customers to contact you
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
              Optional - Your organization's location for event planning
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorProfileForm;

