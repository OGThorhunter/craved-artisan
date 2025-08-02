import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Validation schema for route optimization request
const optimizeRouteSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  stops: z.array(z.object({
    zip: z.string().min(5, 'Valid ZIP code required'),
    orderId: z.string().min(1, 'Order ID required'),
    address: z.string().optional(),
    customerName: z.string().optional()
  })).min(1, 'At least one stop required')
});

// Mock ZIP code to coordinates mapping (in real app, use geocoding service)
const zipToCoordinates: Record<string, { lat: number; lng: number }> = {
  '97201': { lat: 45.5152, lng: -122.6784 }, // Portland, OR
  '97202': { lat: 45.4841, lng: -122.6369 },
  '97203': { lat: 45.5189, lng: -122.6784 },
  '97204': { lat: 45.5229, lng: -122.6738 },
  '97205': { lat: 45.5152, lng: -122.6784 },
  '97206': { lat: 45.4841, lng: -122.6369 },
  '97207': { lat: 45.5189, lng: -122.6784 },
  '97208': { lat: 45.5229, lng: -122.6738 },
  '97209': { lat: 45.5152, lng: -122.6784 },
  '97210': { lat: 45.4841, lng: -122.6369 },
  '97211': { lat: 45.5189, lng: -122.6784 },
  '97212': { lat: 45.5229, lng: -122.6738 },
  '97213': { lat: 45.5152, lng: -122.6784 },
  '97214': { lat: 45.4841, lng: -122.6369 },
  '97215': { lat: 45.5189, lng: -122.6784 },
  '97216': { lat: 45.5229, lng: -122.6738 },
  '97217': { lat: 45.5152, lng: -122.6784 },
  '97218': { lat: 45.4841, lng: -122.6369 },
  '97219': { lat: 45.5189, lng: -122.6784 },
  '97220': { lat: 45.5229, lng: -122.6738 },
  '97221': { lat: 45.5152, lng: -122.6784 },
  '97222': { lat: 45.4841, lng: -122.6369 },
  '97223': { lat: 45.5189, lng: -122.6784 },
  '97224': { lat: 45.5229, lng: -122.6738 },
  '97225': { lat: 45.5152, lng: -122.6784 },
  '97227': { lat: 45.4841, lng: -122.6369 },
  '97228': { lat: 45.5189, lng: -122.6784 },
  '97229': { lat: 45.5229, lng: -122.6738 },
  '97230': { lat: 45.5152, lng: -122.6784 },
  '97231': { lat: 45.4841, lng: -122.6369 },
  '97232': { lat: 45.5189, lng: -122.6784 },
  '97233': { lat: 45.5229, lng: -122.6738 },
  '97236': { lat: 45.5152, lng: -122.6784 },
  '97238': { lat: 45.4841, lng: -122.6369 },
  '97239': { lat: 45.5189, lng: -122.6784 },
  '97240': { lat: 45.5229, lng: -122.6738 },
  '97242': { lat: 45.5152, lng: -122.6784 },
  '97266': { lat: 45.4841, lng: -122.6369 },
  '97267': { lat: 45.5189, lng: -122.6784 },
  '97268': { lat: 45.5229, lng: -122.6738 },
  '97269': { lat: 45.5152, lng: -122.6784 },
  '97280': { lat: 45.4841, lng: -122.6369 },
  '97281': { lat: 45.5189, lng: -122.6784 },
  '97282': { lat: 45.5229, lng: -122.6738 },
  '97283': { lat: 45.5152, lng: -122.6784 },
  '97286': { lat: 45.4841, lng: -122.6369 },
  '97290': { lat: 45.5189, lng: -122.6784 },
  '97291': { lat: 45.5229, lng: -122.6738 },
  '97292': { lat: 45.5152, lng: -122.6784 },
  '97293': { lat: 45.4841, lng: -122.6369 },
  '97294': { lat: 45.5189, lng: -122.6784 },
  '97296': { lat: 45.5229, lng: -122.6738 },
  '97298': { lat: 45.5152, lng: -122.6784 },
  '97299': { lat: 45.4841, lng: -122.6369 }
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Simple nearest neighbor algorithm for route optimization
function optimizeRouteNearestNeighbor(
  origin: { lat: number; lng: number },
  stops: Array<{ zip: string; orderId: string; lat: number; lng: number; address?: string; customerName?: string }>
): Array<{ zip: string; orderId: string; lat: number; lng: number; address?: string; customerName?: string }> {
  const optimized: typeof stops = [];
  const unvisited = [...stops];
  let current = origin;

  while (unvisited.length > 0) {
    // Find nearest unvisited stop
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.lat, current.lng,
        unvisited[i].lat, unvisited[i].lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Add nearest stop to optimized route
    optimized.push(unvisited[nearestIndex]);
    current = unvisited[nearestIndex];
    unvisited.splice(nearestIndex, 1);
  }

  return optimized;
}

// POST /api/route/optimize - Optimize delivery route
router.post('/optimize', requireAuth, async (req, res) => {
  try {
    // Validate request body
    const validationResult = optimizeRouteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { origin, stops } = validationResult.data;

    // Get origin coordinates (in real app, use geocoding service)
    const originCoords = zipToCoordinates[origin] || { lat: 45.5152, lng: -122.6784 }; // Default to Portland

    // Convert stops to coordinates
    const stopsWithCoords = stops.map(stop => {
      const coords = zipToCoordinates[stop.zip] || { lat: 45.5152, lng: -122.6784 };
      return {
        ...stop,
        lat: coords.lat,
        lng: coords.lng
      };
    });

    // Optimize route using nearest neighbor algorithm
    const optimizedStops = optimizeRouteNearestNeighbor(originCoords, stopsWithCoords);

    // Calculate total distance and estimated time
    let totalDistance = 0;
    let current = originCoords;

    for (const stop of optimizedStops) {
      const distance = calculateDistance(current.lat, current.lng, stop.lat, stop.lng);
      totalDistance += distance;
      current = stop;
    }

    // Add return trip to origin
    const returnDistance = calculateDistance(
      current.lat, current.lng,
      originCoords.lat, originCoords.lng
    );
    totalDistance += returnDistance;

    // Estimate time (assuming 25 mph average speed in city)
    const estimatedTimeMinutes = Math.round((totalDistance / 25) * 60);
    
    // Estimate fuel cost (assuming 20 mpg and $3.50/gallon)
    const fuelCost = Math.round((totalDistance / 20) * 3.5 * 100) / 100;

    // Generate route summary
    const routeSummary = {
      totalStops: optimizedStops.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedTimeMinutes,
      estimatedTimeHours: Math.round((estimatedTimeMinutes / 60) * 10) / 10,
      fuelCost,
      optimizationMethod: 'Nearest Neighbor',
      origin: {
        zip: origin,
        coordinates: originCoords
      }
    };

    res.json({
      success: true,
      optimizedRoute: {
        stops: optimizedStops,
        summary: routeSummary
      },
      message: 'Route optimized successfully'
    });

  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      error: 'Failed to optimize route',
      message: 'Internal server error'
    });
  }
});

