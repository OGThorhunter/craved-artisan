import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/db/prisma';
import express from 'express';
import cors from 'cors';
import vendorRouter from '../src/routes/vendor.routes';
import productRouter from '../src/routes/product.routes';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/vendors', vendorRouter);
app.use('/products', productRouter);

// Test data
const testVendor = {
  id: 'test-vendor-001',
  user_id: 'test-user-001',
  business_name: 'Test Bakery',
  description: 'A test bakery for testing',
  category: 'Bakery',
  created_at: new Date(),
  updated_at: new Date()
};

const testProduct = {
  id: 'test-product-001',
  vendor_id: 'test-vendor-001',
  name: 'Test Sourdough',
  description: 'A test sourdough bread',
  price: 8.99,
  category: 'Bread',
  stock_quantity: 10,
  created_at: new Date(),
  updated_at: new Date()
};

describe('Products API E2E Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({ where: { id: testProduct.id } });
    await prisma.vendorProfile.deleteMany({ where: { id: testVendor.id } });
    await prisma.user.deleteMany({ where: { id: testVendor.user_id } });

    // Create test user
    await prisma.user.create({
      data: {
        id: testVendor.user_id,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User'
      }
    });

    // Create test vendor
    await prisma.vendorProfile.create({
      data: testVendor
    });

    // Create test product
    await prisma.product.create({
      data: testProduct
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({ where: { id: testProduct.id } });
    await prisma.vendorProfile.deleteMany({ where: { id: testVendor.id } });
    await prisma.user.deleteMany({ where: { id: testVendor.user_id } });
    await prisma.$disconnect();
  });

  describe('GET /products', () => {
    it('returns 200 with products list', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
      
      if (response.body.data.length > 0) {
        const product = response.body.data[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(typeof product.id).toBe('string');
        expect(typeof product.title).toBe('string');
        expect(typeof product.price).toBe('number');
      }
    });

    it('respects limit and offset parameters', async () => {
      const response = await request(app)
        .get('/products?limit=1&offset=0')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.meta.limit).toBe(1);
      expect(response.body.meta.offset).toBe(0);
    });
  });

  describe('GET /products/:productId', () => {
    it('returns 200 and matches seed data', async () => {
      const response = await request(app)
        .get(`/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.id).toBe(testProduct.id);
      expect(response.body.title).toBe(testProduct.name);
      expect(response.body.price).toBe(Number(testProduct.price));
      expect(response.body.vendorId).toBe(testProduct.vendor_id);
    });

    it('returns 404 on unknown productId', async () => {
      await request(app)
        .get('/products/unknown-product-id')
        .expect(404);
    });
  });

  describe('GET /vendors/:vendorId', () => {
    it('returns 200 with correct vendor data', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}`)
        .expect(200);

      expect(response.body.id).toBe(testVendor.id);
      expect(response.body.name).toBe(testVendor.business_name);
      expect(response.body.tagline).toBe(testVendor.description);
    });
  });

  describe('GET /vendors/:vendorId/products', () => {
    it('returns 200 with correct meta', async () => {
      const response = await request(app)
        .get(`/vendors/${testVendor.id}/products`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
