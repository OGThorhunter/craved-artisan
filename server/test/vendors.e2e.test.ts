import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/db/prisma';
import express from 'express';
import cors from 'cors';
import vendorRouter from '../src/routes/vendor.routes';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/vendors', vendorRouter);

// Test data
const testVendor = {
  id: 'test-vendor-002',
  user_id: 'test-user-002',
  business_name: 'Test Artisan Shop',
  description: 'A test artisan shop for testing',
  category: 'Artisan',
  created_at: new Date(),
  updated_at: new Date()
};

const testProducts = [
  {
    id: 'test-product-002',
    vendor_id: 'test-vendor-002',
    name: 'Test Handmade Soap',
    description: 'A test handmade soap',
    price: 12.99,
    category: 'Soap',
    stock_quantity: 15,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'test-product-003',
    vendor_id: 'test-vendor-002',
    name: 'Test Ceramic Mug',
    description: 'A test ceramic mug',
    price: 24.99,
    category: 'Ceramics',
    stock_quantity: 8,
    created_at: new Date(),
    updated_at: new Date()
  }
];

describe('Vendors API E2E Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({ where: { vendor_id: testVendor.id } });
    await prisma.vendorProfile.deleteMany({ where: { id: testVendor.id } });
    await prisma.user.deleteMany({ where: { id: testVendor.user_id } });

    // Create test user
    await prisma.user.create({
      data: {
        id: testVendor.user_id,
        email: 'test2@example.com',
        password: 'hashedpassword',
        name: 'Test User 2'
      }
    });

    // Create test vendor
    await prisma.vendorProfile.create({
      data: testVendor
    });

    // Create test products
    await prisma.product.createMany({
      data: testProducts
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({ where: { vendor_id: testVendor.id } });
    await prisma.vendorProfile.deleteMany({ where: { id: testVendor.id } });
    await prisma.user.deleteMany({ where: { id: testVendor.user_id } });
    await prisma.$disconnect();
  });

  describe('GET /vendors/:vendorId', () => {
    it('returns 200 with vendor details', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}`)
        .expect(200);

      expect(response.body.id).toBe(testVendor.id);
      expect(response.body.name).toBe(testVendor.business_name);
      expect(response.body.tagline).toBe(testVendor.description);
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('state');
      expect(response.body).toHaveProperty('verified');
    });

    it('returns 404 on unknown vendorId', async () => {
      await request(app)
        .get('/vendors/unknown-vendor-id')
        .expect(404);
    });
  });

  describe('GET /vendors/:vendorId/products', () => {
    it('returns 200 with vendor products and correct meta', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}/products`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.total).toBe(2);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      
      // Check product structure
      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('vendorId');
      expect(product.vendorId).toBe(testVendor.id);
    });

    it('respects limit and offset parameters', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}/products?limit=1&offset=0`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.meta.limit).toBe(1);
      expect(response.body.meta.offset).toBe(0);
      expect(response.body.meta.total).toBe(2);
    });

    it('returns 404 for unknown vendor', async () => {
      await request(app)
        .get('/vendors/unknown-vendor-id/products')
        .expect(404);
    });
  });

  describe('Response Headers', () => {
    it('includes cache control headers', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}`)
        .expect(200);

      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('etag');
    });

    it('includes cache control headers for product lists', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}/products`)
        .expect(200);

      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('etag');
    });
  });
});
