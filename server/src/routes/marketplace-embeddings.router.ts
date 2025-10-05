import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { generateProductEmbedding, checkOllamaStatus, installBgeSmallModel } from '../services/embeddings';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const updateProductEmbeddingSchema = z.object({
  productId: z.string(),
});

// Check Ollama status
router.get('/status', async (req, res) => {
  try {
    const isAvailable = await checkOllamaStatus();
    return res.json({ 
      available: isAvailable,
      message: isAvailable ? 'Ollama and bge-small model are ready' : 'Ollama or bge-small model not available'
    });
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    return res.status(500).json({ error: 'Failed to check Ollama status' });
  }
});

// Install bge-small model
router.post('/install-model', async (req, res) => {
  try {
    await installBgeSmallModel();
    return res.json({ message: 'bge-small model installed successfully' });
  } catch (error) {
    console.error('Error installing model:', error);
    return res.status(500).json({ error: 'Failed to install bge-small model' });
  }
});

// Update product embedding
router.post('/product/:productId', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorProfileId: vendorId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Generate embedding
    const embedding = await generateProductEmbedding({
      name: product.name,
      description: product.description || undefined,
      tags: product.tags ? JSON.parse(product.tags) : undefined,
    });

    // Update product with embedding
    await prisma.product.update({
      where: { id: productId },
      data: {
        searchVec: Buffer.from(JSON.stringify(embedding)),
      } as any,
    });

    return res.json({ 
      message: 'Product embedding updated successfully',
      productId,
      embeddingLength: embedding.length,
    });

  } catch (error) {
    console.error('Error updating product embedding:', error);
    return res.status(500).json({ error: 'Failed to update product embedding' });
  }
});

// Batch update product embeddings
router.post('/products/batch', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }

    // Get products
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorProfileId: vendorId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
      },
    });

    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }

    // Generate embeddings for all products
    const updates = await Promise.all(
      products.map(async (product) => {
        try {
          const embedding = await generateProductEmbedding({
            name: product.name,
            description: product.description || undefined,
            tags: product.tags ? JSON.parse(product.tags) : undefined,
          });

          return {
            id: product.id,
            embedding: Buffer.from(JSON.stringify(embedding)),
          };
        } catch (error) {
          console.error(`Error generating embedding for product ${product.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed updates
    const validUpdates = updates.filter(update => update !== null);

    // Update products in batch
    await Promise.all(
      validUpdates.map(update =>
        prisma.product.update({
          where: { id: update!.id },
          data: { searchVec: update!.embedding } as any,
        })
      )
    );

    return res.json({
      message: `Updated embeddings for ${validUpdates.length} products`,
      total: products.length,
      successful: validUpdates.length,
      failed: products.length - validUpdates.length,
    });

  } catch (error) {
    console.error('Error batch updating product embeddings:', error);
    return res.status(500).json({ error: 'Failed to batch update product embeddings' });
  }
});

// Update all products for a vendor
router.post('/vendor/all-products', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    // Get all products for the vendor
    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
      },
    });

    if (products.length === 0) {
      return res.json({ 
        message: 'No products found for this vendor',
        total: 0,
        successful: 0,
        failed: 0,
      });
    }

    // Process in batches of 10 to avoid overwhelming the system
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }

    let totalSuccessful = 0;
    let totalFailed = 0;

    for (const batch of batches) {
      const updates = await Promise.all(
        batch.map(async (product) => {
          try {
            const embedding = await generateProductEmbedding({
              name: product.name,
              description: product.description || undefined,
              tags: product.tags ? JSON.parse(product.tags) : undefined,
            });

            return {
              id: product.id,
              embedding: Buffer.from(JSON.stringify(embedding)),
            };
          } catch (error) {
            console.error(`Error generating embedding for product ${product.id}:`, error);
            return null;
          }
        })
      );

      // Filter out failed updates
      const validUpdates = updates.filter(update => update !== null);

      // Update products in batch
      await Promise.all(
        validUpdates.map(update =>
          prisma.product.update({
            where: { id: update!.id },
            data: { searchVec: update!.embedding } as any,
          })
        )
      );

      totalSuccessful += validUpdates.length;
      totalFailed += batch.length - validUpdates.length;

      // Small delay between batches to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return res.json({
      message: `Updated embeddings for ${totalSuccessful} products`,
      total: products.length,
      successful: totalSuccessful,
      failed: totalFailed,
    });

  } catch (error) {
    console.error('Error updating all product embeddings:', error);
    return res.status(500).json({ error: 'Failed to update all product embeddings' });
  }
});

// Get products without embeddings
router.get('/products/missing', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorId,
        searchVec: null,
      } as any,
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      products,
      count: products.length,
    });

  } catch (error) {
    console.error('Error getting products without embeddings:', error);
    return res.status(500).json({ error: 'Failed to get products without embeddings' });
  }
});

export default router;
