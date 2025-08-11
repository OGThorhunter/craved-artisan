import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

describe('ZIP Analytics API', () => {
  let vendorId: string;
  let testUsers: any[] = [];
  let testOrders: any[] = [];

  beforeAll(async () => {
    // Create test vendor
    const testUser = await prisma.user.create({
      data: {
        email: 'test-vendor@example.com',
        password: 'hashedpassword',
        name: 'Test Vendor'
      }
    });

    const vendor = await prisma.vendorProfile.create({
      data: {
        user_id: testUser.id,
        business_name: 'Test Analytics Bakery',
        description: 'Test bakery for analytics',
        category: 'Bakery'
      }
    });
    vendorId = vendor.id;

    // Create test users with different ZIP codes
    const zipCodes = ['10001', '10002', '10003'];
    for (let i = 0; i < 15; i++) {
      const user = await prisma.user.create({
        data: {
          email: `test-user-${i}@example.com`,
          password: 'hashedpassword',
          name: `Test User ${i}`,
          zip_code: zipCodes[i % zipCodes.length],
          loyalty_member: i % 3 === 0 // Every 3rd user is loyalty member
        }
      });
      testUsers.push(user);
    }

    // Create test product
    const product = await prisma.product.create({
      data: {
        vendor_id: vendorId,
        name: 'Test Bread',
        description: 'Test product',
        price: 10.00,
        category: 'Bread',
        stock_quantity: 100
      }
    });

    // Create test orders with different dates and amounts
    const baseDate = new Date('2024-01-01');
    for (let i = 0; i < 30; i++) {
      const orderDate = new Date(baseDate);
      orderDate.setDate(baseDate.getDate() + i);
      
      const user = testUsers[i % testUsers.length];
      const amount = (i % 3 + 1) * 15.50; // Varying amounts: 15.50, 31.00, 46.50
      
      const order = await prisma.order.create({
        data: {
          user_id: user.id,
          vendor_id: vendorId,
          total_amount: amount,
          status: 'completed',
          order_date: orderDate,
          created_at: orderDate
        }
      });

      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: product.id,
          quantity: i % 3 + 1,
          price: 15.50
        }
      });

      testOrders.push(order);
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          vendor_id: vendorId
        }
      }
    });
    await prisma.order.deleteMany({
      where: { vendor_id: vendorId }
    });
    await prisma.product.deleteMany({
      where: { vendor_id: vendorId }
    });
    await prisma.vendorProfile.delete({
      where: { id: vendorId }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-'
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/vendor/:vendorId/analytics/customers/by-zip', () => {
    it('should return ZIP analytics without filters', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check data structure
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('zip');
      expect(firstItem).toHaveProperty('customers');
      expect(firstItem).toHaveProperty('avgSpend');
      expect(firstItem).toHaveProperty('loyalty');
      expect(firstItem).toHaveProperty('totalRevenue');
      
      // Check data types
      expect(typeof firstItem.zip).toBe('string');
      expect(typeof firstItem.customers).toBe('number');
      expect(typeof firstItem.avgSpend).toBe('number');
      expect(typeof firstItem.loyalty).toBe('number');
      expect(typeof firstItem.totalRevenue).toBe('number');
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          from: '2024-01-01',
          to: '2024-01-15'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta.filters.from).toBe('2024-01-01');
      expect(response.body.meta.filters.to).toBe('2024-01-15');
    });

    it('should filter by from date only', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          from: '2024-01-15'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.from).toBe('2024-01-15');
      expect(response.body.meta.filters.to).toBeUndefined();
    });

    it('should filter by to date only', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          to: '2024-01-15'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.to).toBe('2024-01-15');
      expect(response.body.meta.filters.from).toBeUndefined();
    });

    it('should limit results with top parameter', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          top: 2
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta.filters.top).toBe(2);
    });

    it('should sort by totalRevenue (default)', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const data = response.body.data;
      
      // Check if sorted by totalRevenue DESC
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].totalRevenue).toBeGreaterThanOrEqual(data[i + 1].totalRevenue);
      }
    });

    it('should sort by customers', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          orderBy: 'customers'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.orderBy).toBe('customers');
      
      const data = response.body.data;
      // Check if sorted by customers DESC
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].customers).toBeGreaterThanOrEqual(data[i + 1].customers);
      }
    });

    it('should sort by avgSpend', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          orderBy: 'avgSpend'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.orderBy).toBe('avgSpend');
      
      const data = response.body.data;
      // Check if sorted by avgSpend DESC
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].avgSpend).toBeGreaterThanOrEqual(data[i + 1].avgSpend);
      }
    });

    it('should return empty results when no orders in date range', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          from: '2025-01-01',
          to: '2025-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    it('should validate query parameters', async () => {
      // Invalid orderBy
      await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          orderBy: 'invalid'
        })
        .expect(400);

      // Invalid top (too high)
      await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          top: 101
        })
        .expect(400);

      // Invalid top (negative)
      await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          top: -1
        })
        .expect(400);
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .get('/api/vendor/non-existent-id/analytics/customers/by-zip')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Vendor not found');
    });

    it('should handle complex filtering scenario', async () => {
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          from: '2024-01-01',
          to: '2024-01-20',
          top: 3,
          orderBy: 'totalRevenue'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      expect(response.body.meta.filters).toEqual({
        from: '2024-01-01',
        to: '2024-01-20',
        top: 3,
        orderBy: 'totalRevenue'
      });
      
      // Verify sorting
      const data = response.body.data;
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].totalRevenue).toBeGreaterThanOrEqual(data[i + 1].totalRevenue);
      }
    });

    it('should maintain backward compatibility', async () => {
      // Test that the old range parameter still works (though deprecated)
      const response = await request(app)
        .get(`/api/vendor/${vendorId}/analytics/customers/by-zip`)
        .query({
          range: 'monthly'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});