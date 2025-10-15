import React, { useState, useEffect } from 'react';

interface CustomerProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  zip_code: string;
}

interface CustomerProfileFormProps {
  onDataChange: (data: CustomerProfileData, isValid: boolean) => void;
  initialData?: Partial<CustomerProfileData>;
  disabled?: boolean;
  className?: string;
}

const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({
  onDataChange,
  initialData = {},
  disabled = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<CustomerProfileData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phone: initialData.phone || '',
    zip_code: initialData.zip_code || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate form data
  const validateForm = (data: CustomerProfileData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // First name validation (optional but if provided, must be valid)
    if (data.firstName && data.firstName.trim().length < 1) {
      newErrors.firstName = 'First name cannot be empty';
    } else if (data.firstName && data.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }

    // Last name validation (optional but if provided, must be valid)
    if (data.lastName && data.lastName.trim().length < 1) {
      newErrors.lastName = 'Last name cannot be empty';
    } else if (data.lastName && data.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    // Phone validation (optional but if provided, must be valid)
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)\.]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation (optional but if provided, must be valid)
    if (data.zip_code && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
      newErrors.zip_code = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    return newErrors;
  };

  // Update form data and validation
  useEffect(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    
    // Customer profile is always valid since all fields are optional
    const isValid = Object.keys(newErrors).length === 0;
    
    onDataChange(formData, isValid);
  }, [formData, onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Profile</h3>
        <p className="text-sm text-gray-600 mb-6">
          Complete your profile to get a personalized shopping experience. All fields are optional and can be updated later.
        </p>
      </div>

      {/* Name Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-black">
            First Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
                getFieldError('firstName') 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-[#E8CBAE]'
              }`}
              placeholder="John"
              maxLength={50}
            />
            {getFieldError('firstName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-black">
            Last Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
                getFieldError('lastName') 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-[#E8CBAE]'
              }`}
              placeholder="Doe"
              maxLength={50}
            />
            {getFieldError('lastName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('lastName')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Phone Number */}
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
              For order updates and vendor communications
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
              To find vendors and events near you
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Profile Information
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              All profile information is optional and can be updated anytime from your account settings. 
              Providing this information helps vendors serve you better and enables features like local search.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileForm;

