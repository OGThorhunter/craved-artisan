import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { 
  Store, 
  Edit3, 
  Save, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  bio: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  storeName: string;
  bio: string;
  imageUrl: string;
}

export const VendorSettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<FormData>();

  // Load vendor profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/vendor/profile', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Set form values
          setValue('storeName', data.storeName);
          setValue('bio', data.bio || '');
          setValue('imageUrl', data.imageUrl || '');
        } else if (response.status === 404) {
          // Profile doesn't exist yet, show empty form
          toast('No profile found. Create your store profile below.', {
            icon: <AlertCircle className="w-5 h-5 text-blue-500" />
          });
        } else {
          throw new Error('Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          storeName: data.storeName.trim(),
          bio: data.bio.trim() || null,
          imageUrl: data.imageUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        reset(data); // Reset form to mark as clean
        toast.success('Profile updated successfully!', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        });
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Store name already exists');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="p-8 pt-12">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-amber-50 rounded-2xl shadow-sm p-6 mb-8 border border-amber-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Store className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="responsive-heading text-gray-900">Store Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your store profile and branding
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-amber-50 rounded-2xl shadow-sm p-8 border border-amber-200">
          <div className="flex items-center space-x-3 mb-6">
            <Edit3 className="w-6 h-6 text-gray-600" />
            <h2 className="responsive-subheading text-gray-900">Store Profile</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block responsive-text font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                id="storeName"
                {...register('storeName', {
                  required: 'Store name is required',
                  minLength: {
                    value: 2,
                    message: 'Store name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Store name must be less than 50 characters'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.storeName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your store name"
              />
              {errors.storeName && (
                <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
              )}
              {profile?.slug && (
                <p className="mt-1 responsive-text text-gray-500">
                  Store URL: <span className="font-mono">/store/{profile.slug}</span>
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block responsive-text font-medium text-gray-700 mb-2">
                Store Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio must be less than 500 characters'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                  errors.bio ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tell customers about your store, products, and story..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
              <p className="mt-1 responsive-text text-gray-500">
                Optional. Help customers understand what makes your store unique.
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block responsive-text font-medium text-gray-700 mb-2">
                Store Image URL
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="url"
                    id="imageUrl"
                    {...register('imageUrl', {
                      pattern: {
                        value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                        message: 'Please enter a valid image URL'
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.imageUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/store-image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Upload image"
                  >
                    <Upload className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <p className="mt-1 responsive-text text-gray-500">
                Optional. This will be displayed as your store's main image.
              </p>
            </div>

            {/* Image Preview */}
            {profile?.imageUrl && (
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Current Store Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={profile.imageUrl}
                      alt="Store"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="responsive-text text-gray-600">
                    <p>Current store image</p>
                    <p className="text-gray-500">Update the URL above to change</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="responsive-text text-gray-600">
                {isDirty && <span className="text-orange-600">â€¢ You have unsaved changes</span>}
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (profile) {
                      setValue('storeName', profile.storeName);
                      setValue('bio', profile.bio || '');
                      setValue('imageUrl', profile.imageUrl || '');
                      reset();
                    }
                  }}
                  className="responsive-button border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={!isDirty}
                >
                  Reset
                </button>
                                 <button
                   type="submit"
                   disabled={isSaving || !isDirty}
                   className="responsive-button bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                 >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8 bg-amber-50 rounded-2xl shadow-sm p-8 border border-amber-200">
          <h2 className="responsive-subheading text-gray-900 mb-6">Additional Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Store Status</h3>
              <p className="responsive-text text-gray-600 mb-3">Control whether your store is visible to customers</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Store Slug</h3>
              <p className="responsive-text text-gray-600 mb-3">Your store's unique URL identifier</p>
              <p className="text-sm font-mono text-gray-700">
                {profile?.slug || 'Will be generated from store name'}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}; 
