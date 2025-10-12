import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, 
  Search, 
  Download, 
  Bell, 
  Eye, 
  Edit, 
  Clock,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  List,
  ChefHat,
  Layers,
  BookOpen,
  AlertCircle,
  CheckSquare,
  Printer,
  X
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import SystemMessagesDrawer from '../components/inventory/SystemMessagesDrawer';
import AIInsightsDrawer from '../components/inventory/AIInsightsDrawer';
import SimpleLabelPrintModal from '../components/labels/SimpleLabelPrintModal';
import AddOrderWizard from '../components/orders/AddOrderWizard';

// Types
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone?: string;
  status: string;
  priority: string;
  source?: string;
  salesWindowId?: string;
  createdAt: string;
  expectedAt?: string;
  dueAt?: string;
  paymentStatus?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
  station?: string;
  tags?: string[];
  total: number;
  orderItems: OrderItem[];
  salesWindow?: {
    id: string;
    name: string;
  };
  timeline?: OrderTimeline[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  status: string;
  madeQty: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    recipeId?: string;
    recipe?: {
      id: string;
      name: string;
      ingredients: Array<{
        name: string;
        quantity: number;
        unit: string;
      }>;
      steps: Array<{
        stepNumber: number;
        instruction: string;
        duration: number;
      }>;
      yieldAmount: number;
    };
  };
}

