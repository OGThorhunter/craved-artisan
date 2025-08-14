import express from 'express';
import { requireAuth } from '../middleware/auth-mock';

const router = express.Router();

// POST /api/fulfillment/predict - Predict fulfillment time (Mock)
router.post("/predict", requireAuth, async (req, res) => {
  try {
    const { vendorId, items, shippingMethod, customerZip } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Items array is required and must not be empty'
      });
    }

    if (!shippingMethod) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Shipping method is required'
      });
    }

    // Mock AI logic (replace with real model later)
    const prepTimes = items.map((item: any) => item.quantity * 2); // 2 min per unit
    const maxPrep = Math.max(...prepTimes);

    // Adjust shipping time based on ZIP code distance
    let shippingTime = shippingMethod === "local_pickup" ? 0 : 24;
    
    if (customerZip && shippingMethod !== "local_pickup") {
      // Mock distance calculation based on ZIP code
      // In a real app, this would use a geocoding service
      const zipPrefix = customerZip.substring(0, 3);
      const vendorZipPrefix = "123"; // Mock vendor ZIP prefix
      
      if (zipPrefix === vendorZipPrefix) {
        shippingTime = 12; // Same region: faster shipping
      } else if (zipPrefix.startsWith("1") || zipPrefix.startsWith("2")) {
        shippingTime = 18; // Nearby region
      } else if (zipPrefix.startsWith("9")) {
        shippingTime = 48; // Far region (West Coast)
      } else {
        shippingTime = 36; // Standard shipping
      }
    }

    const baseEstimate = maxPrep + shippingTime;
    const predictedFulfillmentTime = `${baseEstimate} hrs`;

    const label =
      baseEstimate <= 12 ? "⚡ Fast Fulfillment" :
      baseEstimate <= 36 ? "📦 Standard" :
      "⏳ Delayed";

    // Calculate margin prediction based on delivery method
    const baseMargin = 0.25; // 25% base margin
    let marginMultiplier = 1.0;
    
    switch (shippingMethod) {
      case "local_pickup":
        marginMultiplier = 1.2; // 20% higher margin (no shipping costs)
        break;
      case "express_shipping":
        marginMultiplier = 0.8; // 20% lower margin (higher shipping costs)
        break;
      case "standard_shipping":
      default:
        marginMultiplier = 1.0; // Standard margin
        break;
    }
    
    const predictedMargin = baseMargin * marginMultiplier;
    const marginLabel = 
      predictedMargin >= 0.3 ? "💰 High Margin" :
      predictedMargin >= 0.2 ? "📊 Standard Margin" :
      "⚠️ Low Margin";

    return res.json({ 
      predictedFulfillmentTime, 
      label,
      baseEstimate,
      prepTime: maxPrep,
      shippingTime,
      predictedMargin: Math.round(predictedMargin * 100), // Return as percentage
      marginLabel,
      zipAdjustment: customerZip ? `Adjusted for ZIP ${customerZip}` : null
    });

  } catch (error) {
    console.error('Error predicting fulfillment time:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to predict fulfillment time'
    });
  }
});

export default router; 