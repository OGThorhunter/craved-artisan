import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
  Settings,
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
  const queryClient = useQueryClient();

  // Fetch warehouse locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['warehouse-locations', filterZone],
    queryFn: async () => {
      const response = await axios.get('/api/advanced-inventory/warehouse/locations', {
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
      const response = await axios.get('/api/advanced-inventory/batches');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch expiration alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['expiration-alerts'],
    queryFn: async () => {
      const response = await axios.get('/api/advanced-inventory/expiration-alerts');
      return response.data;
    },
    enabled: isOpen && activeTab === 'alerts',
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['warehouse-analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/advanced-inventory/analytics');
      return response.data;
    },
    enabled: isOpen && activeTab === 'analytics',
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await axios.post(`/api/advanced-inventory/expiration-alerts/${alertId}/acknowledge`);
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

  // Filter locations based on search
  const filteredLocations = locationsData?.locations?.filter((location: WarehouseLocation) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Warehouse className="w-6 h-6 text-blue-600" />
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
              { id: 'batches', label: 'Batch Tracking', icon: Package },
              { id: 'alerts', label: 'Expiration Alerts', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
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
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddLocation(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
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
                          className="bg-blue-600 h-2 rounded-full"
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

          {/* Batch Tracking Tab */}
          {activeTab === 'batches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Batch Tracking</h3>
                <button
                  onClick={() => setShowAddBatch(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Batch
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                    <tbody className="bg-white divide-y divide-gray-200">
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
                                className="text-blue-600 hover:text-blue-900"
                                title="View batch details"
                                aria-label="View batch details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
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
          {activeTab === 'analytics' && analyticsData && (
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
              <div className="bg-white border border-gray-200 rounded-lg p-6">
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
              <div className="bg-white border border-gray-200 rounded-lg p-6">
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
      </div>
    </div>
  );
}
