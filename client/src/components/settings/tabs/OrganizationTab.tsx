import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../LoadingSpinner';
import { ErrorCard } from '../../ui/ErrorCard';
import Button from '../../ui/Button';
import toast from 'react-hot-toast';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AddressData {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export function OrganizationTab() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    primaryEmail: '',
    primaryPhone: '',
    taxId: '',
    logoUrl: '',
  });
  const [addressData, setAddressData] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal: '',
    country: 'US',
  });

  // Fetch organization data
  const { data: orgData, isLoading, error } = useQuery({
    queryKey: ['settings', 'organization'],
    queryFn: async (): Promise<{ success: boolean; data: OrganizationData }> => {
      const response = await fetch('/api/settings/org', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch organization data');
      }
      return response.json();
    },
  });

  // Fetch address data
  const { data: addressResponse } = useQuery({
    queryKey: ['settings', 'organization', 'address'],
    queryFn: async (): Promise<{ success: boolean; data: AddressData | null }> => {
      const response = await fetch('/api/settings/org/address', {
        credentials: 'include',
      });
      if (!response.ok) {
        return { success: false, data: null };
      }
      return response.json();
    },
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async (data: Partial<OrganizationData>) => {
      const response = await fetch('/api/settings/org', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update organization');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'organization'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'overview'] });
      setIsEditing(false);
      toast.success('Organization updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update organization');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressData) => {
      const response = await fetch('/api/settings/org/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update address');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'organization', 'address'] });
      setIsEditingAddress(false);
      toast.success('Address updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update address');
    },
  });

  // Initialize form data when organization loads
  React.useEffect(() => {
    if (orgData?.data) {
      setFormData({
        name: orgData.data.name || '',
        primaryEmail: orgData.data.primaryEmail || '',
        primaryPhone: orgData.data.primaryPhone || '',
        taxId: orgData.data.taxId || '',
        logoUrl: orgData.data.logoUrl || '',
      });
    }
  }, [orgData]);

  React.useEffect(() => {
    if (addressResponse?.data) {
      setAddressData({
        name: addressResponse.data.name || '',
        line1: addressResponse.data.line1 || '',
        line2: addressResponse.data.line2 || '',
        city: addressResponse.data.city || '',
        state: addressResponse.data.state || '',
        postal: addressResponse.data.postal || '',
        country: addressResponse.data.country || 'US',
      });
    }
  }, [addressResponse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgMutation.mutate(formData);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddressMutation.mutate({ ...addressData, id: addressData.id || crypto.randomUUID() });
  };

  const handleOrgCancel = () => {
    if (orgData?.data) {
      setFormData({
        name: orgData.data.name || '',
        primaryEmail: orgData.data.primaryEmail || '',
        primaryPhone: orgData.data.primaryPhone || '',
        taxId: orgData.data.taxId || '',
        logoUrl: orgData.data.logoUrl || '',
      });
    }
    setIsEditing(false);
  };

  const handleAddressCancel = () => {
    if (addressResponse?.data) {
      setAddressData({
        name: addressResponse.data.name || '',
        line1: addressResponse.data.line1 || '',
        line2: addressResponse.data.line2 || '',
        city: addressResponse.data.city || '',
        state: addressResponse.data.state || '',
        postal: addressResponse.data.postal || '',
        country: addressResponse.data.country || 'US',
      });
    }
    setIsEditingAddress(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorCard 
          title="Failed to load organization data"
          message="There was an error loading organization information. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const organization = orgData?.data;
  const address = addressResponse?.data;

  return (
    <div className="p-8 space-y-8">
      {/* Organization Information */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Organization</h2>
            <p className="text-gray-600">Manage your organization's basic information and branding.</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              size="sm"
            >
              Edit Organization
            </Button>
          )}
        </div>

        <form onSubmit={handleOrgSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="primaryEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Email
              </label>
              <input
                type="email"
                id="primaryEmail"
                name="primaryEmail"
                value={formData.primaryEmail}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="primaryPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Phone
              </label>
              <input
                type="tel"
                id="primaryPhone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="12-3456789"
              />
            </div>
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleOrgCancel}
                disabled={updateOrgMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateOrgMutation.isPending}
              >
                {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Address Information */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Address
            </h3>
            <p className="text-gray-600">Your organization's physical address.</p>
          </div>
          {!isEditingAddress && (
            <Button
              onClick={() => setIsEditingAddress(true)}
              variant="secondary"
              size="sm"
            >
              Edit Address
            </Button>
          )}
        </div>

        <form onSubmit={handleAddressSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 mb-2">
                Address Name
              </label>
              <input
                type="text"
                id="addressName"
                name="name"
                value={addressData.name}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Headquarters"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                id="line1"
                name="line1"
                value={addressData.line1}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="line2"
                name="line2"
                value={addressData.line2}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Suite 100"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={addressData.city}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Portland"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={addressData.state}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="OR"
              />
            </div>

            <div>
              <label htmlFor="postal" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postal"
                name="postal"
                value={addressData.postal}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="97201"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={addressData.country}
                onChange={handleAddressChange}
                disabled={!isEditingAddress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {isEditingAddress && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddressCancel}
                disabled={updateAddressMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAddressMutation.isPending}
              >
                {updateAddressMutation.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
