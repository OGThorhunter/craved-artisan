import React from 'react';
import { Users, MapPin, Calendar, Phone, Mail, Edit, Trash2 } from 'lucide-react';

interface VendorAssignment {
  type: string;
  name: string;
  size: string;
  email?: string;
  phone?: string;
  appliedDate?: string;
}

interface StallStatus {
  status: string;
  zone: string;
  size: string;
}

interface StallAssignmentsProps {
  stallStatus: Record<number, StallStatus>;
  vendorAssignments: Record<number, VendorAssignment>;
  onEditAssignment?: (stallIndex: number, vendor: VendorAssignment) => void;
  onRemoveAssignment?: (stallIndex: number) => void;
}

export function StallAssignments({
  stallStatus,
  vendorAssignments,
  onEditAssignment,
  onRemoveAssignment
}: StallAssignmentsProps) {
  // Get all sold stalls with vendor assignments
  const soldStalls = Object.entries(stallStatus)
    .filter(([index, status]) => status.status === 'stall')
    .map(([index, status]) => ({
      index: parseInt(index),
      status,
      vendor: vendorAssignments[parseInt(index)]
    }))
    .filter(stall => stall.vendor); // Only show stalls with vendor assignments

  // Group by vendor type
  const stallsByType = soldStalls.reduce((acc, stall) => {
    const type = stall.vendor.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(stall);
    return acc;
  }, {} as Record<string, typeof soldStalls>);

  const getVendorTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'baker': return 'bg-orange-100 text-orange-800';
      case 'honey': return 'bg-yellow-100 text-yellow-800';
      case 'vegetables': return 'bg-green-100 text-green-800';
      case 'artisan': return 'bg-purple-100 text-purple-800';
      case 'crafts': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getZoneColor = (zone: string): string => {
    switch (zone) {
      case 'zone-a': return 'bg-blue-100 text-blue-800';
      case 'zone-b': return 'bg-green-100 text-green-800';
      case 'zone-c': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (soldStalls.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stall Assignments Yet</h3>
        <p className="text-gray-600">Vendors haven't been assigned to stalls yet. Use the layout wizard to assign vendors to specific stalls.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <Users className="w-6 h-6 text-brand-green" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{soldStalls.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendor Types</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stallsByType).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stalls Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{soldStalls.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stall Assignments by Type */}
      {Object.entries(stallsByType).map(([type, stalls]) => (
        <div key={type} className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{type} Vendors</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVendorTypeColor(type)}`}>
                {stalls.length} {stalls.length === 1 ? 'vendor' : 'vendors'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stalls.map((stall) => (
              <div key={stall.index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{stall.vendor.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneColor(stall.status.zone)}`}>
                        {stall.status.zone.replace('zone-', 'Zone ').toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {stall.vendor.size}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Stall #{stall.index}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{stall.vendor.type}</span>
                      </div>
                      {stall.vendor.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{stall.vendor.email}</span>
                        </div>
                      )}
                      {stall.vendor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{stall.vendor.phone}</span>
                        </div>
                      )}
                      {stall.vendor.appliedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {new Date(stall.vendor.appliedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEditAssignment?.(stall.index, stall.vendor)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit assignment"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onRemoveAssignment?.(stall.index)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove assignment"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Vendor Type Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Type Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stallsByType).map(([type, stalls]) => (
            <div key={type} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getVendorTypeColor(type)}`}>
                {type}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stalls.length}</div>
              <div className="text-sm text-gray-600">vendors</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
