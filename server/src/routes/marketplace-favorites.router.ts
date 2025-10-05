import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/isAuthenticated-mock';

const router = express.Router();
const prisma = new PrismaClient();

// Toggle vendor favorite
router.post('/vendor/:vendorId', isAuthenticated, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user!.id;

    // Check if vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteVendor.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favoriteVendor.delete({
        where: {
          userId_vendorId: {
            userId,
            vendorId,
          },
        },
      });

      res.json({ 
        message: 'Vendor removed from favorites',
        isFavorite: false,
        vendor: {
          id: vendor.id,
          name: vendor.storeName,
        },
      });
    } else {
      // Add favorite
      await prisma.favoriteVendor.create({
        data: {
          userId,
          vendorId,
        },
      });

      res.json({ 
        message: 'Vendor added to favorites',
        isFavorite: true,
        vendor: {
          id: vendor.id,
          name: vendor.storeName,
        },
      });
    }

  } catch (error) {
    console.error('Toggle vendor favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle vendor favorite' });
  }
});

// Toggle product favorite
router.post('/product/:productId', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favoriteProduct.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      res.json({ 
        message: 'Product removed from favorites',
        isFavorite: false,
        product: {
          id: product.id,
          name: product.name,
        },
      });
    } else {
      // Add favorite
      await prisma.favoriteProduct.create({
        data: {
          userId,
          productId,
        },
      });

      res.json({ 
        message: 'Product added to favorites',
        isFavorite: true,
        product: {
          id: product.id,
          name: product.name,
        },
      });
    }

  } catch (error) {
    console.error('Toggle product favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle product favorite' });
  }
});

// Get user's favorites summary
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [favoriteVendors, favoriteProducts] = await Promise.all([
      prisma.favoriteVendor.findMany({
        where: { userId },
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              slug: true,
              avatarUrl: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.favoriteProduct.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbUrl: true,
              price: true,
              vendor: {
                select: {
                  storeName: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      vendors: favoriteVendors.map(fav => ({
        id: fav.vendor.id,
        name: fav.vendor.storeName,
        slug: fav.vendor.slug,
        avatarUrl: fav.vendor.avatarUrl,
        location: fav.vendor.city && fav.vendor.state 
          ? `${fav.vendor.city}, ${fav.vendor.state}` 
          : null,
        favoritedAt: fav.createdAt,
      })),
      products: favoriteProducts.map(fav => ({
        id: fav.product.id,
        name: fav.product.name,
        slug: fav.product.slug,
        thumbUrl: fav.product.thumbUrl,
        price: fav.product.price,
        vendor: {
          name: fav.product.vendor.storeName,
          slug: fav.product.vendor.slug,
        },
        favoritedAt: fav.createdAt,
      })),
      counts: {
        vendors: favoriteVendors.length,
        products: favoriteProducts.length,
      },
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Get favorite status for multiple items
router.post('/status', isAuthenticated, async (req, res) => {
  try {
    const { vendorIds = [], productIds = [] } = req.body;
    const userId = req.user!.id;

    const [favoriteVendors, favoriteProducts] = await Promise.all([
      vendorIds.length > 0 ? prisma.favoriteVendor.findMany({
        where: {
          userId,
          vendorId: { in: vendorIds },
        },
        select: { vendorId: true },
      }) : [],
      productIds.length > 0 ? prisma.favoriteProduct.findMany({
        where: {
          userId,
          productId: { in: productIds },
        },
        select: { productId: true },
      }) : [],
    ]);

    const vendorStatus = favoriteVendors.reduce((acc, fav) => {
      acc[fav.vendorId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    const productStatus = favoriteProducts.reduce((acc, fav) => {
      acc[fav.productId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    res.json({
      vendors: vendorStatus,
      products: productStatus,
    });

  } catch (error) {
    console.error('Get favorite status error:', error);
    res.status(500).json({ error: 'Failed to get favorite status' });
  }
});

export default router;
