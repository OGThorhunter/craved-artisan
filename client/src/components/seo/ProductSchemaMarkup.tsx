'use client';

import { useEffect } from 'react';

interface ProductSchemaMarkupProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    vendorId: string;
    vendorName: string;
    category: string;
    tags: string[];
    dietaryFlags: string[];
    allergens: string[];
    ingredients: string[];
    rating: number;
    reviewCount: number;
    stockLevel: number;
    isVerified: boolean;
  };
}

export default function ProductSchemaMarkup({ product }: ProductSchemaMarkupProps) {
  useEffect(() => {
    // Create schema markup for product
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://cravedartisan.com/products/${product.id}`,
      "name": product.name,
      "description": product.description,
      "image": product.image,
      "url": `https://cravedartisan.com/products/${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": product.vendorName
      },
      "category": product.category,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD",
        "availability": product.stockLevel > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "LocalBusiness",
          "name": product.vendorName,
          "url": `https://cravedartisan.com/vendors/${product.vendorId}`
        },
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Dietary Flags",
          "value": product.dietaryFlags.join(", ")
        },
        {
          "@type": "PropertyValue",
          "name": "Allergens",
          "value": product.allergens.join(", ")
        },
        {
          "@type": "PropertyValue",
          "name": "Ingredients",
          "value": product.ingredients.join(", ")
        }
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
  }, [product]);

  return null; // This component doesn't render anything visible
}
