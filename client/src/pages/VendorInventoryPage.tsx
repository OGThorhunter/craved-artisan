import React, { useState, useMemo } from 'react';
import { Database } from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '../data/motivationalQuotes';
import InventoryOverviewCards from '../components/inventory/InventoryOverviewCards';
import InventorySearchAndFilters from '../components/inventory/InventorySearchAndFilters';
import InventoryItemsGrid from '../components/inventory/InventoryItemsGrid';
import InventoryItemsList from '../components/inventory/InventoryItemsList';
import InventoryModals from '../components/inventory/InventoryModals';
import { 
  useInventoryItems, 
  useCreateInventoryItem, 
  useUpdateInventoryItem, 
  useDeleteInventoryItem
} from '../hooks/useInventory';
import type { 
  InventoryItem,
  CreateInventoryItemData,
  UpdateInventoryItemData
} from '../hooks/useInventory';

const VendorInventoryPage: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Data fetching
  const { data: inventoryItems = [], isLoading, error } = useInventoryItems();
  
  // Mutations
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  // Filter and search items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  // Handlers
  const handleAddNew = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleView = (item: InventoryItem) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSave = async (data: CreateInventoryItemData | UpdateInventoryItemData) => {
    try {
      if ('id' in data) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModals();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="space-y-6">
          <DashboardHeader
            title="Inventory Management"
            description="Currently viewing: Inventory"
            currentView="Inventory"
            icon={Database}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          
          <MotivationalQuote
            quote={getQuoteByCategory('growth').quote}
            author={getQuoteByCategory('growth').author}
            icon={getQuoteByCategory('growth').icon}
            variant={getQuoteByCategory('growth').variant}
          />
          
          <InventoryOverviewCards items={[]} isLoading={true} />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <InventoryItemsGrid
              items={[]}
              isLoading={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <InventoryItemsList
              items={[]}
              isLoading={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </VendorDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="space-y-6">
          <DashboardHeader
            title="Inventory Management"
            description="Currently viewing: Inventory"
            currentView="Inventory"
            icon={Database}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Inventory</h3>
            <p className="text-red-600 mb-4">
              There was a problem loading your inventory data. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Inventory Management"
          description="Currently viewing: Inventory"
          currentView="Inventory"
          icon={Database}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        {/* Motivational Quote */}
        <MotivationalQuote
          quote={getQuoteByCategory('growth').quote}
          author={getQuoteByCategory('growth').author}
          icon={getQuoteByCategory('growth').icon}
          variant={getQuoteByCategory('growth').variant}
        />

        {/* Overview Cards */}
        <InventoryOverviewCards items={inventoryItems} />

        {/* Search and Filters */}
        <InventorySearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onAddNew={handleAddNew}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
        />

        {/* Items Display */}
        {viewMode === 'grid' ? (
          <InventoryItemsGrid
            items={filteredItems}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId || undefined}
          />
        ) : (
          <InventoryItemsList
            items={filteredItems}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId || undefined}
          />
        )}

        {/* Modals */}
        <InventoryModals
          showAddModal={showAddModal}
          showEditModal={showEditModal}
          showViewModal={showViewModal}
          editingItem={editingItem}
          viewingItem={viewingItem}
          onClose={handleCloseModals}
          onSave={handleSave}
          onEdit={handleEdit}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorInventoryPage;
