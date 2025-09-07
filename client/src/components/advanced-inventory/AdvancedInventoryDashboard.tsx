import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Warehouse,
  Package,
  AlertTriangle,
  Clock,
  MapPin,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  XCircle,
  CheckCircle,
  Calendar,
  Thermometer,
  Droplets,
  Hash,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Target,
  Zap,
  Download,
  Upload,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Info,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';

interface WarehouseLocation {
  id: string;
  name: string;
  zone: string;
  aisle: string;
  shelf: string;
  position: string;
  capacity: number;
  currentStock: number;
  temperature?: number;
  humidity?: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  supplier: string;
  purchaseDate: string;
  expirationDate?: string;
  locationId: string;
  locationName: string;
  costPerUnit: number;
  totalCost: number;
  status: 'active' | 'expired' | 'recalled' | 'consumed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpirationAlert {
  id: string;
  itemId: string;
  itemName: string;
  batchId: string;
  batchNumber: string;
  expirationDate: string;
  daysUntilExpiration: number;
  alertLevel: 'warning' | 'critical' | 'expired';
  locationId: string;
  locationName: string;
  quantity: number;
  unit: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

interface AdvancedInventoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedInventoryDashboard({ isOpen, onClose }: AdvancedInventoryDashboardProps) {
  const [activeTab, setActiveTab] = useState<'warehouse' | 'batches' | 'alerts' | 'analytics'>('warehouse');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [editingLocation, setEditingLocation] = useState<WarehouseLocation | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const queryClient = useQueryClient();

