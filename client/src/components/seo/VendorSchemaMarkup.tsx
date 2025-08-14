'use client';

import { useEffect } from 'react';

interface VendorSchemaMarkupProps {
  vendor: {
    id: string;
    name: string;
    description: string;
    logo: string;
    rating: number;
    reviewCount: number;
    categories: string[];
    tags: string[];
    operatingArea: string[];
    pickupLocations: Array<{
      id: string;
      name: string;
      address: string;
      hours: string;
    }>;
    deliveryZones: string[];
    isVerified: boolean;
  };
}

export default function VendorSchemaMarkup({ vendor }: VendorSchemaMarkupProps) {
  useEffect(() => {
    // Create schema markup for local business
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `https://cravedartisan.com/vendors/${vendor.id}`,
      "name": vendor.name,
      "description": vendor.description,
      "image": vendor.logo,
      "url": `https://cravedartisan.com/vendors/${vendor.id}`,
      "telephone": "+1-555-123-4567", // Placeholder - should come from vendor data
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "McDonough",
        "addressRegion": "GA",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 33.4484, // Placeholder coordinates
        "longitude": -84.1469
      },
      "openingHours": "Mo-Sa 08:00-18:00", // Placeholder - should come from vendor data
      "priceRange": "$$",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": vendor.rating,
        "reviewCount": vendor.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      },
      "servesCuisine": vendor.categories,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `${vendor.name} Products`,
        "itemListElement": []
      },
      "areaServed": vendor.operatingArea.map(area => ({
        "@type": "PostalCode",
        "postalCode": area
      })),
      "sameAs": [
        // Social media links would go here
      ]
    };

    // Add schema to page head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, [vendor]);

  return null; // This component doesn't render anything visible
}
