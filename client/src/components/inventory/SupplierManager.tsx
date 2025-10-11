import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Search,
  Eye,
  X,
  ExternalLink,
  Brain
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  isPreferred: boolean;
  tags: string[];
  createdAt: string;
}

interface PriceHistory {
  id: string;
  supplierId: string;
  productName: string;
  price: number;
  unit: string;
  date: string;
  orderQuantity?: number;
  notes?: string;
}

const SupplierManager: React.FC = () => {
  // Initialize suppliers from localStorage or use default data
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      return JSON.parse(savedSuppliers);
    }
    // Default suppliers for first time users
    const defaultSuppliers = [
      {
        id: 'sup-1',
        businessName: 'ABC Suppliers',
        contactPerson: 'John Smith',
        email: 'john@abcsuppliers.com',
        phone: '(555) 123-4567',
        website: 'https://abcsuppliers.com',
        address: '123 Supply St',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30301',
        notes: 'Our main supplier for dry goods',
        isPreferred: true,
        tags: ['bulk', 'dry-goods', 'reliable'],
        createdAt: '2024-01-15'
      },
      {
        id: 'sup-2',
        businessName: 'Dairy Direct',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@dairydirect.com',
        phone: '(555) 234-5678',
        website: 'https://dairydirect.com',
        address: '456 Farm Rd',
        city: 'Athens',
        state: 'GA',
        zipCode: '30601',
        notes: 'Excellent dairy products, weekly delivery',
        isPreferred: true,
        tags: ['dairy', 'fresh', 'weekly-delivery'],
        createdAt: '2024-01-20'
      },
      {
        id: 'sup-3',
        businessName: 'Chocolate Co',
        contactPerson: 'Mike Brown',
        email: 'mike@chocolateco.com',
        phone: '(555) 345-6789',
        website: 'https://chocolateco.com',
        address: '789 Cocoa Ave',
        city: 'Savannah',
        state: 'GA',
        zipCode: '31401',
        notes: 'Premium chocolate supplier',
        isPreferred: false,
        tags: ['chocolate', 'premium', 'specialty'],
        createdAt: '2024-02-01'
      }
    ];
    localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
    return defaultSuppliers;
  });

  const [priceHistory] = useState<PriceHistory[]>([
    // ABC Suppliers - Flour
    { id: 'ph-1', supplierId: 'sup-1', productName: 'All-Purpose Flour', price: 2.50, unit: 'kg', date: '2024-01-15', orderQuantity: 50 },
    { id: 'ph-2', supplierId: 'sup-1', productName: 'All-Purpose Flour', price: 2.45, unit: 'kg', date: '2024-02-20', orderQuantity: 50 },
    { id: 'ph-3', supplierId: 'sup-1', productName: 'All-Purpose Flour', price: 2.60, unit: 'kg', date: '2024-03-25', orderQuantity: 100 },
    { id: 'ph-4', supplierId: 'sup-1', productName: 'All-Purpose Flour', price: 2.55, unit: 'kg', date: '2024-04-30', orderQuantity: 75 },
    // ABC Suppliers - Sugar
    { id: 'ph-5', supplierId: 'sup-1', productName: 'Granulated Sugar', price: 1.80, unit: 'kg', date: '2024-01-15', orderQuantity: 40 },
    { id: 'ph-6', supplierId: 'sup-1', productName: 'Granulated Sugar', price: 1.85, unit: 'kg', date: '2024-03-10', orderQuantity: 60 },
    { id: 'ph-7', supplierId: 'sup-1', productName: 'Granulated Sugar', price: 1.90, unit: 'kg', date: '2024-04-20', orderQuantity: 50 },
    // Dairy Direct - Butter
    { id: 'ph-8', supplierId: 'sup-2', productName: 'Butter (Unsalted)', price: 4.50, unit: 'lb', date: '2024-01-20', orderQuantity: 20 },
    { id: 'ph-9', supplierId: 'sup-2', productName: 'Butter (Unsalted)', price: 4.60, unit: 'lb', date: '2024-02-25', orderQuantity: 25 },
    { id: 'ph-10', supplierId: 'sup-2', productName: 'Butter (Unsalted)', price: 4.75, unit: 'lb', date: '2024-03-30', orderQuantity: 30 },
    { id: 'ph-11', supplierId: 'sup-2', productName: 'Butter (Unsalted)', price: 4.80, unit: 'lb', date: '2024-04-28', orderQuantity: 25 },
    // Chocolate Co - Chocolate Chips
    { id: 'ph-12', supplierId: 'sup-3', productName: 'Chocolate Chips', price: 8.50, unit: 'kg', date: '2024-02-01', orderQuantity: 10 },
    { id: 'ph-13', supplierId: 'sup-3', productName: 'Chocolate Chips', price: 8.75, unit: 'kg', date: '2024-03-15', orderQuantity: 15 },
    { id: 'ph-14', supplierId: 'sup-3', productName: 'Chocolate Chips', price: 8.60, unit: 'kg', date: '2024-04-22', orderQuantity: 12 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    isPreferred: false,
    tags: []
  });

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Listen for new suppliers added from wizard
  useEffect(() => {
    const handleSupplierAdded = (event: CustomEvent) => {
      const newSupplier = event.detail;
      setSuppliers(prev => [...prev, newSupplier]);
    };

    window.addEventListener('supplierAdded', handleSupplierAdded as EventListener);
    return () => {
      window.removeEventListener('supplierAdded', handleSupplierAdded as EventListener);
    };
  }, []);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    return suppliers.filter(supplier =>
      supplier.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);

  // Get price trends for a supplier
  const getSupplierTrends = (supplierId: string) => {
    const supplierPrices = priceHistory.filter(ph => ph.supplierId === supplierId);
    
    // Group by product
    const byProduct = new Map<string, PriceHistory[]>();
    supplierPrices.forEach(ph => {
      if (!byProduct.has(ph.productName)) {
        byProduct.set(ph.productName, []);
      }
      byProduct.get(ph.productName)!.push(ph);
    });

    const trends = [];
    byProduct.forEach((prices, productName) => {
      if (prices.length >= 2) {
        const sorted = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstPrice = sorted[0].price;
        const lastPrice = sorted[sorted.length - 1].price;
        const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
        
        trends.push({
          productName,
          firstPrice,
          lastPrice,
          percentChange,
          trend: percentChange > 5 ? 'increasing' : percentChange < -5 ? 'decreasing' : 'stable',
          priceCount: prices.length
        });
      }
    });

    return trends;
  };

  // Handle add supplier
  const handleAddSupplier = () => {
    if (!newSupplier.businessName || !newSupplier.email) {
      toast.error('Please fill in business name and email');
      return;
    }

    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      businessName: newSupplier.businessName,
      contactPerson: newSupplier.contactPerson || '',
      email: newSupplier.email,
      phone: newSupplier.phone || '',
      website: newSupplier.website || '',
      address: newSupplier.address || '',
      city: newSupplier.city || '',
      state: newSupplier.state || '',
      zipCode: newSupplier.zipCode || '',
      notes: newSupplier.notes || '',
      isPreferred: newSupplier.isPreferred || false,
      tags: newSupplier.tags || [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSuppliers(prev => [...prev, supplier]);
    setShowAddModal(false);
    setNewSupplier({
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      isPreferred: false,
      tags: []
    });
    toast.success(`Added supplier: ${supplier.businessName}`);
  };

  // Handle delete supplier
  const handleDeleteSupplier = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to delete ${supplier?.businessName}?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success('Supplier deleted');
    }
  };

  // Handle AI price check
  const handleAIPriceCheck = (supplier: Supplier) => {
    toast.success(`🤖 AI Price Check initiated for ${supplier.businessName}. This feature will scrape their website and compare prices. Coming soon!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            Supplier Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your suppliers, track pricing trends, and use AI to find the best deals
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-purple-600">{suppliers.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preferred</p>
              <p className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.isPreferred).length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Price Records</p>
              <p className="text-2xl font-bold text-blue-600">{priceHistory.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products Tracked</p>
              <p className="text-2xl font-bold text-amber-600">
                {new Set(priceHistory.map(ph => ph.productName)).size}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 bg-[#F7F2EC]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, email, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => {
          const trends = getSupplierTrends(supplier.id);
          const increasingTrends = trends.filter(t => t.trend === 'increasing').length;
          const decreasingTrends = trends.filter(t => t.trend === 'decreasing').length;

          return (
            <Card key={supplier.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {supplier.businessName}
                    {supplier.isPreferred && <span className="text-yellow-500">⭐</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setViewingSupplier(supplier);
                      setShowViewModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setShowEditModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-900"
                    title="Edit supplier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete supplier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-purple-600">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-purple-600">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 flex items-center gap-1"
                    >
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.city}, {supplier.state}</span>
                  </div>
                )}
              </div>

              {/* Price Trends */}
              {trends.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Price Trends ({trends.length} products)</p>
                  <div className="flex gap-4 text-xs">
                    {increasingTrends > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{increasingTrends} increasing</span>
                      </div>
                    )}
                    {decreasingTrends > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>{decreasingTrends} decreasing</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {supplier.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {supplier.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Price Check Button */}
              <Button
                onClick={() => handleAIPriceCheck(supplier)}
                variant="secondary"
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                <Brain className="h-4 w-4" />
                AI Price Check
              </Button>
            </Card>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search' : 'Add your first supplier to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddModal(true)} className="mx-auto">
              Add Supplier
            </Button>
          )}
        </Card>
      )}

      {/* Add/Edit Supplier Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {showAddModal ? 'Add New Supplier' : 'Edit Supplier'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.businessName : editingSupplier?.businessName}
                    onChange={(e) => showAddModal 
                      ? setNewSupplier(prev => ({ ...prev, businessName: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, businessName: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., ABC Suppliers Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.contactPerson : editingSupplier?.contactPerson}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, contactPerson: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={showAddModal ? newSupplier.email : editingSupplier?.email}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, email: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, email: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="contact@supplier.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={showAddModal ? newSupplier.phone : editingSupplier?.phone}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, phone: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, phone: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={showAddModal ? newSupplier.website : editingSupplier?.website}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, website: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, website: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://supplier.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.address : editingSupplier?.address}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, address: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, address: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.city : editingSupplier?.city}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, city: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, city: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Atlanta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.state : editingSupplier?.state}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, state: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, state: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="GA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newSupplier.zipCode : editingSupplier?.zipCode}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, zipCode: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, zipCode: e.target.value } : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="30301"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={showAddModal ? newSupplier.notes : editingSupplier?.notes}
                    onChange={(e) => showAddModal
                      ? setNewSupplier(prev => ({ ...prev, notes: e.target.value }))
                      : setEditingSupplier(prev => prev ? { ...prev, notes: e.target.value } : null)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional information about this supplier..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showAddModal ? newSupplier.isPreferred : editingSupplier?.isPreferred}
                      onChange={(e) => showAddModal
                        ? setNewSupplier(prev => ({ ...prev, isPreferred: e.target.checked }))
                        : setEditingSupplier(prev => prev ? { ...prev, isPreferred: e.target.checked } : null)
                      }
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Preferred Supplier</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingSupplier(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSupplier}>
                {showAddModal ? 'Add Supplier' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Detail Modal */}
      {showViewModal && viewingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  {viewingSupplier.businessName}
                  {viewingSupplier.isPreferred && <span className="text-yellow-500">⭐</span>}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{viewingSupplier.contactPerson || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${viewingSupplier.email}`} className="text-sm text-purple-600 hover:text-purple-900">
                      {viewingSupplier.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${viewingSupplier.phone}`} className="text-sm text-purple-600 hover:text-purple-900">
                      {viewingSupplier.phone || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {viewingSupplier.website ? (
                      <a 
                        href={viewingSupplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-900 flex items-center gap-1"
                      >
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-700">N/A</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {viewingSupplier.address ? `${viewingSupplier.address}, ${viewingSupplier.city}, ${viewingSupplier.state} ${viewingSupplier.zipCode}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Price History & Trends</h4>
                {priceHistory.filter(ph => ph.supplierId === viewingSupplier.id).length > 0 ? (
                  <div className="space-y-4">
                    {getSupplierTrends(viewingSupplier.id).map((trend, index) => (
                      <Card key={index} className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{trend.productName}</h5>
                          <div className="flex items-center gap-2">
                            {trend.trend === 'increasing' ? (
                              <TrendingUp className="h-4 w-4 text-red-600" />
                            ) : trend.trend === 'decreasing' ? (
                              <TrendingDown className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 text-gray-600">→</div>
                            )}
                            <span className={`text-sm font-semibold ${
                              trend.trend === 'increasing' ? 'text-red-600' :
                              trend.trend === 'decreasing' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {trend.percentChange > 0 ? '+' : ''}{trend.percentChange.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>First: ${trend.firstPrice.toFixed(2)}</span>
                          <span>→</span>
                          <span>Latest: ${trend.lastPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">({trend.priceCount} records)</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No price history available</p>
                )}
              </div>

              {/* Notes */}
              {viewingSupplier.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{viewingSupplier.notes}</p>
                </div>
              )}

              {/* Tags */}
              {viewingSupplier.tags && viewingSupplier.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingSupplier.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingSupplier(null);
                }}
              >
                Close
              </Button>
              <Button onClick={() => handleAIPriceCheck(viewingSupplier)} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Price Check
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;

