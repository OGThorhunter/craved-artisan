import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Edit2, 
  FileDown,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Brain,
  Sparkles,
  DollarSign,
  Package,
  Building2,
  Eye,
  X,
  Search
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

interface InventoryItemLocal {
  id: string;
  name: string;
  category: string;
  current_qty: number;
  reorder_point: number;
  top_up_level: number;
  capacity_max: number;
  unit: string;
  avg_cost: number;
  preferred_vendor?: string;
  last_order_date?: string;
}

interface VendorPrice {
  vendorId: string;
  vendorName: string;
  price: number;
  unit: string;
  minOrderQty?: number;
  leadTimeDays?: number;
  isPreferred?: boolean;
}

interface ShoppingListItem {
  id: string;
  inventoryItemId?: string;
  name: string;
  category: string;
  quantityNeeded: number;
  unit: string;
  estimatedCost: number;
  vendorPrices: VendorPrice[];
  selectedVendorId?: string;
  isLowStock: boolean;
  notes?: string;
}

interface ShoppingListManagerProps {
  inventoryItems?: any[];
}

// Mock inventory items with low stock - Enhanced with more realistic data
const mockInventoryItems: InventoryItemLocal[] = [
  { id: 'inv-1', name: 'All-Purpose Flour', category: 'FOOD_GRADE', current_qty: 5, reorder_point: 20, top_up_level: 50, capacity_max: 100, unit: 'kg', avg_cost: 2.50, preferred_vendor: 'ABC Suppliers', last_order_date: '2024-09-15' },
  { id: 'inv-2', name: 'Granulated Sugar', category: 'FOOD_GRADE', current_qty: 3, reorder_point: 15, top_up_level: 40, capacity_max: 80, unit: 'kg', avg_cost: 1.80, preferred_vendor: 'ABC Suppliers', last_order_date: '2024-09-20' },
  { id: 'inv-3', name: 'Butter (Unsalted)', category: 'FOOD_GRADE', current_qty: 2, reorder_point: 10, top_up_level: 30, capacity_max: 50, unit: 'lb', avg_cost: 4.50, preferred_vendor: 'Dairy Direct', last_order_date: '2024-09-25' },
  { id: 'inv-4', name: 'Vanilla Extract', category: 'FOOD_GRADE', current_qty: 1, reorder_point: 5, top_up_level: 12, capacity_max: 24, unit: 'bottles', avg_cost: 12.00, preferred_vendor: 'Flavor House', last_order_date: '2024-08-10' },
  { id: 'inv-5', name: 'Active Dry Yeast', category: 'FOOD_GRADE', current_qty: 8, reorder_point: 6, top_up_level: 20, capacity_max: 40, unit: 'packets', avg_cost: 0.75, preferred_vendor: 'ABC Suppliers', last_order_date: '2024-10-01' },
  { id: 'inv-6', name: 'Chocolate Chips', category: 'FOOD_GRADE', current_qty: 1, reorder_point: 8, top_up_level: 25, capacity_max: 50, unit: 'kg', avg_cost: 8.50, preferred_vendor: 'Chocolate Co', last_order_date: '2024-09-05' },
  { id: 'inv-7', name: 'Bread Flour (High Protein)', category: 'FOOD_GRADE', current_qty: 4, reorder_point: 15, top_up_level: 35, capacity_max: 75, unit: 'kg', avg_cost: 3.20, preferred_vendor: 'Local Mill Co', last_order_date: '2024-09-18' },
  { id: 'inv-8', name: 'Brown Sugar (Dark)', category: 'FOOD_GRADE', current_qty: 2, reorder_point: 8, top_up_level: 20, capacity_max: 40, unit: 'kg', avg_cost: 2.10, preferred_vendor: 'Sweet Supply Co', last_order_date: '2024-09-12' },
  { id: 'inv-9', name: 'Eggs (Large)', category: 'FOOD_GRADE', current_qty: 0, reorder_point: 12, top_up_level: 30, capacity_max: 60, unit: 'dozen', avg_cost: 3.50, preferred_vendor: 'Farm Fresh Dairy', last_order_date: '2024-10-05' },
  { id: 'inv-10', name: 'Olive Oil (Extra Virgin)', category: 'FOOD_GRADE', current_qty: 1, reorder_point: 6, top_up_level: 15, capacity_max: 30, unit: 'bottles', avg_cost: 15.00, preferred_vendor: 'Mediterranean Imports', last_order_date: '2024-08-28' },
  { id: 'inv-11', name: 'Sea Salt (Fine)', category: 'FOOD_GRADE', current_qty: 3, reorder_point: 5, top_up_level: 12, capacity_max: 25, unit: 'kg', avg_cost: 4.80, preferred_vendor: 'Salt Works', last_order_date: '2024-09-22' },
  { id: 'inv-12', name: 'Cinnamon (Ground)', category: 'FOOD_GRADE', current_qty: 0, reorder_point: 3, top_up_level: 8, capacity_max: 15, unit: 'kg', avg_cost: 18.50, preferred_vendor: 'Spice House', last_order_date: '2024-09-30' },
  { id: 'inv-13', name: 'Honey (Raw)', category: 'FOOD_GRADE', current_qty: 2, reorder_point: 8, top_up_level: 20, capacity_max: 40, unit: 'kg', avg_cost: 12.00, preferred_vendor: 'Local Apiary', last_order_date: '2024-09-08' },
  { id: 'inv-14', name: 'Baking Powder', category: 'FOOD_GRADE', current_qty: 1, reorder_point: 4, top_up_level: 10, capacity_max: 20, unit: 'kg', avg_cost: 6.50, preferred_vendor: 'ABC Suppliers', last_order_date: '2024-08-15' },
  { id: 'inv-15', name: 'Milk (Whole)', category: 'FOOD_GRADE', current_qty: 0, reorder_point: 8, top_up_level: 20, capacity_max: 40, unit: 'gallons', avg_cost: 4.20, preferred_vendor: 'Dairy Direct', last_order_date: '2024-10-03' },
  { id: 'inv-16', name: 'Starter Culture (Sourdough)', category: 'FOOD_GRADE', current_qty: 2, reorder_point: 3, top_up_level: 8, capacity_max: 15, unit: 'packets', avg_cost: 25.00, preferred_vendor: 'Artisan Cultures', last_order_date: '2024-09-14' },
  { id: 'inv-17', name: 'Parchment Paper', category: 'PACKAGING', current_qty: 1, reorder_point: 5, top_up_level: 15, capacity_max: 30, unit: 'rolls', avg_cost: 8.00, preferred_vendor: 'Packaging Plus', last_order_date: '2024-08-20' },
  { id: 'inv-18', name: 'Bread Bags (Paper)', category: 'PACKAGING', current_qty: 0, reorder_point: 100, top_up_level: 300, capacity_max: 500, unit: 'bags', avg_cost: 0.25, preferred_vendor: 'Eco Packaging', last_order_date: '2024-09-25' },
  { id: 'inv-19', name: 'Labels (Custom)', category: 'PACKAGING', current_qty: 50, reorder_point: 200, top_up_level: 500, capacity_max: 1000, unit: 'labels', avg_cost: 0.15, preferred_vendor: 'Print Solutions', last_order_date: '2024-08-30' },
  { id: 'inv-20', name: 'Stand Mixer (KitchenAid)', category: 'EQUIPMENT', current_qty: 2, reorder_point: 1, top_up_level: 3, capacity_max: 5, unit: 'units', avg_cost: 350.00, preferred_vendor: 'Restaurant Supply', last_order_date: '2024-07-10' },
];

