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

export type SalesWindow = {
  id: string; 
  vendorId: string; 
  title: string;
  openAt: string; 
  closeAt: string;
  fulfillStart?: string | null; 
  fulfillEnd?: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELED';
  marketId?: string | null;
};