  // Fetch warehouse locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['warehouse-locations', filterZone],
    queryFn: async () => {
      const response = await api.get('/advanced-inventory/warehouse/locations', {
        params: { zone: filterZone || undefined }
      });
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await api.get('/advanced-inventory/batches');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch expiration alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['expiration-alerts'],
    queryFn: async () => {
      const response = await api.get('/advanced-inventory/expiration-alerts');
      return response.data;
    },
    enabled: isOpen && activeTab === 'alerts',
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['warehouse-analytics'],
    queryFn: async () => {
      const response = await api.get('/advanced-inventory/analytics');
      return response.data;
    },
    enabled: isOpen && activeTab === 'analytics',
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (data: Partial<WarehouseLocation>) => {
      const response = await api.post('/advanced-inventory/warehouse/locations', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Location created successfully');
      queryClient.invalidateQueries(['warehouse-locations']);
      setShowAddLocation(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create location');
    },
  });

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (data: Partial<Batch>) => {
      const response = await api.post('/advanced-inventory/batches', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Batch created successfully');
      queryClient.invalidateQueries(['batches']);
      queryClient.invalidateQueries(['warehouse-locations']);
      setShowAddBatch(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create batch');
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WarehouseLocation> }) => {
      const response = await api.put(`/advanced-inventory/warehouse/locations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Location updated successfully');
      queryClient.invalidateQueries(['warehouse-locations']);
      setEditingLocation(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update location');
    },
  });

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Batch> }) => {
      const response = await api.put(`/advanced-inventory/batches/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Batch updated successfully');
      queryClient.invalidateQueries(['batches']);
      queryClient.invalidateQueries(['warehouse-locations']);
      setEditingBatch(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update batch');
    },
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post(`/advanced-inventory/expiration-alerts/${alertId}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alert acknowledged');
      queryClient.invalidateQueries(['expiration-alerts']);
    },
    onError: () => {
      toast.error('Failed to acknowledge alert');
    },
  });


  // Get alert level color
  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get alert level icon
  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Get unique zones from warehouse locations
  const availableZones = React.useMemo(() => {
    if (!locationsData?.locations) return [];
    const zones = locationsData.locations
      .map((location: WarehouseLocation) => location.zone)
      .filter((zone: string, index: number, array: string[]) => array.indexOf(zone) === index)
      .sort();
    return zones;
  }, [locationsData?.locations]);

  // Filter locations based on search term and zone
  const filteredLocations = locationsData?.locations?.filter((location: WarehouseLocation) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = !filterZone || location.zone === filterZone;
    return matchesSearch && matchesZone;
  }) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-stone-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Warehouse className="w-6 h-6 text-stone-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Advanced Inventory Management</h2>
                <p className="text-sm text-gray-600">Warehouse layout, batch tracking, and expiration monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close dashboard"
                aria-label="Close dashboard"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {[
              { id: 'warehouse', label: 'Warehouse Layout', icon: MapPin },
              { id: 'batches', label: 'Inventory Tracking', icon: Package },
              { id: 'alerts', label: 'Expiration Alerts', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                title={`Switch to ${label} tab`}
                aria-label={`Switch to ${label} tab`}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Warehouse Layout Tab */}
          {activeTab === 'warehouse' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by zone"
                  >
                    <option value="">All Zones</option>
                    {availableZones.map((zone) => (
                      <option key={zone} value={zone}>
                        Zone {zone}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddLocation(true)}
                  title="Add new warehouse location"
                  aria-label="Add new warehouse location"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>

              {/* Warehouse Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location: WarehouseLocation) => (
                  <div
                    key={location.id}
                    className="bg-offwhite rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-800" />
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedLocation(location)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View details"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingLocation(location)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit location"
                          aria-label="Edit location"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium">{location.zone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Aisle:</span>
                        <span className="font-medium">{location.aisle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Shelf:</span>
                        <span className="font-medium">{location.shelf}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{location.position}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{location.currentStock}/{location.capacity}</span>
                      </div>
                      {location.temperature && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Temp:</span>
                          <span className="font-medium flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            {location.temperature}°C
                          </span>
                        </div>
                      )}
                      {location.humidity && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Humidity:</span>
                          <span className="font-medium flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            {location.humidity}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-800 h-2 rounded-full"
                          style={{ width: `${Math.min((location.currentStock / location.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((location.currentStock / location.capacity) * 100)}% utilized
                      </div>
                    </div>
                    
                    {location.description && (
                      <div className="mt-3 text-sm text-gray-600">
                        {location.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Tracking Tab */}
          {activeTab === 'batches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Tracking</h3>
                  <p className="text-sm text-gray-600">Track inventory batches, expiration dates, and stock movements</p>
                </div>
                <button
                  onClick={() => setShowAddBatch(true)}
                  title="Add new inventory batch"
                  aria-label="Add new inventory batch"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Inventory Batch
                </button>
              </div>

              <div className="bg-offwhite rounded-lg shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-offwhite divide-y divide-gray-200">
                      {batchesData?.batches?.map((batch: Batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {batch.batchNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.itemName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.quantity} {batch.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.locationName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              batch.status === 'active' ? 'bg-green-100 text-green-800' :
                              batch.status === 'expired' ? 'bg-red-100 text-red-800' :
                              batch.status === 'recalled' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setSelectedLocation(batch)}
                                className="text-red-800 hover:text-red-900"
                                title="View batch details"
                                aria-label="View batch details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditingBatch(batch)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Edit batch"
                                aria-label="Edit batch"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Expiration Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Expiration Alerts</h3>
                {alertsData?.summary && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>{alertsData.summary.expired} Expired</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>{alertsData.summary.critical} Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>{alertsData.summary.warning} Warning</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {alertsData?.alerts?.map((alert: ExpirationAlert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${getAlertLevelColor(alert.alertLevel)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAlertLevelIcon(alert.alertLevel)}
                        <div>
                          <h4 className="font-semibold">{alert.itemName}</h4>
                          <p className="text-sm">
                            Batch: {alert.batchNumber} • {alert.quantity} {alert.unit} • {alert.locationName}
                          </p>
                          <p className="text-sm">
                            Expires: {new Date(alert.expirationDate).toLocaleDateString()} 
                            ({alert.daysUntilExpiration < 0 ? 'Expired' : `${alert.daysUntilExpiration} days`})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.isAcknowledged && (
                          <button
                            onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                            disabled={acknowledgeAlertMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Acknowledge
                          </button>
                        )}
                        {alert.isAcknowledged && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            Acknowledged
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : analyticsData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.analytics.totalLocations}</p>
                      <p className="text-sm text-blue-600">Total Locations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.analytics.occupiedLocations}</p>
                      <p className="text-sm text-green-600">Occupied Locations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.analytics.utilizationRate}%</p>
                      <p className="text-sm text-purple-600">Utilization Rate</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{analyticsData.analytics.expiringItems}</p>
                      <p className="text-sm text-orange-600">Expiring Items</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Breakdown */}
              <div className="bg-offwhite border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Utilization</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(analyticsData.analytics.zoneBreakdown).map(([zone, count]) => (
                    <div key={zone} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                      <p className="text-sm text-gray-600">Zone {zone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Items */}
              <div className="bg-offwhite border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Items by Value</h3>
                <div className="space-y-2">
                  {analyticsData.analytics.topItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{item.itemName}</span>
                      </div>
                      <span className="text-sm text-gray-600">${item.totalValue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Value by Zone */}
              <div className="bg-offwhite border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Value by Zone</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.analytics.stockValueByZone).map(([zone, value]) => (
                    <div key={zone} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Zone {zone}</span>
                      <span className="text-lg font-bold text-green-600">${(value as number).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity by Zone */}
              <div className="bg-offwhite border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity by Zone</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.analytics.capacityByZone).map(([zone, capacity]) => (
                    <div key={zone} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Zone {zone}</span>
                      <span className="text-lg font-bold text-blue-600">{capacity as number} units</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-offwhite border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{analyticsData.analytics.expiredItems}</div>
                    <p className="text-sm text-red-600">Expired Items</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analyticsData.analytics.expiringItems}</div>
                    <p className="text-sm text-orange-600">Expiring Soon</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{analyticsData.analytics.lowStockItems}</div>
                    <p className="text-sm text-yellow-600">Low Stock</p>
                  </div>
                </div>
              </div>
            </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load analytics data</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Advanced Inventory Management • {locationsData?.total || 0} locations • {batchesData?.total || 0} batches
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>

        {/* Add Location Modal */}
        {showAddLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Warehouse Location</h3>
                <button
                  onClick={() => setShowAddLocation(false)}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  name: formData.get('name') as string,
                  zone: formData.get('zone') as string,
                  aisle: formData.get('aisle') as string,
                  shelf: formData.get('shelf') as string,
                  position: formData.get('position') as string,
                  capacity: Number(formData.get('capacity')),
                  temperature: formData.get('temperature') ? Number(formData.get('temperature')) : undefined,
                  humidity: formData.get('humidity') ? Number(formData.get('humidity')) : undefined,
                  description: formData.get('description') as string,
                };
                createLocationMutation.mutate(data);
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                      <select name="zone" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select zone">
                        <option value="">Select Zone</option>
                        <option value="A">Zone A</option>
                        <option value="B">Zone B</option>
                        <option value="C">Zone C</option>
                        <option value="D">Zone D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aisle</label>
                      <input name="aisle" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter aisle number" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                      <input name="shelf" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter shelf number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input name="position" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter position number" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                    <input name="name" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., A1-01-01" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input name="capacity" type="number" required min="1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter capacity" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                      <input name="temperature" type="number" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter temperature" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                      <input name="humidity" type="number" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter humidity" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={3} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter description" />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddLocation(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLocationMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 shadow-md"
                  >
                    {createLocationMutation.isPending ? 'Creating...' : 'Create Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Batch Modal */}
        {showAddBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Inventory Batch</h3>
                <button
                  onClick={() => setShowAddBatch(false)}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  batchNumber: formData.get('batchNumber') as string,
                  itemId: formData.get('itemId') as string,
                  itemName: formData.get('itemName') as string,
                  quantity: Number(formData.get('quantity')),
                  unit: formData.get('unit') as string,
                  supplier: formData.get('supplier') as string,
                  purchaseDate: formData.get('purchaseDate') as string,
                  expirationDate: formData.get('expirationDate') as string,
                  locationId: formData.get('locationId') as string,
                  costPerUnit: Number(formData.get('costPerUnit')),
                  notes: formData.get('notes') as string,
                };
                createBatchMutation.mutate(data);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input name="batchNumber" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter batch number" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input name="itemName" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter item name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                    <input name="itemId" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter item ID" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input name="quantity" type="number" required min="1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter quantity" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select name="unit" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select unit">
                        <option value="">Select Unit</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="lb">Pounds</option>
                        <option value="oz">Ounces</option>
                        <option value="l">Liters</option>
                        <option value="ml">Milliliters</option>
                        <option value="pieces">Pieces</option>
                        <option value="packets">Packets</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input name="supplier" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter supplier name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select name="locationId" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select location">
                      <option value="">Select Location</option>
                      {locationsData?.locations?.map((loc: WarehouseLocation) => (
                        <option key={loc.id} value={loc.id}>{loc.name} - {loc.zone}{loc.aisle}-{loc.shelf}-{loc.position}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input name="purchaseDate" type="date" className="w-full p-2 border border-gray-300 rounded-md" title="Select purchase date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input name="expirationDate" type="date" className="w-full p-2 border border-gray-300 rounded-md" title="Select expiration date" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit ($)</label>
                    <input name="costPerUnit" type="number" step="0.01" required min="0" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter cost per unit" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea name="notes" rows={3} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter notes" />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddBatch(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBatchMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 shadow-md"
                  >
                    {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Location Modal */}
        {editingLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Warehouse Location</h3>
                <button
                  onClick={() => setEditingLocation(null)}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  name: formData.get('name') as string,
                  zone: formData.get('zone') as string,
                  aisle: formData.get('aisle') as string,
                  shelf: formData.get('shelf') as string,
                  position: formData.get('position') as string,
                  capacity: Number(formData.get('capacity')),
                  temperature: formData.get('temperature') ? Number(formData.get('temperature')) : undefined,
                  humidity: formData.get('humidity') ? Number(formData.get('humidity')) : undefined,
                  description: formData.get('description') as string,
                };
                updateLocationMutation.mutate({ id: editingLocation.id, data });
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                      <select name="zone" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select zone" defaultValue={editingLocation.zone}>
                        <option value="">Select Zone</option>
                        <option value="A">Zone A</option>
                        <option value="B">Zone B</option>
                        <option value="C">Zone C</option>
                        <option value="D">Zone D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aisle</label>
                      <input name="aisle" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter aisle number" defaultValue={editingLocation.aisle} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                      <input name="shelf" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter shelf number" defaultValue={editingLocation.shelf} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input name="position" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter position number" defaultValue={editingLocation.position} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                    <input name="name" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., A1-01-01" defaultValue={editingLocation.name} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input name="capacity" type="number" required min="1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter capacity" defaultValue={editingLocation.capacity} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                      <input name="temperature" type="number" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter temperature" defaultValue={editingLocation.temperature || ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                      <input name="humidity" type="number" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter humidity" defaultValue={editingLocation.humidity || ''} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={3} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter description" defaultValue={editingLocation.description || ''} />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingLocation(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLocationMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 shadow-md"
                  >
                    {updateLocationMutation.isPending ? 'Updating...' : 'Update Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Batch Modal */}
        {editingBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Inventory Batch</h3>
                <button
                  onClick={() => setEditingBatch(null)}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  batchNumber: formData.get('batchNumber') as string,
                  itemId: formData.get('itemId') as string,
                  itemName: formData.get('itemName') as string,
                  quantity: Number(formData.get('quantity')),
                  unit: formData.get('unit') as string,
                  supplier: formData.get('supplier') as string,
                  purchaseDate: formData.get('purchaseDate') as string,
                  expirationDate: formData.get('expirationDate') as string,
                  locationId: formData.get('locationId') as string,
                  costPerUnit: Number(formData.get('costPerUnit')),
                  notes: formData.get('notes') as string,
                };
                updateBatchMutation.mutate({ id: editingBatch.id, data });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input name="batchNumber" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter batch number" defaultValue={editingBatch.batchNumber} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input name="itemName" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter item name" defaultValue={editingBatch.itemName} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                    <input name="itemId" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter item ID" defaultValue={editingBatch.itemId} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input name="quantity" type="number" required min="1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter quantity" defaultValue={editingBatch.quantity} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select name="unit" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select unit" defaultValue={editingBatch.unit}>
                        <option value="">Select Unit</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="lb">Pounds</option>
                        <option value="oz">Ounces</option>
                        <option value="l">Liters</option>
                        <option value="ml">Milliliters</option>
                        <option value="pieces">Pieces</option>
                        <option value="packets">Packets</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input name="supplier" type="text" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter supplier name" defaultValue={editingBatch.supplier} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select name="locationId" required className="w-full p-2 border border-gray-300 rounded-md" aria-label="Select location" defaultValue={editingBatch.locationId}>
                      <option value="">Select Location</option>
                      {locationsData?.locations?.map((loc: WarehouseLocation) => (
                        <option key={loc.id} value={loc.id}>{loc.name} - {loc.zone}{loc.aisle}-{loc.shelf}-{loc.position}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input name="purchaseDate" type="date" className="w-full p-2 border border-gray-300 rounded-md" title="Select purchase date" defaultValue={editingBatch.purchaseDate ? editingBatch.purchaseDate.split('T')[0] : ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input name="expirationDate" type="date" className="w-full p-2 border border-gray-300 rounded-md" title="Select expiration date" defaultValue={editingBatch.expirationDate ? editingBatch.expirationDate.split('T')[0] : ''} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit ($)</label>
                    <input name="costPerUnit" type="number" step="0.01" required min="0" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter cost per unit" defaultValue={editingBatch.costPerUnit} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea name="notes" rows={3} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter notes" defaultValue={editingBatch.notes || ''} />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingBatch(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateBatchMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 shadow-md"
                  >
                    {updateBatchMutation.isPending ? 'Updating...' : 'Update Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedLocation.name ? 'Location Details' : 'Batch Details'}
                </h3>
                <button
                  onClick={() => setSelectedLocation(null)}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedLocation.name ? (
                  // Location details
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Zone</label>
                        <p className="text-gray-900">{selectedLocation.zone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Aisle</label>
                        <p className="text-gray-900">{selectedLocation.aisle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Shelf</label>
                        <p className="text-gray-900">{selectedLocation.shelf}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <p className="text-gray-900">{selectedLocation.position}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <p className="text-gray-900">{selectedLocation.capacity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                      <p className="text-gray-900">{selectedLocation.currentStock}</p>
                    </div>
                    {selectedLocation.temperature && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Temperature</label>
                        <p className="text-gray-900">{selectedLocation.temperature}°C</p>
                      </div>
                    )}
                    {selectedLocation.humidity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Humidity</label>
                        <p className="text-gray-900">{selectedLocation.humidity}%</p>
                      </div>
                    )}
                    {selectedLocation.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-gray-900">{selectedLocation.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Batch details
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                      <p className="text-gray-900">{selectedLocation.batchNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item Name</label>
                      <p className="text-gray-900">{selectedLocation.itemName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="text-gray-900">{selectedLocation.quantity} {selectedLocation.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Supplier</label>
                      <p className="text-gray-900">{selectedLocation.supplier}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedLocation.locationName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cost per Unit</label>
                      <p className="text-gray-900">${selectedLocation.costPerUnit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                      <p className="text-gray-900">${selectedLocation.totalCost}</p>
                    </div>
                    {selectedLocation.expirationDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                        <p className="text-gray-900">{new Date(selectedLocation.expirationDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedLocation.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="text-gray-900">{selectedLocation.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedLocation.name && (
                  <button
                    onClick={() => {
                      setEditingLocation(selectedLocation);
                      setSelectedLocation(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 shadow-md"
                  >
                    Edit Location
                  </button>
                )}
                {selectedLocation.batchNumber && (
                  <button
                    onClick={() => {
                      setEditingBatch(selectedLocation as any);
                      setSelectedLocation(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 shadow-md"
                  >
                    Edit Batch
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