// Mock vendor pricing data - Enhanced with more vendors and items
const mockVendorPrices: Record<string, VendorPrice[]> = {
  'All-Purpose Flour': [
    { vendorId: 'v1', vendorName: 'ABC Suppliers', price: 2.50, unit: 'kg', minOrderQty: 10, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v2', vendorName: 'Bulk Foods Inc', price: 2.20, unit: 'kg', minOrderQty: 25, leadTimeDays: 5, isPreferred: false },
    { vendorId: 'v3', vendorName: 'Local Mill Co', price: 2.75, unit: 'kg', minOrderQty: 5, leadTimeDays: 2, isPreferred: false },
  ],
  'Granulated Sugar': [
    { vendorId: 'v1', vendorName: 'ABC Suppliers', price: 1.80, unit: 'kg', minOrderQty: 10, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v4', vendorName: 'Sweet Supply Co', price: 1.65, unit: 'kg', minOrderQty: 20, leadTimeDays: 7, isPreferred: false },
  ],
  'Butter (Unsalted)': [
    { vendorId: 'v5', vendorName: 'Dairy Direct', price: 4.50, unit: 'lb', minOrderQty: 10, leadTimeDays: 2, isPreferred: true },
    { vendorId: 'v6', vendorName: 'Farm Fresh Dairy', price: 4.25, unit: 'lb', minOrderQty: 20, leadTimeDays: 3, isPreferred: false },
  ],
  'Vanilla Extract': [
    { vendorId: 'v7', vendorName: 'Flavor House', price: 12.00, unit: 'bottles', minOrderQty: 6, leadTimeDays: 5, isPreferred: true },
    { vendorId: 'v8', vendorName: 'Extract Express', price: 10.50, unit: 'bottles', minOrderQty: 12, leadTimeDays: 7, isPreferred: false },
  ],
  'Chocolate Chips': [
    { vendorId: 'v9', vendorName: 'Chocolate Co', price: 8.50, unit: 'kg', minOrderQty: 5, leadTimeDays: 4, isPreferred: true },
    { vendorId: 'v10', vendorName: 'Bulk Chocolate', price: 7.80, unit: 'kg', minOrderQty: 15, leadTimeDays: 6, isPreferred: false },
  ],
  'Bread Flour (High Protein)': [
    { vendorId: 'v3', vendorName: 'Local Mill Co', price: 3.20, unit: 'kg', minOrderQty: 5, leadTimeDays: 2, isPreferred: true },
    { vendorId: 'v11', vendorName: 'Premium Grains', price: 2.95, unit: 'kg', minOrderQty: 15, leadTimeDays: 4, isPreferred: false },
    { vendorId: 'v2', vendorName: 'Bulk Foods Inc', price: 3.40, unit: 'kg', minOrderQty: 25, leadTimeDays: 5, isPreferred: false },
  ],
  'Brown Sugar (Dark)': [
    { vendorId: 'v4', vendorName: 'Sweet Supply Co', price: 2.10, unit: 'kg', minOrderQty: 10, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v1', vendorName: 'ABC Suppliers', price: 2.25, unit: 'kg', minOrderQty: 15, leadTimeDays: 3, isPreferred: false },
  ],
  'Eggs (Large)': [
    { vendorId: 'v6', vendorName: 'Farm Fresh Dairy', price: 3.50, unit: 'dozen', minOrderQty: 12, leadTimeDays: 1, isPreferred: true },
    { vendorId: 'v12', vendorName: 'Egg Central', price: 3.20, unit: 'dozen', minOrderQty: 24, leadTimeDays: 2, isPreferred: false },
  ],
  'Olive Oil (Extra Virgin)': [
    { vendorId: 'v13', vendorName: 'Mediterranean Imports', price: 15.00, unit: 'bottles', minOrderQty: 6, leadTimeDays: 7, isPreferred: true },
    { vendorId: 'v14', vendorName: 'Oil Masters', price: 13.50, unit: 'bottles', minOrderQty: 12, leadTimeDays: 5, isPreferred: false },
  ],
  'Sea Salt (Fine)': [
    { vendorId: 'v15', vendorName: 'Salt Works', price: 4.80, unit: 'kg', minOrderQty: 5, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v2', vendorName: 'Bulk Foods Inc', price: 4.50, unit: 'kg', minOrderQty: 15, leadTimeDays: 5, isPreferred: false },
  ],
  'Cinnamon (Ground)': [
    { vendorId: 'v16', vendorName: 'Spice House', price: 18.50, unit: 'kg', minOrderQty: 2, leadTimeDays: 10, isPreferred: true },
    { vendorId: 'v17', vendorName: 'Exotic Spices', price: 16.80, unit: 'kg', minOrderQty: 5, leadTimeDays: 14, isPreferred: false },
  ],
  'Honey (Raw)': [
    { vendorId: 'v18', vendorName: 'Local Apiary', price: 12.00, unit: 'kg', minOrderQty: 5, leadTimeDays: 1, isPreferred: true },
    { vendorId: 'v19', vendorName: 'Nature\'s Sweet', price: 10.50, unit: 'kg', minOrderQty: 10, leadTimeDays: 3, isPreferred: false },
  ],
  'Baking Powder': [
    { vendorId: 'v1', vendorName: 'ABC Suppliers', price: 6.50, unit: 'kg', minOrderQty: 5, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v20', vendorName: 'Baking Essentials', price: 6.00, unit: 'kg', minOrderQty: 10, leadTimeDays: 4, isPreferred: false },
  ],
  'Milk (Whole)': [
    { vendorId: 'v5', vendorName: 'Dairy Direct', price: 4.20, unit: 'gallons', minOrderQty: 8, leadTimeDays: 1, isPreferred: true },
    { vendorId: 'v6', vendorName: 'Farm Fresh Dairy', price: 4.00, unit: 'gallons', minOrderQty: 12, leadTimeDays: 1, isPreferred: false },
  ],
  'Starter Culture (Sourdough)': [
    { vendorId: 'v21', vendorName: 'Artisan Cultures', price: 25.00, unit: 'packets', minOrderQty: 3, leadTimeDays: 7, isPreferred: true },
    { vendorId: 'v22', vendorName: 'Bread Cultures Co', price: 22.50, unit: 'packets', minOrderQty: 5, leadTimeDays: 10, isPreferred: false },
  ],
  'Parchment Paper': [
    { vendorId: 'v23', vendorName: 'Packaging Plus', price: 8.00, unit: 'rolls', minOrderQty: 5, leadTimeDays: 2, isPreferred: true },
    { vendorId: 'v24', vendorName: 'Kitchen Supply', price: 7.50, unit: 'rolls', minOrderQty: 10, leadTimeDays: 3, isPreferred: false },
  ],
  'Bread Bags (Paper)': [
    { vendorId: 'v25', vendorName: 'Eco Packaging', price: 0.25, unit: 'bags', minOrderQty: 200, leadTimeDays: 3, isPreferred: true },
    { vendorId: 'v26', vendorName: 'Paper Products Inc', price: 0.22, unit: 'bags', minOrderQty: 500, leadTimeDays: 5, isPreferred: false },
  ],
  'Labels (Custom)': [
    { vendorId: 'v27', vendorName: 'Print Solutions', price: 0.15, unit: 'labels', minOrderQty: 500, leadTimeDays: 5, isPreferred: true },
    { vendorId: 'v28', vendorName: 'Label Masters', price: 0.12, unit: 'labels', minOrderQty: 1000, leadTimeDays: 7, isPreferred: false },
  ],
  'Stand Mixer (KitchenAid)': [
    { vendorId: 'v29', vendorName: 'Restaurant Supply', price: 350.00, unit: 'units', minOrderQty: 1, leadTimeDays: 14, isPreferred: true },
    { vendorId: 'v30', vendorName: 'Kitchen Equipment Co', price: 320.00, unit: 'units', minOrderQty: 2, leadTimeDays: 21, isPreferred: false },
  ],
};

const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({ 
  inventoryItems = mockInventoryItems 
}) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'FOOD_GRADE',
    quantityNeeded: 1,
    unit: 'kg',
    estimatedCost: 0,
    notes: ''
  });

  // Detect low stock items (items at or below reorder point)
  const lowStockItems = useMemo(() => {
    // Convert inventory items to local format if they exist
    const items = inventoryItems && inventoryItems.length > 0 
      ? inventoryItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          current_qty: item.current_qty || 0,
          reorder_point: item.reorder_point || 10,
          top_up_level: item.top_up_level || item.reorder_point * 2 || 20,
          capacity_max: item.capacity_max || item.reorder_point * 4 || 40,
          unit: item.unit,
          avg_cost: item.avg_cost || 0,
          preferred_vendor: item.preferred_vendor,
          last_order_date: item.last_order_date
        }))
      : mockInventoryItems;
    
    return items.filter((item: InventoryItemLocal) => item.current_qty <= item.reorder_point);
  }, [inventoryItems]);

  // Generate shopping list from low stock
  const generateFromLowStock = () => {
    const newItems: ShoppingListItem[] = lowStockItems.map(item => {
      // Calculate how much to BUY to reach the top-up level
      // Quantity to buy = top_up_level - current_qty
      const quantityToBuy = item.top_up_level - item.current_qty;
      
      // Ensure we don't exceed capacity max
      const maxPossiblePurchase = item.capacity_max - item.current_qty;
      const finalQuantity = Math.min(quantityToBuy, maxPossiblePurchase);
      
      const vendorPrices = mockVendorPrices[item.name] || [];
      const preferredVendor = vendorPrices.find(v => v.isPreferred);
      
      return {
        id: Date.now().toString() + Math.random(),
        inventoryItemId: item.id,
        name: item.name,
        category: item.category,
        quantityNeeded: Math.ceil(finalQuantity),
        unit: item.unit,
        estimatedCost: item.avg_cost * Math.ceil(finalQuantity),
        vendorPrices,
        selectedVendorId: preferredVendor?.vendorId,
        isLowStock: true,
        notes: `Current: ${item.current_qty}${item.unit} | Top-up: ${item.top_up_level}${item.unit} | Max: ${item.capacity_max}${item.unit}`
      };
    });
    
    setShoppingList(newItems);
    toast.success(`Generated shopping list with ${newItems.length} items. Total to purchase: ${newItems.reduce((sum, i) => sum + i.quantityNeeded, 0)} units`);
  };

  // AI Suggestions
  const aiSuggestions = useMemo(() => {
    if (!showAISuggestions || shoppingList.length === 0) return [];
    
    const suggestions = [];
    
    // Better pricing opportunities
    shoppingList.forEach(item => {
      if (item.vendorPrices.length > 1) {
        const currentVendor = item.vendorPrices.find(v => v.vendorId === item.selectedVendorId);
        const cheapestVendor = item.vendorPrices.reduce((prev, curr) => 
          prev.price < curr.price ? prev : curr
        );
        
        if (currentVendor && cheapestVendor.vendorId !== currentVendor.vendorId) {
          const savings = (currentVendor.price - cheapestVendor.price) * item.quantityNeeded;
          if (savings > 5) {
            suggestions.push({
              id: `sug-${item.id}`,
              type: 'cost-savings',
              title: `Save $${savings.toFixed(2)} on ${item.name}`,
              description: `Switch from ${currentVendor.vendorName} ($${currentVendor.price}) to ${cheapestVendor.vendorName} ($${cheapestVendor.price})`,
              itemId: item.id,
              action: () => {
                setShoppingList(prev => prev.map(i => 
                  i.id === item.id ? { ...i, selectedVendorId: cheapestVendor.vendorId, estimatedCost: cheapestVendor.price * i.quantityNeeded } : i
                ));
                toast.success(`Switched to ${cheapestVendor.vendorName} for ${item.name}`);
              }
            });
          }
        }
      }
    });
    
    // Consolidation opportunities
    const vendorGroups = new Map<string, ShoppingListItem[]>();
    shoppingList.forEach(item => {
      if (item.selectedVendorId) {
        if (!vendorGroups.has(item.selectedVendorId)) {
          vendorGroups.set(item.selectedVendorId, []);
        }
        vendorGroups.get(item.selectedVendorId)!.push(item);
      }
    });
    
    if (vendorGroups.size > 3) {
      suggestions.push({
        id: 'sug-consolidate',
        type: 'consolidation',
        title: 'Consider Vendor Consolidation',
        description: `You're ordering from ${vendorGroups.size} different vendors. Consolidating orders could reduce shipping costs.`,
        itemId: null,
        action: null
      });
    }
    
    return suggestions;
  }, [shoppingList, showAISuggestions]);

  // Add manual item
  const handleAddItem = () => {
    if (!newItem.name) {
      toast.error('Please enter an item name');
      return;
    }
    
    const item: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      quantityNeeded: newItem.quantityNeeded,
      unit: newItem.unit,
      estimatedCost: newItem.estimatedCost,
      vendorPrices: mockVendorPrices[newItem.name] || [],
      isLowStock: false,
      notes: newItem.notes
    };
    
    setShoppingList(prev => [...prev, item]);
    setNewItem({ name: '', category: 'FOOD_GRADE', quantityNeeded: 1, unit: 'kg', estimatedCost: 0, notes: '' });
    setShowAddItemModal(false);
    toast.success(`Added ${item.name} to shopping list`);
  };

  // Update item
  const handleUpdateItem = (item: ShoppingListItem) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? item : i));
    setEditingItem(null);
    toast.success(`Updated ${item.name}`);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    const item = shoppingList.find(i => i.id === id);
    setShoppingList(prev => prev.filter(i => i.id !== id));
    if (item) {
      toast.success(`Removed ${item.name} from shopping list`);
    }
  };

  // Change vendor for item
  const handleVendorChange = (itemId: string, vendorId: string) => {
    setShoppingList(prev => prev.map(item => {
      if (item.id === itemId) {
        const vendor = item.vendorPrices.find(v => v.vendorId === vendorId);
        return {
          ...item,
          selectedVendorId: vendorId,
          estimatedCost: vendor ? vendor.price * item.quantityNeeded : item.estimatedCost
        };
      }
      return item;
    }));
  };

  // Calculate totals
  const totals = useMemo(() => {
    const total = shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);
    const lowStockCount = shoppingList.filter(i => i.isLowStock).length;
    const vendorCount = new Set(shoppingList.map(i => i.selectedVendorId).filter(Boolean)).size;
    
    return { total, lowStockCount, vendorCount, itemCount: shoppingList.length };
  }, [shoppingList]);

  // Export to PDF
  const handleExportPDF = () => {
    console.log('PDF Export clicked, shopping list items:', shoppingList.length);
    
    try {
      if (shoppingList.length === 0) {
        toast.error('No items in shopping list to export');
        return;
      }

      console.log('Starting PDF generation...');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(91, 110, 2);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Shopping List', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 14, 32);
    
    // Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Total Items: ${totals.itemCount}`, pageWidth - 14, 18, { align: 'right' });
    doc.text(`Low Stock Items: ${totals.lowStockCount}`, pageWidth - 14, 24, { align: 'right' });
    doc.text(`Total Cost: $${totals.total.toFixed(2)}`, pageWidth - 14, 30, { align: 'right' });
    doc.text(`Vendors: ${totals.vendorCount}`, pageWidth - 14, 36, { align: 'right' });
    
    // Group by vendor
    const byVendor = new Map<string, ShoppingListItem[]>();
    shoppingList.forEach(item => {
      const vendorId = item.selectedVendorId || 'unassigned';
      const vendor = item.vendorPrices.find(v => v.vendorId === vendorId);
      const vendorName = vendor?.vendorName || 'Unassigned';
      
      if (!byVendor.has(vendorName)) {
        byVendor.set(vendorName, []);
      }
      byVendor.get(vendorName)!.push(item);
    });
    
    let currentY = 55;
    
    // Add items by vendor
    byVendor.forEach((items, vendorName) => {
      // Vendor header
      doc.setFillColor(247, 242, 236);
      doc.rect(14, currentY, pageWidth - 28, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(91, 110, 2);
      doc.text(`${vendorName}`, 16, currentY + 6);
      
      const vendorTotal = items.reduce((sum, i) => sum + i.estimatedCost, 0);
      doc.text(`$${vendorTotal.toFixed(2)}`, pageWidth - 16, currentY + 6, { align: 'right' });
      
      currentY += 12;
      
      // Items table
      const tableData = items.map(item => [
        item.name,
        `${item.quantityNeeded} ${item.unit}`,
        item.isLowStock ? '⚠️ Low' : '',
        `$${(item.estimatedCost / item.quantityNeeded).toFixed(2)}`,
        `$${item.estimatedCost.toFixed(2)}`,
        item.notes || ''
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Item', 'Quantity', 'Status', 'Unit Price', 'Total', 'Notes']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [91, 110, 2],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 45 }
        },
        margin: { left: 14, right: 14 }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentY = 20;
      }
    });
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'CravedArtisan - Shopping List',
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }
    
      console.log('Saving PDF...');
      doc.save(`shopping-list-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF saved successfully');
      toast.success('Shopping list exported to PDF!');
      setShowPreview(false);
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Filter shopping list
  const filteredList = useMemo(() => {
    if (!searchTerm) return shoppingList;
    
    return shoppingList.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shoppingList, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            Shopping List Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Calculates exact quantities to buy based on current stock and top-up levels, with smart vendor comparisons
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Insights
            {aiSuggestions.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {aiSuggestions.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && aiSuggestions.length > 0 && (
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map(suggestion => (
              <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex-shrink-0 mt-1">
                  {suggestion.type === 'cost-savings' ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                </div>
                {suggestion.action && (
                  <Button
                    onClick={suggestion.action}
                    className="flex-shrink-0 text-sm px-3 py-1"
                  >
                    Apply
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">List Items</p>
              <p className="text-2xl font-bold text-blue-600">{totals.itemCount}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendors</p>
              <p className="text-2xl font-bold text-purple-600">{totals.vendorCount}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Total</p>
              <p className="text-2xl font-bold text-green-600">${totals.total.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Info Card - How it works */}
      {lowStockItems.length > 0 && shoppingList.length === 0 && (
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Smart Shopping List</h3>
              <p className="text-sm text-blue-800">
                The shopping list calculates <strong>quantity to buy</strong> based on your inventory levels:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>• <strong>Current Stock:</strong> What you have now</li>
                <li>• <strong>Top-Up Level:</strong> Your target stock level (e.g., 250g minimum)</li>
                <li>• <strong>Quantity to Buy:</strong> Top-Up Level - Current Stock</li>
                <li>• <strong>Capacity Max:</strong> Maximum storage capacity (won't exceed)</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2 italic">
                Example: If you have 5kg flour, top-up is 50kg, you'll see "Buy 45kg" in the shopping list.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Bar */}
      <Card className="p-4 bg-[#F7F2EC]">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={generateFromLowStock}
            className="flex items-center gap-2"
            disabled={lowStockItems.length === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Generate from Low Stock ({lowStockItems.length})
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item Manually
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
            disabled={shoppingList.length === 0}
          >
            <Eye className="h-4 w-4" />
            Preview & Export
          </Button>
          
          <div className="flex-1" />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Shopping List */}
      {filteredList.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in shopping list</h3>
          <p className="text-gray-600 mb-6">
            {lowStockItems.length > 0 
              ? `You have ${lowStockItems.length} low stock items. Generate a list to get started.`
              : 'Add items manually or wait for inventory to reach reorder points.'
            }
          </p>
          {lowStockItems.length > 0 && (
            <Button onClick={generateFromLowStock} className="flex items-center gap-2 mx-auto">
              <ShoppingCart className="h-4 w-4" />
              Generate from Low Stock
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty to Buy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredList.map((item) => {
                  const selectedVendor = item.vendorPrices.find(v => v.vendorId === item.selectedVendorId);
                  const hasAlternatives = item.vendorPrices.length > 1;
                  const cheapestVendor = item.vendorPrices.reduce((prev, curr) => 
                    prev.price < curr.price ? prev : curr, item.vendorPrices[0]
                  );
                  const isCheapest = selectedVendor?.vendorId === cheapestVendor?.vendorId;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.name}
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantityNeeded} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={item.selectedVendorId || ''}
                          onChange={(e) => handleVendorChange(item.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                          title="Select vendor"
                        >
                          <option value="">-- Select --</option>
                          {item.vendorPrices.map(vendor => (
                            <option key={vendor.vendorId} value={vendor.vendorId}>
                              {vendor.vendorName} {vendor.isPreferred ? '⭐' : ''}
                              {vendor.vendorId === cheapestVendor?.vendorId && !vendor.isPreferred ? ' 💰' : ''}
                            </option>
                          ))}
                        </select>
                        {selectedVendor && (
                          <p className="text-xs text-gray-500 mt-1">
                            Lead: {selectedVendor.leadTimeDays || '?'} days
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {selectedVendor ? `$${selectedVendor.price.toFixed(2)}` : '-'}
                        {hasAlternatives && !isCheapest && (
                          <p className="text-xs text-amber-600">
                            💰 Save ${((selectedVendor?.price || 0) - cheapestVendor.price).toFixed(2)}/unit
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ${item.estimatedCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Item to Shopping List</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., All-Purpose Flour"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.quantityNeeded}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantityNeeded: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="kg, lb, units"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (Total)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.estimatedCost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special instructions, preferences, etc."
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddItemModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Shopping List Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., All-Purpose Flour"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.quantityNeeded}
                    onChange={(e) => setEditingItem({ ...editingItem, quantityNeeded: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="kg, lb, units"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special instructions, preferences, etc."
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleUpdateItem(editingItem)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Export Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Shopping List Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close preview"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">Total Items</p>
                  <p className="text-xl font-bold text-blue-900">{totals.itemCount}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-700 mb-1">Vendors</p>
                  <p className="text-xl font-bold text-purple-900">{totals.vendorCount}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-700 mb-1">Low Stock</p>
                  <p className="text-xl font-bold text-red-900">{totals.lowStockCount}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700 mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-green-900">${totals.total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Items by Vendor */}
              {Array.from(new Set(shoppingList.map(i => i.selectedVendorId).filter(Boolean))).map(vendorId => {
                const items = shoppingList.filter(i => i.selectedVendorId === vendorId);
                const vendor = items[0]?.vendorPrices.find(v => v.vendorId === vendorId);
                const vendorTotal = items.reduce((sum, i) => sum + i.estimatedCost, 0);
                
                return (
                  <div key={vendorId} className="mb-6">
                    <div className="bg-[#F7F2EC] p-3 rounded-t-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-gray-700" />
                          <h4 className="font-semibold text-gray-900">{vendor?.vendorName || 'Unknown Vendor'}</h4>
                          {vendor?.isPreferred && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⭐ Preferred</span>
                          )}
                        </div>
                        <p className="font-bold text-gray-900">${vendorTotal.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map(item => {
                            const v = item.vendorPrices.find(vp => vp.vendorId === item.selectedVendorId);
                            return (
                              <tr key={item.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.name}
                                  {item.isLowStock && <span className="ml-2 text-red-600">⚠️</span>}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">{item.quantityNeeded} {item.unit}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">${v?.price.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">${item.estimatedCost.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              
              {/* Unassigned items */}
              {shoppingList.filter(i => !i.selectedVendorId).length > 0 && (
                <div className="mb-6">
                  <div className="bg-amber-50 p-3 rounded-t-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-700" />
                      <h4 className="font-semibold text-amber-900">Unassigned Items</h4>
                    </div>
                  </div>
                  <div className="border border-t-0 border-amber-200 rounded-b-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-amber-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-amber-700">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-amber-700">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-amber-700">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-amber-200">
                        {shoppingList.filter(i => !i.selectedVendorId).map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.quantityNeeded} {item.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">${item.estimatedCost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <div className="text-left">
                <p className="text-sm text-gray-600">Total items: {totals.itemCount}</p>
                <p className="text-lg font-bold text-gray-900">Total: ${totals.total.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    console.log('Export button clicked!');
                    handleExportPDF();
                  }}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Export to PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListManager;

