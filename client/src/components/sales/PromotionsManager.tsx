import React, { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Calendar, Tag, Percent, Users, DollarSign } from 'lucide-react';

interface Promotion {
  id: string;
  eventId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'early_bird' | 'group_discount';
  value: number;
  code?: string;
  startsAt: string;
  endsAt: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  minOrderAmount?: number;
  applicableVendorTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PromotionsManagerProps {
  promotions: Promotion[];
  onCreatePromotion: (promotionData: any) => void;
  onUpdatePromotion: (promotionId: string, updates: any) => void;
  onDeletePromotion: (promotionId: string) => void;
  onTogglePromotion: (promotionId: string) => void;
}

export function PromotionsManager({
  promotions,
  onCreatePromotion,
  onUpdatePromotion,
  onDeletePromotion,
  onTogglePromotion
}: PromotionsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed_amount': return <DollarSign className="w-4 h-4" />;
      case 'early_bird': return <Calendar className="w-4 h-4" />;
      case 'group_discount': return <Users className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getPromotionTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800';
      case 'fixed_amount': return 'bg-green-100 text-green-800';
      case 'early_bird': return 'bg-orange-100 text-orange-800';
      case 'group_discount': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPromotionValue = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% OFF`;
      case 'fixed_amount':
        return `$${promotion.value} OFF`;
      case 'early_bird':
        return `${promotion.value}% Early Bird`;
      case 'group_discount':
        return `${promotion.value}% Group Discount`;
      default:
        return promotion.value.toString();
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Promo code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Promotions & Discounts</h3>
          <p className="text-sm text-gray-600">Manage sales, deals, and discount codes for your event</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Promotion
        </button>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        {promotions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Promotions Yet</h4>
            <p className="text-gray-600">Create your first promotion to offer discounts and deals to vendors</p>
          </div>
        ) : (
          promotions.map((promotion) => (
            <div key={promotion.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getPromotionTypeIcon(promotion.type)}
                      <h4 className="text-lg font-semibold text-gray-900">{promotion.name}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPromotionTypeColor(promotion.type)}`}>
                      {promotion.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{promotion.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Discount Value</span>
                      <p className="text-lg font-bold text-brand-green">{formatPromotionValue(promotion)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Valid Period</span>
                      <p className="text-sm text-gray-900">
                        {new Date(promotion.startsAt).toLocaleDateString()} - {new Date(promotion.endsAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Usage</span>
                      <p className="text-sm text-gray-900">
                        {promotion.currentUses} / {promotion.maxUses || '∞'}
                      </p>
                    </div>
                    {promotion.code && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Promo Code</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{promotion.code}</code>
                          <button
                            onClick={() => copyPromoCode(promotion.code!)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {promotion.minOrderAmount && (
                      <span>Min Order: ${promotion.minOrderAmount}</span>
                    )}
                    {promotion.applicableVendorTypes && promotion.applicableVendorTypes.length > 0 && (
                      <span>Vendor Types: {promotion.applicableVendorTypes.join(', ')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingPromotion(promotion)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit promotion"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onTogglePromotion(promotion.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      promotion.isActive 
                        ? 'hover:bg-red-100' 
                        : 'hover:bg-green-100'
                    }`}
                    title={promotion.isActive ? 'Deactivate promotion' : 'Activate promotion'}
                  >
                    <div className={`w-4 h-4 ${promotion.isActive ? 'text-red-600' : 'text-green-600'}`}>
                      {promotion.isActive ? '⏸️' : '▶️'}
                    </div>
                  </button>
                  <button
                    onClick={() => onDeletePromotion(promotion.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete promotion"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Promotion Modal */}
      {(showCreateForm || editingPromotion) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPromotion(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget as HTMLFormElement);
                  const promotionData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    type: formData.get('type'),
                    value: parseFloat(formData.get('value') as string),
                    code: formData.get('code'),
                    startsAt: formData.get('startsAt'),
                    endsAt: formData.get('endsAt'),
                    maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : undefined,
                    minOrderAmount: formData.get('minOrderAmount') ? parseFloat(formData.get('minOrderAmount') as string) : undefined,
                    applicableVendorTypes: formData.get('vendorTypes')?.toString().split(',').map(s => s.trim()).filter(Boolean),
                    isActive: true
                  };

                  if (editingPromotion) {
                    onUpdatePromotion(editingPromotion.id, promotionData);
                  } else {
                    onCreatePromotion(promotionData);
                  }
                  
                  setShowCreateForm(false);
                  setEditingPromotion(null);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingPromotion?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Promotion name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Type</label>
                    <select
                      name="type"
                      defaultValue={editingPromotion?.type || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Promotion type"
                    >
                      <option value="">Select type</option>
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                      <option value="early_bird">Early Bird Discount</option>
                      <option value="group_discount">Group Discount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingPromotion?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Promotion description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      name="value"
                      defaultValue={editingPromotion?.value || ''}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Discount value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code (Optional)</label>
                    <input
                      type="text"
                      name="code"
                      defaultValue={editingPromotion?.code || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="e.g., EARLY2024"
                      aria-label="Promo code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      name="startsAt"
                      defaultValue={editingPromotion?.startsAt ? editingPromotion.startsAt.slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="Start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      name="endsAt"
                      defaultValue={editingPromotion?.endsAt ? editingPromotion.endsAt.slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      required
                      aria-label="End date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses (Optional)</label>
                    <input
                      type="number"
                      name="maxUses"
                      defaultValue={editingPromotion?.maxUses || ''}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="Leave empty for unlimited"
                      aria-label="Maximum uses"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount (Optional)</label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      defaultValue={editingPromotion?.minOrderAmount || ''}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      placeholder="Minimum order to qualify"
                      aria-label="Minimum order amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Vendor Types (Optional)</label>
                  <input
                    type="text"
                    name="vendorTypes"
                    defaultValue={editingPromotion?.applicableVendorTypes?.join(', ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Baker, Honey, Vegetables (comma-separated)"
                    aria-label="Applicable vendor types"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingPromotion(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                  >
                    {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
