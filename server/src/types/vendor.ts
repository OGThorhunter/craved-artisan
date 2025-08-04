// Vendor API Types

export interface VendorProduct {
  id: string;
  name: string;
  price: number;
  tags: string[];
  image: string;
  description?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface VendorReview {
  rating: number;
  text: string;
  userName?: string;
  date?: string;
  helpful?: number;
}

export interface PickupDetails {
  nextPickup: string;
  location: string;
  deliveryZipCodes: string[];
  businessHours?: string;
  deliveryAreas?: string[];
}

export interface VendorContact {
  email: string;
  phone?: string;
  website?: string;
}

export interface VendorSocial {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  avatar: string;
  isVerified: boolean;
  isOnVacation: boolean;
  tagline: string;
  story: string;
  values: string[];
  pickupDetails: PickupDetails;
  products: VendorProduct[];
  reviews: VendorReview[];
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  followers?: number;
  joinedDate?: string;
  description?: string;
  contact?: VendorContact;
  social?: VendorSocial;
}

// API Response Types
export interface VendorResponse {
  success: boolean;
  data: Vendor;
}

export interface VendorProductsResponse {
  success: boolean;
  data: {
    products: VendorProduct[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface VendorReviewsResponse {
  success: boolean;
  data: {
    reviews: VendorReview[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface FollowResponse {
  success: boolean;
  message: string;
  data: {
    vendorId: string;
    isFollowing: boolean;
  };
}

// Query Parameters
export interface VendorProductsQuery {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface VendorReviewsQuery {
  limit?: number;
  offset?: number;
} 