export type FulfillmentContext =
  | { contextType: 'MARKET'; marketId: string; windowId?: undefined }
  | { contextType: 'WINDOW'; windowId: string; marketId?: string } // marketId optional only when linked
  | { contextType: 'NONE' };

export type Market = {
  id: string; 
  title: string; 
  startsAt: string; 
  endsAt: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETE' | 'CANCELED';
  description?: string | null;
  locationId?: string | null;
};

// SalesWindow type moved to sales-windows.ts to avoid conflicts



