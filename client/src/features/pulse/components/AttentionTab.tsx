import React from 'react';
import type { AttentionPickup, AttentionInventory, AttentionCrm } from '../types';

type AttentionItem = AttentionPickup | AttentionInventory | AttentionCrm;

interface AttentionTabProps {
  title: string;
  items: readonly AttentionItem[];
  type: 'pickup' | 'inventory' | 'crm';
}

export function AttentionTab({ title, items, type }: AttentionTabProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold text-[#333] mb-2">{title}</h3>
        <p className="text-sm text-[#777]">No items requiring attention</p>
      </div>
    );
  }

  const renderItem = (item: AttentionItem, index: number) => {
    switch (type) {
      case 'pickup':
        const pickup = item as AttentionPickup;
        return (
          <div key={index} className="text-sm">
            <div className="font-medium text-[#333]">{pickup.customer}</div>
            <div className="text-[#777]">{pickup.code} • {pickup.location}</div>
          </div>
        );
      
      case 'inventory':
        const inventory = item as AttentionInventory;
        return (
          <div key={index} className="text-sm">
            <div className="font-medium text-[#333]">{inventory.name}</div>
            <div className="text-[#777]">Stock: {inventory.stock} (Reorder at: {inventory.reorderAt})</div>
          </div>
        );
      
      case 'crm':
        const crm = item as AttentionCrm;
        return (
          <div key={index} className="text-sm">
            <div className="font-medium text-[#333]">{crm.name}</div>
            <div className="text-[#777]">Score: {crm.score} • {crm.reason}</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-semibold text-[#333] mb-3">{title}</h3>
      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}
