import React from 'react';
import { useVendorWindows } from '@/hooks/fulfillment';

interface VendorFulfillmentPickerProps {
  vendorId: string;
  vendorName: string;
  zip?: string;
  onSelect: (selection: { vendorId: string; method: string; date: string; locationId?: string }) => void;
}

export function VendorFulfillmentPicker({ vendorId, vendorName, zip, onSelect }: VendorFulfillmentPickerProps) {
  const { data, isLoading, error } = useVendorWindows(vendorId, zip);
  
  if (isLoading) return <div>Loading availability…</div>;
  if (error) return <div>Error loading availability</div>;
  if (!data?.windows) return <div>No availability found</div>;

  // Group windows by date for a simple UI:
  const byDate = data.windows.reduce((acc: any, w: any) => {
    const key = w.date.slice(0,10);
    (acc[key] ||= []).push(w);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl p-4 bg-[#F7F2EC] mb-4 border-2 border-[#5B6E02]">
      <h4 className="font-semibold text-[#2C2C2C] mb-3">{vendorName} — choose a window</h4>
      {Object.entries(byDate).slice(0,7).map(([d, list]: any) => (
        <div key={d} className="mt-2">
          <div className="text-sm text-[#2C2C2C] font-medium">
            {new Date(d).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {list.map((w: any, idx: number) => (
              <button 
                key={idx} 
                className="px-3 py-1 rounded border border-[#5B6E02] text-[#5B6E02] hover:bg-[#5B6E02] hover:text-white transition-colors text-sm"
                onClick={() => onSelect({ 
                  vendorId, 
                  method: w.kind, 
                  date: w.date, 
                  locationId: w.location?.id 
                })}
              >
                {w.startTime}–{w.endTime} {w.location?.name ? `@ ${w.location.name}` : ""}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
