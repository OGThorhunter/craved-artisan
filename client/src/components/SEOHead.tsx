import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  event?: {
    name: string;
    startDate: string;
    endDate: string;
    location: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
    };
    description: string;
    image?: string;
    organizer: {
      name: string;
      url: string;
    };
  };
}

export default function SEOHead({
  title = 'Craved Artisan - Local Events & Artisan Marketplace',
  description = 'Discover local farmers markets, craft fairs, pop-up events, and workshops. Connect with local artisans and vendors in your community.',
  image = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  url = 'https://craved-artisan.com',
  type = 'website',
  event
}: SEOHeadProps) {
  const fullTitle = title.includes('Craved Artisan') ? title : `${title} | Craved Artisan`;
  const fullUrl = url.startsWith('http') ? url : `https://craved-artisan.com${url}`;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Craved Artisan" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Event-specific meta tags */}
      {event && (
        <>
          <meta property="event:start_time" content={event.startDate} />
          <meta property="event:end_time" content={event.endDate} />
          <meta property="event:location" content={event.location.name} />
        </>
      )}

      {/* Structured Data */}
      {event && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": event.name,
              "description": event.description,
              "startDate": event.startDate,
              "endDate": event.endDate,
              "location": {
                "@type": "Place",
                "name": event.location.name,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": event.location.address,
                  "addressLocality": event.location.city,
                  "addressRegion": event.location.state,
                  "addressCountry": event.location.country
                }
              },
              "organizer": {
                "@type": "Organization",
                "name": event.organizer.name,
                "url": event.organizer.url
              },
              "image": event.image || image,
              "url": fullUrl,
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      )}

      {/* General website structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Craved Artisan",
            "description": "Local events and artisan marketplace connecting communities with local producers",
            "url": "https://craved-artisan.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://craved-artisan.com/events/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </>
  );
}