interface OrderTimeline {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-1001',
    customerName: 'Suzy Johnson',
    customerEmail: 'suzy@example.com',
    phone: '(555) 123-4567',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 20.97,
    orderItems: [
      {
        id: 'item-1',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 3,
        unitPrice: 6.99,
        total: 20.97,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-1002',
    customerName: 'Mike Stevens',
    customerEmail: 'mike@example.com',
    phone: '(555) 987-6543',
    status: 'CONFIRMED',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 41.94,
    orderItems: [
      {
        id: 'item-2',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 6,
        unitPrice: 6.99,
        total: 41.94,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-1003',
    customerName: 'Emily Chen',
    customerEmail: 'emily@example.com',
    phone: '(555) 246-8135',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 37.96,
    orderItems: [
      {
        id: 'item-3',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 12,
        unitPrice: 3.99,
        total: 47.88,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400�F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-1004',
    customerName: 'David Martinez',
    customerEmail: 'david@example.com',
    phone: '(555) 369-2580',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 27.96,
    orderItems: [
      {
        id: 'item-4a',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 2,
        unitPrice: 6.99,
        total: 13.98,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      },
      {
        id: 'item-4b',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 6,
        unitPrice: 3.99,
        total: 23.94,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400�F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ]
  },
  {
    id: '5',
    orderNumber: 'ORD-1005',
    customerName: 'Sarah Thompson',
    customerEmail: 'sarah.t@example.com',
    phone: '(555) 789-4561',
    status: 'CONFIRMED',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Due in 12 hours
    paymentStatus: 'PAID',
    total: 48.00,
    orderItems: [
      {
        id: 'item-5a',
        productId: 'prod-cinnamon-rolls',
        productName: 'Cinnamon Rolls',
        quantity: 6,
        unitPrice: 4.50,
        total: 27.00,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-cinnamon-rolls',
          name: 'Cinnamon Rolls',
          imageUrl: '/images/cinnamon-rolls.jpg',
          recipeId: 'recipe-cinnamon-rolls',
          recipe: {
            id: 'recipe-cinnamon-rolls',
            name: 'Classic Cinnamon Rolls',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 480, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Butter', quantity: 115, unit: 'g' },
              { name: 'Sugar', quantity: 100, unit: 'g' },
              { name: 'Eggs', quantity: 2, unit: 'whole' },
              { name: 'Instant Yeast', quantity: 7, unit: 'g' },
              { name: 'Cinnamon', quantity: 15, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and let rise for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Roll out, add filling, cut into rolls.', duration: 20 },
              { stepNumber: 3, instruction: 'Second rise for 45 minutes.', duration: 45 },
              { stepNumber: 4, instruction: 'Bake at 350°F for 25-30 minutes. Add cream cheese frosting.', duration: 30 }
            ],
            yieldAmount: 12
          }
        }
      },
      {
        id: 'item-5b',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 3,
        unitPrice: 6.99,
        total: 20.97,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475°F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '6',
    orderNumber: 'ORD-1006',
    customerName: 'James Wilson',
    customerEmail: 'j.wilson@example.com',
    phone: '(555) 147-2589',
    status: 'CONFIRMED',
    priority: 'LOW',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Due in 2 days
    paymentStatus: 'PAID',
    total: 72.50,
    orderItems: [
      {
        id: 'item-6',
        productId: 'prod-focaccia',
        productName: 'Rosemary Focaccia',
        quantity: 5,
        unitPrice: 14.50,
        total: 72.50,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-focaccia',
          name: 'Rosemary Focaccia',
          imageUrl: '/images/focaccia.jpg',
          recipeId: 'recipe-focaccia',
          recipe: {
            id: 'recipe-focaccia',
            name: 'Rosemary Focaccia Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Water', quantity: 375, unit: 'ml' },
              { name: 'Olive Oil', quantity: 50, unit: 'ml' },
              { name: 'Fresh Rosemary', quantity: 15, unit: 'g' },
              { name: 'Sea Salt', quantity: 12, unit: 'g' },
              { name: 'Instant Yeast', quantity: 8, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix all ingredients and knead for 10 minutes.', duration: 10 },
              { stepNumber: 2, instruction: 'First rise for 1 hour in oiled bowl.', duration: 60 },
              { stepNumber: 3, instruction: 'Stretch into pan, dimple with fingers, add toppings. Rise 30 minutes.', duration: 30 },
              { stepNumber: 4, instruction: 'Bake at 425°F for 20-25 minutes until golden.', duration: 25 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '7',
    orderNumber: 'ORD-1007',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.anderson@example.com',
    phone: '(555) 852-9637',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // Due in 1.5 days
    paymentStatus: 'PAID',
    total: 45.96,
    orderItems: [
      {
        id: 'item-7a',
        productId: 'prod-baguette',
        productName: 'French Baguette',
        quantity: 4,
        unitPrice: 5.99,
        total: 23.96,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-baguette',
          name: 'French Baguette',
          imageUrl: '/images/baguette.jpg',
          recipeId: 'recipe-baguette',
          recipe: {
            id: 'recipe-baguette',
            name: 'Traditional French Baguette',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 5, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix ingredients and autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Knead for 5 minutes, bulk ferment for 3-4 hours with folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Divide and pre-shape. Rest 20 minutes, then final shape.', duration: 20 },
              { stepNumber: 4, instruction: 'Proof for 1 hour, score, and bake at 475°F with steam for 25 minutes.', duration: 85 }
            ],
            yieldAmount: 3
          }
        }
      },
      {
        id: 'item-7b',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 6,
        unitPrice: 3.99,
        total: 23.94,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400°F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ]
  },
  {
    id: '8',
    orderNumber: 'ORD-1008',
    customerName: 'Robert Kim',
    customerEmail: 'robert.kim@example.com',
    phone: '(555) 963-7412',
    status: 'CONFIRMED',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // Due in 18 hours
    paymentStatus: 'PAID',
    total: 89.85,
    orderItems: [
      {
        id: 'item-8a',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 5,
        unitPrice: 6.99,
        total: 34.95,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475°F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      },
      {
        id: 'item-8b',
        productId: 'prod-bagels',
        productName: 'Everything Bagels',
        quantity: 12,
        unitPrice: 2.99,
        total: 35.88,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-bagels',
          name: 'Everything Bagels',
          imageUrl: '/images/bagels.jpg',
          recipeId: 'recipe-bagels',
          recipe: {
            id: 'recipe-bagels',
            name: 'New York Style Everything Bagels',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Water', quantity: 300, unit: 'ml' },
              { name: 'Honey', quantity: 15, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 7, unit: 'g' },
              { name: 'Everything Seasoning', quantity: 30, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix dough and knead for 10 minutes.', duration: 10 },
              { stepNumber: 2, instruction: 'Divide into portions, shape into bagels. Rest 10 minutes.', duration: 10 },
              { stepNumber: 3, instruction: 'Boil in water with honey for 1 minute per side.', duration: 20 },
              { stepNumber: 4, instruction: 'Top with everything seasoning and bake at 425°F for 20 minutes.', duration: 20 }
            ],
            yieldAmount: 12
          }
        }
      },
      {
        id: 'item-8c',
        productId: 'prod-focaccia',
        productName: 'Rosemary Focaccia',
        quantity: 1,
        unitPrice: 14.50,
        total: 14.50,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-focaccia',
          name: 'Rosemary Focaccia',
          imageUrl: '/images/focaccia.jpg',
          recipeId: 'recipe-focaccia',
          recipe: {
            id: 'recipe-focaccia',
            name: 'Rosemary Focaccia Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Water', quantity: 375, unit: 'ml' },
              { name: 'Olive Oil', quantity: 50, unit: 'ml' },
              { name: 'Fresh Rosemary', quantity: 15, unit: 'g' },
              { name: 'Sea Salt', quantity: 12, unit: 'g' },
              { name: 'Instant Yeast', quantity: 8, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix all ingredients and knead for 10 minutes.', duration: 10 },
              { stepNumber: 2, instruction: 'First rise for 1 hour in oiled bowl.', duration: 60 },
              { stepNumber: 3, instruction: 'Stretch into pan, dimple with fingers, add toppings. Rise 30 minutes.', duration: 30 },
              { stepNumber: 4, instruction: 'Bake at 425°F for 20-25 minutes until golden.', duration: 25 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '9',
    orderNumber: 'ORD-1009',
    customerName: 'Jennifer Garcia',
    customerEmail: 'jenny.garcia@example.com',
    phone: '(555) 321-7894',
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Created 12 hours ago
    dueAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Due in 6 hours
    paymentStatus: 'PAID',
    total: 83.88,
    orderItems: [
      {
        id: 'item-9',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 24,
        unitPrice: 3.99,
        total: 95.76,
        status: 'IN_PRODUCTION',
        madeQty: 12,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400°F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ],
    notes: 'Customer event - needs to be ready by 2pm sharp!'
  }
];


type ViewMode = 'list' | 'calendar' | 'batching' | 'labeling' | 'qa';

const VendorOrdersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('batching'); // Default to batching for demo
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [completedBatches, setCompletedBatches] = useState<Set<string>>(new Set());
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [packageSelections, setPackageSelections] = useState<Record<string, string>>({});
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [currentProductForPackage, setCurrentProductForPackage] = useState<string | null>(null);
  const [customPackageData, setCustomPackageData] = useState({
    name: '',
    width: '',
    height: '',
    depth: '',
    material: '',
    currentStock: '',
    reorderPoint: '',
    unitPrice: '',
    supplier: ''
  });

  // Load orders from localStorage on component mount
  React.useEffect(() => {
    const loadOrders = () => {
      const savedOrders = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
      if (savedOrders.length > 0) {
        setOrders(savedOrders);
      } else {
        // Use mock data if no saved orders
        setOrders(mockOrders);
      }
    };

    loadOrders();

    // Listen for new orders created from sales windows
    const handleOrderCreated = (event: CustomEvent) => {
      const newOrder = event.detail;
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`New hold inventory order created: ${newOrder.orderNumber}`);
    };

    window.addEventListener('orderCreated', handleOrderCreated as EventListener);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated as EventListener);
    };
  }, []);

  const isLoadingOrders = false;
  const aiInsights = null;
  const isLoadingInsights = false;

  // Mock packaging options - in real app, would come from inventory API
  const [availablePackaging, setAvailablePackaging] = useState([
    { id: 'pkg-xl-window', name: 'XL Windowed Box', size: '12x8x4', material: 'Cardboard', stock: 150, labelTemplate: 'xl-window-label' },
    { id: 'pkg-4x4-shrink', name: '4x4 Heat Shrink Bag', size: '4x4', material: 'Heat Shrink Film', stock: 300, labelTemplate: '4x4-label' },
    { id: 'pkg-6x4-window', name: '6x4 Windowed Box', size: '6x4x3', material: 'Cardboard', stock: 200, labelTemplate: '6x4-window-label' },
    { id: 'pkg-small-bag', name: 'Small Paper Bag', size: '6x9', material: 'Kraft Paper', stock: 500, labelTemplate: 'small-bag-label' },
    { id: 'pkg-medium-box', name: 'Medium Box', size: '8x8x4', material: 'Cardboard', stock: 100, labelTemplate: 'medium-box-label' },
    { id: 'pkg-baguette-sleeve', name: 'Baguette Sleeve', size: '20x4', material: 'Paper', stock: 250, labelTemplate: 'baguette-label' }
  ]);

  // Mock product package assignments - in real app, would come from product data
  const productPackageMap: Record<string, string> = useMemo(() => ({
    'prod-sourdough': 'pkg-xl-window',
    'prod-croissant': 'pkg-6x4-window',
    'prod-cinnamon-rolls': 'pkg-6x4-window',
    'prod-focaccia': 'pkg-xl-window',
    'prod-baguette': 'pkg-baguette-sleeve',
    'prod-bagels': 'pkg-small-bag'
  }), []);

  const handlePackageSelect = (productId: string, packageId: string) => {
    setPackageSelections(prev => ({
      ...prev,
      [productId]: packageId
    }));
    
    // Deduct from packaging inventory
    const selectedPackage = availablePackaging.find(p => p.id === packageId);
    if (selectedPackage) {
      // Get total quantity needed for this product
      const totalQty = orders
        .flatMap(o => o.orderItems)
        .filter(item => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      toast.success(`Selected ${selectedPackage.name} for packaging (${totalQty} units needed)`);
    }
  };

  const handleAddCustomPackage = () => {
    const newPackage = {
      id: `pkg-custom-${Date.now()}`,
      name: customPackageData.name,
      size: `${customPackageData.width}x${customPackageData.height}x${customPackageData.depth}`,
      material: customPackageData.material,
      stock: parseInt(customPackageData.currentStock) || 0,
      labelTemplate: 'custom-label'
    };

    // Add to packaging inventory
    setAvailablePackaging(prev => [...prev, newPackage]);
    
    // Save to localStorage (in real app, this would be API call)
    const existingPackaging = JSON.parse(localStorage.getItem('packagingInventory') || '[]');
    const inventoryItem = {
      id: newPackage.id,
      name: newPackage.name,
      description: `Custom packaging - ${newPackage.size} ${newPackage.material}`,
      category: 'packaging',
      currentStock: parseInt(customPackageData.currentStock) || 0,
      reorderPoint: parseInt(customPackageData.reorderPoint) || 0,
      unit: 'units',
      unitPrice: parseFloat(customPackageData.unitPrice) || 0,
      supplier: customPackageData.supplier,
      tags: ['packaging', 'custom'],
      location: 'Packaging Storage',
      createdAt: new Date().toISOString()
    };
    existingPackaging.push(inventoryItem);
    localStorage.setItem('packagingInventory', JSON.stringify(existingPackaging));

    // Select the new package for the current product
    if (currentProductForPackage) {
      handlePackageSelect(currentProductForPackage, newPackage.id);
    }

    toast.success(`Added custom package: ${newPackage.name} to inventory`);
    setShowAddPackageModal(false);
    setCustomPackageData({
      name: '',
      width: '',
      height: '',
      depth: '',
      material: '',
      currentStock: '',
      reorderPoint: '',
      unitPrice: '',
      supplier: ''
    });
    setCurrentProductForPackage(null);
  };

  // Calculate summary stats
  const summaryStats = {
    total: orders.length,
    dueToday: orders.filter(order => {
      if (!order.dueAt) return false;
      const today = new Date().toDateString();
      return new Date(order.dueAt).toDateString() === today;
    }).length,
    delivered: 0,
    finished: 0,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  // Aggregate orders by product for batching
  const aggregateProductionBatch = () => {
    const batches: Record<string, {
      productId: string;
      productName: string;
      totalQuantity: number;
      orders: Array<{ orderNumber: string; customerName: string; quantity: number; }>;
      recipe?: typeof mockOrders[0]['orderItems'][0]['product']['recipe'];
      ingredients: Record<string, { quantity: number; unit: string }>;
    }> = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!batches[item.productId]) {
          batches[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            orders: [],
            recipe: item.product.recipe,
            ingredients: {}
          };
        }

        batches[item.productId].totalQuantity += item.quantity;
        batches[item.productId].orders.push({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          quantity: item.quantity
        });

        // Aggregate ingredients
        if (item.product.recipe) {
          const batchMultiplier = item.quantity / item.product.recipe.yieldAmount;
          item.product.recipe.ingredients.forEach(ing => {
            const key = `${ing.name}-${ing.unit}`;
            if (!batches[item.productId].ingredients[key]) {
              batches[item.productId].ingredients[key] = {
                quantity: 0,
                unit: ing.unit
              };
            }
            batches[item.productId].ingredients[key].quantity += ing.quantity * batchMultiplier;
          });
        }
      });
    });

    return Object.values(batches);
  };

  const productionBatches = aggregateProductionBatch();

  // Auto-select packages based on product assignments
  useEffect(() => {
    if (productionBatches.length > 0) {
      const autoSelections: Record<string, string> = {};
      productionBatches.forEach(batch => {
        // Only auto-select if not already selected
        if (!packageSelections[batch.productId]) {
          const assignedPackage = productPackageMap[batch.productId];
          if (assignedPackage) {
            autoSelections[batch.productId] = assignedPackage;
          }
        }
      });
      if (Object.keys(autoSelections).length > 0) {
        setPackageSelections(prev => ({ ...prev, ...autoSelections }));
      }
    }
  }, [productionBatches, productPackageMap, packageSelections]);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PRODUCTION: 'bg-orange-100 text-orange-800',
      READY: 'bg-green-100 text-green-800',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      PICKED_UP: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      RUSH: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }
    toast.success(`Updated ${selectedOrders.length} orders to ${status}`);
    setSelectedOrders([]);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const toggleBatchComplete = (productId: string) => {
    setCompletedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handlePrintLabel = (order: Order) => {
    setSelectedOrderForLabel(order);
    setShowLabelModal(true);
  };

  const handlePrintLabelSuccess = () => {
    toast.success(`Label printed successfully for ${selectedOrderForLabel?.orderNumber}!`);
    setShowLabelModal(false);
    setSelectedOrderForLabel(null);
  };

    return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {summaryStats.total} Total
                </Badge>
                {viewMode === 'batching' && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    Production Mode
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowSystemMessages(true)}
                  className="relative text-xs px-2 py-1"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowAIInsights(true)}
                  className="text-xs px-2 py-1"
                >
                  <Eye className="h-4 w-4" />
                  AI Insights
                </Button>
                
                <Button 
                  onClick={() => setShowAddOrderWizard(true)}
                  className="text-xs px-2 py-1"
                >
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* KPI Tiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
                </div>
              <Package className="h-8 w-8 text-blue-600" />
              </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.dueToday}</p>
                </div>
              <Clock className="h-8 w-8 text-orange-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.finished}</p>
                </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${summaryStats.revenue.toFixed(2)}</p>
                </div>
              <Package className="h-8 w-8 text-green-600" />
                </div>
          </Card>
          </div>

        {/* Toolbar */}
        <div className="bg-offwhite rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by priority"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="RUSH">Rush</option>
              </select>
                      </div>
                      
              <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('list')}
                  className="text-xs px-2 py-1"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('calendar')}
                  className="text-xs px-2 py-1"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'batching' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('batching')}
                  className="text-xs px-2 py-1"
                  title="Production Batching"
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'labeling' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('labeling')}
                  className="text-xs px-2 py-1"
                  title="Labeling & Packaging"
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'qa' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('qa')}
                  className="text-xs px-2 py-1"
                  title="Final QA Checklist"
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="secondary" className="text-xs px-2 py-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && viewMode !== 'batching' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                  className="text-xs px-2 py-1"
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('IN_PRODUCTION')}
                  className="text-xs px-2 py-1"
                >
                  Start Production
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('READY')}
                  className="text-xs px-2 py-1"
                >
                  Mark Ready
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrders([])}
                  className="text-xs px-2 py-1"
                >
                  Clear
                </Button>
              </div>
            </div>
              </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {viewMode === 'list' && (
              <div className="bg-offwhite rounded-lg shadow-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300"
                                title="Select all orders"
                              />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                                className="rounded border-gray-300"
                                title="Select order"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.customerEmail}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.dueAt ? new Date(order.dueAt).toLocaleDateString() : 'N/A'}
                              </div>
                              {order.dueAt && new Date(order.dueAt) < new Date() && (
                                <div className="text-xs text-red-600">Overdue</div>
                              )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.orderItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.total.toFixed(2)}
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                      </td>
                    </tr>
                        ))
                      )}
              </tbody>
            </table>
            </div>
              </div>
            )}


            {viewMode === 'calendar' && (
              <div className="space-y-6">
                {/* Calendar Header */}
                <Card className="p-6 bg-offwhite shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Orders Calendar</h2>
                    <div className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Card>

                {/* Group orders by date */}
                {(() => {
                  const ordersByDate: Record<string, Order[]> = {};
                  orders.forEach(order => {
                    if (order.dueAt) {
                      const dateKey = new Date(order.dueAt).toDateString();
                      if (!ordersByDate[dateKey]) {
                        ordersByDate[dateKey] = [];
                      }
                      ordersByDate[dateKey].push(order);
                    }
                  });

                  const sortedDates = Object.keys(ordersByDate).sort((a, b) => 
                    new Date(a).getTime() - new Date(b).getTime()
                  );

                  return sortedDates.map(dateKey => (
                    <Card key={dateKey} className="p-6 bg-offwhite shadow-lg border border-gray-200">
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-6 w-6 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">
                            {new Date(dateKey).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {ordersByDate[dateKey].length} orders
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {ordersByDate[dateKey].map(order => (
                          <div key={order.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-bold text-gray-900">{order.orderNumber}</span>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(order.priority)}>
                                    {order.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {order.customerName} • {order.orderItems.length} items
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 text-lg">${order.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                Due: {new Date(order.dueAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ));
                })()}

                {Object.keys(orders.reduce((acc: Record<string, Order[]>, order) => {
                  if (order.dueAt) {
                    const dateKey = new Date(order.dueAt).toDateString();
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(order);
                  }
                  return acc;
                }, {})).length === 0 && (
                  <Card className="p-12 text-center bg-offwhite shadow-lg border border-gray-200">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders scheduled</p>
                  </Card>
                )}
              </div>
            )}


            {viewMode === 'batching' && (
              <div className="space-y-6">
                {/* Production Kitchen Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Production Kitchen</h2>
                    <p className="text-white/90">
                      Aggregate all orders by product for efficient batch production
                    </p>
                  </div>
                </div>

                {/* PRODUCTION MODE */}
                <div className="space-y-6">
                    {/* Production Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-900">Total Items to Produce</p>
                            <p className="text-3xl font-bold text-orange-600">
                              {productionBatches.reduce((sum, batch) => sum + batch.totalQuantity, 0)}
                            </p>
                          </div>
                          <ChefHat className="h-12 w-12 text-orange-400" />
                        </div>
                      </Card>

                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Product Types</p>
                            <p className="text-3xl font-bold text-blue-600">{productionBatches.length}</p>
                          </div>
                          <Layers className="h-12 w-12 text-blue-400" />
                        </div>
                      </Card>

                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Completed Batches</p>
                            <p className="text-3xl font-bold text-green-600">
                              {completedBatches.size}/{productionBatches.length}
                            </p>
                          </div>
                          <CheckSquare className="h-12 w-12 text-green-400" />
                        </div>
                      </Card>
                    </div>

                    {/* Production Batches */}
                    {productionBatches.map((batch) => (
                      <Card key={batch.productId} className={`p-6 ${completedBatches.has(batch.productId) ? 'bg-green-50 border-green-300' : 'bg-offwhite shadow-lg border border-gray-200'}`}>
                        <div className="space-y-4">
                          {/* Batch Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{batch.productName}</h3>
                                {completedBatches.has(batch.productId) && (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    ? Complete
                                  </Badge>
                                )}
                              </div>
                              <p className="text-3xl font-bold text-blue-600 mb-2">
                                {batch.totalQuantity} units to produce
                              </p>
                              <p className="text-sm text-gray-600">
                                For {batch.orders.length} customer{batch.orders.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {batch.recipe && (
                                <Button
                                  variant="secondary"
                                  onClick={() => setExpandedRecipe(expandedRecipe === batch.productId ? null : batch.productId)}
                                  className="text-sm"
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  {expandedRecipe === batch.productId ? 'Hide' : 'View'} Recipe
                                </Button>
                              )}
                              <Button
                                onClick={() => toggleBatchComplete(batch.productId)}
                                className={completedBatches.has(batch.productId) 
                                  ? 'bg-gray-400 hover:bg-gray-500' 
                                  : 'bg-green-500 hover:bg-green-600'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {completedBatches.has(batch.productId) ? 'Mark Incomplete' : 'Mark Complete'}
                              </Button>
                            </div>
                          </div>

                          {/* Ingredient Breakdown */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              Total Ingredients Needed
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(batch.ingredients).map(([key, value]) => {
                                const ingredientName = key.split('-')[0];
                                return (
                                  <div key={key} className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-sm text-gray-600">{ingredientName}</div>
                                    <div className="text-lg font-bold text-gray-900">
                                      {value.quantity.toFixed(1)} {value.unit}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Recipe/SOP */}
                          {batch.recipe && expandedRecipe === batch.productId && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Production Guide - {batch.recipe.name}
                              </h4>
                              <div className="space-y-3">
                                {batch.recipe.steps.map((step) => (
                                  <div key={step.stepNumber} className="bg-white rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                                        {step.stepNumber}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-900">{step.instruction}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Duration: {step.duration} minutes
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Breakdown */}
                          <details className="bg-gray-50 border border-gray-200 rounded-lg">
                            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
                              View Order Breakdown ({batch.orders.length} orders)
                            </summary>
                            <div className="p-4 border-t border-gray-200 space-y-2">
                              {batch.orders.map((order, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                  <div>
                                    <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                    <span className="text-gray-600 ml-2">- {order.customerName}</span>
                                  </div>
                                  <div className="font-bold text-blue-600">{order.quantity} units</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </Card>
                    ))}
                  </div>
              </div>
            )}

            {/* Labeling & Packaging View */}
            {viewMode === 'labeling' && (
              <div className="space-y-6">
                {/* Labeling & Packaging Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Labeling & Packaging Center</h2>
                    <p className="text-white/90">
                      Select packaging for each product and print labels for all units
                    </p>
                  </div>
                </div>

                {/* Labeling & Packaging Instructions */}
                <Card className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-2">Packaging & Label Instructions</h3>
                      <p className="text-green-800">
                        This view shows total quantities by product. Select the appropriate packaging for each product type, 
                        then print all labels. The packaging you select determines which label template will be used and 
                        deducts from your packaging inventory.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Products Grouped for Packaging */}
                {productionBatches.map((batch) => {
                  const selectedPackage = packageSelections[batch.productId];
                  const packageInfo = availablePackaging.find(p => p.id === selectedPackage);
                  const needsPackageSelection = !selectedPackage;
                  
                  return (
                  <Card key={batch.productId} className={`p-6 bg-white shadow-md border-2 hover:shadow-lg transition-shadow ${
                    needsPackageSelection ? 'border-orange-300' : 'border-gray-200'
                  }`}>
                    <div className="space-y-4">
                      {/* Product Header */}
                      <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Package className="h-8 w-8 text-green-600" />
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{batch.productName}</h3>
                              <p className="text-sm text-gray-600">
                                Total Units to Package: <span className="font-bold text-green-600">{batch.totalQuantity}</span>
                              </p>
                            </div>
                          </div>
                          {needsPackageSelection && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
                              <p className="text-xs text-orange-800 font-medium">⚠️ Package selection required</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Packaging Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Type *
                          </label>
                          <select
                            value={selectedPackage || ''}
                            onChange={(e) => handlePackageSelect(batch.productId, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            title="Select package type"
                          >
                            <option value="">Select packaging...</option>
                            {availablePackaging.map((pkg) => {
                              const hasStock = pkg.stock >= batch.totalQuantity;
                              return (
                                <option 
                                  key={pkg.id} 
                                  value={pkg.id}
                                  disabled={!hasStock}
                                >
                                  {pkg.name} ({pkg.size}) - Stock: {pkg.stock} {hasStock ? '' : '⚠️ Insufficient'}
                                </option>
                              );
                            })}
                          </select>
                          
                          <button
                            onClick={() => {
                              setCurrentProductForPackage(batch.productId);
                              setShowAddPackageModal(true);
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            + Add Custom Package Size
                          </button>
                        </div>

                        {packageInfo && (
                          <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-900 mb-1">Selected Package:</p>
                            <p className="text-sm text-green-800">{packageInfo.name} ({packageInfo.size})</p>
                            <p className="text-xs text-green-700 mt-1">Material: {packageInfo.material}</p>
                            <p className="text-xs text-green-700">Template: {packageInfo.labelTemplate}</p>
                            <p className="text-xs text-green-700">Stock: {packageInfo.stock} available</p>
                          </div>
                        )}
                      </div>

                      {/* Order Breakdown */}
                      <details className="bg-gray-50 border border-gray-200 rounded-lg">
                        <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
                          View Orders for This Product ({batch.orders.length} orders)
                        </summary>
                        <div className="p-4 border-t border-gray-200 space-y-2">
                          {batch.orders.map((order, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                              <div>
                                <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                <span className="text-gray-600 ml-2">- {order.customerName}</span>
                              </div>
                              <div className="font-bold text-blue-600">{order.quantity} units</div>
                            </div>
                          ))}
                        </div>
                      </details>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <Button 
                          variant="secondary" 
                          className="flex-1"
                          disabled={needsPackageSelection}
                          onClick={() => {
                            toast.success(`Printing ${batch.totalQuantity} labels for ${batch.productName} using template: ${packageInfo?.labelTemplate}`);
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print All Labels ({batch.totalQuantity})
                        </Button>
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={needsPackageSelection}
                          onClick={() => {
                            toast.success(`${batch.productName} marked as labeled and packaged!`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Packaged
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}

            {/* Add Custom Package Modal */}
            {showAddPackageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Add Custom Package Size</h2>
                        <p className="text-green-100">This will be added to your packaging inventory</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddPackageModal(false);
                          setCurrentProductForPackage(null);
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close modal"
                        aria-label="Close add package modal"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Name *
                        </label>
                        <input
                          type="text"
                          value={customPackageData.name}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Large Windowed Bread Box"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Width (inches) *
                        </label>
                        <input
                          type="number"
                          value={customPackageData.width}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, width: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (inches) *
                        </label>
                        <input
                          type="number"
                          value={customPackageData.height}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, height: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="8"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Depth (inches)
                        </label>
                        <input
                          type="number"
                          value={customPackageData.depth}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, depth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Material *
                        </label>
                        <select
                          value={customPackageData.material}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, material: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          title="Select packaging material"
                        >
                          <option value="">Select material...</option>
                          <option value="Cardboard">Cardboard</option>
                          <option value="Kraft Paper">Kraft Paper</option>
                          <option value="Heat Shrink Film">Heat Shrink Film</option>
                          <option value="Plastic">Plastic</option>
                          <option value="Wax Paper">Wax Paper</option>
                          <option value="Foil">Foil</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Stock *
                        </label>
                        <input
                          type="number"
                          value={customPackageData.currentStock}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, currentStock: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reorder Point *
                        </label>
                        <input
                          type="number"
                          value={customPackageData.reorderPoint}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, reorderPoint: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="25"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={customPackageData.unitPrice}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, unitPrice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.50"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier
                        </label>
                        <input
                          type="text"
                          value={customPackageData.supplier}
                          onChange={(e) => setCustomPackageData({ ...customPackageData, supplier: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., ABC Packaging Supply"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>📦 Note:</strong> This custom package will be added to your inventory under the "Packaging" category 
                        and will be available for future orders.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-t p-6 flex items-center justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowAddPackageModal(false);
                        setCurrentProductForPackage(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleAddCustomPackage}
                      disabled={!customPackageData.name || !customPackageData.width || !customPackageData.height || !customPackageData.material || !customPackageData.currentStock}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Inventory & Select
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Final QA Checklist View */}
            {viewMode === 'qa' && (
              <div className="space-y-6">
                {/* Final QA Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Final QA & Customer Receipt</h2>
                    <p className="text-white/90">
                      Verify order accuracy, print customer receipt with thank you note
                    </p>
                  </div>
                </div>

                {/* QA Instructions */}
                <Card className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200">
                  <div className="flex items-start gap-4">
                    <CheckSquare className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">Quality Assurance Process</h3>
                      <p className="text-purple-800">
                        This is your final check before orders go to customers. Verify each item, check quality, 
                        and print a professional receipt with your thank you message. This serves as both a QA checklist 
                        and a customer-ready receipt.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Individual Orders for QA */}
                {orders.filter(order => order.status === 'READY' || order.status === 'IN_PRODUCTION').map((order) => (
                  <Card key={order.id} className="p-6 bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="space-y-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div>
                              <span className="text-gray-600">Customer:</span>
                              <span className="ml-2 font-medium text-gray-900">{order.customerName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2 font-medium text-gray-900">{order.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2 font-medium text-gray-900">{order.customerEmail || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {order.dueAt ? new Date(order.dueAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QA Checklist */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                          <CheckSquare className="h-5 w-5" />
                          Quality Assurance Checklist
                        </h4>
                        <div className="space-y-3">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900">{item.productName}</h5>
                                  <p className="text-sm text-gray-600">Quantity Ordered: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Unit Price</p>
                                  <p className="font-bold text-gray-900">${item.unitPrice.toFixed(2)}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2 mt-4">
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Correct product selected</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Quantity verified ({item.quantity} units)</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Quality check passed</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Properly packaged</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Label attached</span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Receipt Section */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Order Receipt</h4>
                          <p className="text-sm text-gray-600">Customer Copy</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="border-b border-gray-200 pb-4 mb-4">
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerEmail}</p>
                            <p className="text-sm text-gray-600">{order.phone}</p>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Order Number:</span>
                              <span className="font-mono font-bold">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Order Date:</span>
                              <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            {order.dueAt && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Pickup/Delivery:</span>
                                <span className="font-medium">{new Date(order.dueAt).toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-200 pt-4 mb-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Items:</h5>
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.productName}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>

                          <div className="border-t-2 border-gray-300 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total:</span>
                              <span className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Thank You Note */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <h5 className="font-bold text-gray-900 mb-2">🎉 Thank You for Your Order!</h5>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            We truly appreciate your support of our artisan craft. Every order helps us continue 
                            doing what we love. We hope you enjoy these handmade goods as much as we enjoyed creating 
                            them for you. Thank you for being a valued customer!
                          </p>
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <p className="text-xs text-gray-600 italic">
                              Questions or concerns? Contact us anytime. We're here to help!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <Button 
                          variant="secondary" 
                          className="flex-1"
                          onClick={() => handlePrintLabel(order)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print QA Checklist
                        </Button>
                        <Button 
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            // TODO: Implement print receipt functionality
                            toast.success('Printing customer receipt...');
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Receipt
                        </Button>
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            toast.success(`Order ${order.orderNumber} marked as QA approved!`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          QA Approved
                        </Button>
                      </div>

                      {/* Special Notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Special Instructions:
                          </h4>
                          <p className="text-yellow-800">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {orders.filter(order => order.status === 'READY' || order.status === 'IN_PRODUCTION').length === 0 && (
                  <Card className="p-12 bg-[#F7F2EC] shadow-md border border-gray-200 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Ready for QA</h3>
                    <p className="text-gray-600">
                      Orders will appear here once they are marked as "Ready" or "In Production". 
                      Complete your batching and labeling first.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
            
        {/* System Messages Drawer */}
        <SystemMessagesDrawer
          isOpen={showSystemMessages}
          onClose={() => setShowSystemMessages(false)}
          scope="orders"
        />

        {/* AI Insights Drawer */}
        <AIInsightsDrawer
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
          insights={aiInsights || { rush: [], batching: [], shortages: [], prepPlan: [] }}
          isLoading={isLoadingInsights}
        />

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Details - {viewingOrder.orderNumber}</h3>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Customer Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{viewingOrder.customerName}</span>
                    </div>
                    {viewingOrder.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{viewingOrder.customerEmail}</span>
                      </div>
                    )}
                    {viewingOrder.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">{viewingOrder.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(viewingOrder.status)}>
                          {viewingOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Priority</span>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(viewingOrder.priority)}>
                          {viewingOrder.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <p className="font-medium text-gray-900 mt-1">{viewingOrder.paymentStatus}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {viewingOrder.dueAt ? new Date(viewingOrder.dueAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {viewingOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">${item.total.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">${viewingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setViewingOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewingOrder(null);
                  setEditingOrder(viewingOrder);
                }}>
                  Edit Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Order - {editingOrder.orderNumber}</h3>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-sm">
                    💡 <strong>Quick Edit:</strong> Update order status, priority, or customer information below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      defaultValue={editingOrder.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select order status"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PRODUCTION">In Production</option>
                      <option value="READY">Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="PICKED_UP">Picked Up</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select 
                      defaultValue={editingOrder.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select order priority"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      defaultValue={editingOrder.customerName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Customer name"
                      title="Customer name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={editingOrder.customerEmail}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="customer@email.com"
                        title="Customer email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue={editingOrder.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        title="Customer phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      defaultValue={editingOrder.dueAt ? new Date(editingOrder.dueAt).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Order due date"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditingOrder(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success(`Order ${editingOrder.orderNumber} updated successfully!`);
                  setEditingOrder(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Label Print Modal */}
        {showLabelModal && selectedOrderForLabel && (
          <SimpleLabelPrintModal
            isOpen={showLabelModal}
            onClose={() => {
              setShowLabelModal(false);
              setSelectedOrderForLabel(null);
              handlePrintLabelSuccess();
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            orders={[selectedOrderForLabel as any]} // Type mismatch between Order types
          />
        )}

        {/* Add Order Wizard */}
        <AddOrderWizard
          isOpen={showAddOrderWizard}
          onClose={() => setShowAddOrderWizard(false)}
          onComplete={(orderData) => {
            console.log('New order created:', orderData);
            // In production, this would make an API call to create the order
            toast.success(`Order created for ${orderData.customerName}!`);
            setShowAddOrderWizard(false);
          }}
        />
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage;
