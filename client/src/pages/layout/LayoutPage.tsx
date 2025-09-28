import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus } from 'lucide-react';
import { LayoutManager } from '@/components/layout/LayoutManager';
import type { EventLayout, Zone, Stall } from '@/lib/api/layout';

interface LayoutPageProps {
  eventId: string;
}

export default function LayoutPage({ eventId }: LayoutPageProps) {
  const [layout, setLayout] = useState<EventLayout | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with React Query
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLayout({
        id: 'layout_1',
        eventId,
        name: 'Main Market Layout',
        description: 'Standard market layout with zones A, B, and C',
        layoutType: 'GRID',
        gridRows: 10,
        gridColumns: 12,
        cellWidth: 10,
        cellHeight: 10,
        aisleWidth: 6,
        totalWidth: 126,
        totalHeight: 106,
        units: 'feet',
        showNumbers: true,
        showAisles: true,
        showGrid: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z',
        zones: [
          {
            id: 'zone_a',
            layoutId: 'layout_1',
            name: 'Zone A - Food Court',
            description: 'Food and beverage vendors',
            color: '#10B981',
            startRow: 1,
            endRow: 4,
            startColumn: 1,
            endColumn: 6,
            basePrice: 75.00,
            priceUnit: 'stall',
            features: ['power', 'water'],
            isActive: true,
            autoNumbering: true,
            numberingPrefix: 'A',
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-02-10T00:00:00Z',
          },
          {
            id: 'zone_b',
            layoutId: 'layout_1',
            name: 'Zone B - Crafts',
            description: 'Handmade crafts and artisan goods',
            color: '#3B82F6',
            startRow: 1,
            endRow: 4,
            startColumn: 7,
            endColumn: 12,
            basePrice: 60.00,
            priceUnit: 'stall',
            features: ['power'],
            isActive: true,
            autoNumbering: true,
            numberingPrefix: 'B',
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-02-10T00:00:00Z',
          }
        ],
        stalls: [
          {
            id: 'stall_a1',
            layoutId: 'layout_1',
            zoneId: 'zone_a',
            number: 'A1',
            row: 1,
            column: 1,
            stallType: 'STALL',
            size: '10x10',
            basePrice: 75.00,
            totalPrice: 75.00,
            features: ['power', 'water'],
            status: 'AVAILABLE',
            isBlocked: false,
            surcharges: [],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-02-10T00:00:00Z',
            zone: {
              id: 'zone_a',
              name: 'Zone A - Food Court',
              color: '#10B981'
            }
          },
          {
            id: 'stall_a2',
            layoutId: 'layout_1',
            zoneId: 'zone_a',
            number: 'A2',
            row: 1,
            column: 2,
            stallType: 'STALL',
            size: '10x10',
            basePrice: 75.00,
            totalPrice: 75.00,
            features: ['power', 'water'],
            status: 'SOLD',
            isBlocked: false,
            surcharges: [],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-02-10T00:00:00Z',
            zone: {
              id: 'zone_a',
              name: 'Zone A - Food Court',
              color: '#10B981'
            }
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [eventId]);

  const handleSaveLayout = (updates: Partial<EventLayout>) => {
    console.log('Saving layout:', updates);
    // TODO: Implement API call
    setLayout(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleExportLayout = (format: string) => {
    console.log('Exporting layout as:', format);
    // TODO: Implement export
  };

  const handleCreateZone = (zoneData: any) => {
    console.log('Creating zone:', zoneData);
    // TODO: Implement API call
  };

  const handleCreateStall = (stallData: any) => {
    console.log('Creating stall:', stallData);
    // TODO: Implement API call
  };

  const handleUpdateStall = (stallId: string, updates: any) => {
    console.log('Updating stall:', stallId, updates);
    // TODO: Implement API call
  };

  const handleDeleteStall = (stallId: string) => {
    console.log('Deleting stall:', stallId);
    // TODO: Implement API call
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Layout Manager</h1>
              <p className="text-gray-600">Design and manage your event layout</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // TODO: Implement template selection
                  console.log('Use template');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Manager */}
      <LayoutManager
        layout={layout}
        loading={loading}
        onSave={handleSaveLayout}
        onExport={handleExportLayout}
        onCreateZone={handleCreateZone}
        onCreateStall={handleCreateStall}
        onUpdateStall={handleUpdateStall}
        onDeleteStall={handleDeleteStall}
      />
    </div>
  );
}