// GET /api/route/optimize/options - Get available optimization methods
router.get('/optimize/options', requireAuth, async (req, res) => {
  try {
    const optimizationOptions = [
      {
        id: 'nearest-neighbor',
        name: 'Nearest Neighbor',
        description: 'Simple algorithm that finds the closest unvisited stop',
        complexity: 'O(n²)',
        accuracy: 'Good for small routes',
        free: true
      },
      {
        id: 'google-directions',
        name: 'Google Directions API',
        description: 'Professional routing with real-time traffic data',
        complexity: 'O(1)',
        accuracy: 'Excellent',
        free: false,
        cost: '$5 per 1000 requests'
      },
      {
        id: 'mapbox-directions',
        name: 'Mapbox Directions API',
        description: 'High-quality routing with custom profiles',
        complexity: 'O(1)',
        accuracy: 'Excellent',
        free: false,
        cost: '$0.75 per 1000 requests'
      },
      {
        id: 'openrouteservice',
        name: 'OpenRouteService',
        description: 'Open-source routing with multiple profiles',
        complexity: 'O(1)',
        accuracy: 'Very Good',
        free: true,
        note: 'Rate limited'
      }
    ];

    res.json({
      success: true,
      options: optimizationOptions
    });

  } catch (error) {
    console.error('Error fetching optimization options:', error);
    res.status(500).json({
      error: 'Failed to fetch optimization options'
    });
  }
});

export default router; 