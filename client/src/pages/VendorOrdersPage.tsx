import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import OrderEditModal from '../components/orders/OrderEditModal';
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
  X,
  Wand2,
  BarChart3,
  Zap,
  Settings,
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import SystemMessagesDrawer from '../components/inventory/SystemMessagesDrawer';
import AIInsightsDrawer from '../components/inventory/AIInsightsDrawer';
import SimpleLabelPrintModal from '../components/labels/SimpleLabelPrintModal';
import AdvancedLabelGenerator from '../components/orders/AdvancedLabelGenerator';
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
  subtotal?: number;
  tax?: number;
  shipping?: number;
  orderItems: OrderItem[];
  reworkNotes?: string;
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
    leadTimeDays?: number;
    starterType?: 'white' | 'whole-wheat' | 'rye';
    starterAmount?: number;
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

interface ProductionStep {
  stepNumber: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete';
  estimatedDuration: number;
  notes?: string;
}

interface StarterInventory {
  type: 'white' | 'whole-wheat' | 'rye';
  available: number;
  unit: string;
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


type ViewMode = 'list' | 'calendar' | 'production-kitchen' | 'packaging-center' | 'final-qa' | 'labeling' | 'qa' | 'batching';
type PackagingSubMode = 'overview' | 'labels' | 'packaging-assignment';

const VendorOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Start with list view
  const [packagingSubMode, setPackagingSubMode] = useState<PackagingSubMode>('overview');
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [selectedOrderForRework, setSelectedOrderForRework] = useState<Order | null>(null);
  const [reworkNotes, setReworkNotes] = useState('');
  const [packageSelections, setPackageSelections] = useState<Record<string, string>>({});
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [currentProductForPackage, setCurrentProductForPackage] = useState<string | null>(null);

  // Fetch orders from API
  const { data: ordersData = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['vendor-orders', user?.vendorProfileId],
    queryFn: async () => {
      if (!user?.vendorProfileId) return [];
      const response = await axios.get(`/api/vendor/orders`, {
        withCredentials: true
      });
      return response.data.orders || mockOrders; // Fallback to mock if API returns empty
    },
    enabled: !!user?.vendorProfileId,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // Use ordersData from API or mockOrders as fallback
  const [orders, setOrders] = useState<Order[]>(ordersData);
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
  const [productionSteps, setProductionSteps] = useState<Record<string, ProductionStep>>({});
  const [starterInventory, setStarterInventory] = useState<StarterInventory[]>([
    { type: 'white', available: 500, unit: 'g' },
    { type: 'whole-wheat', available: 300, unit: 'g' },
    { type: 'rye', available: 200, unit: 'g' }
  ]);
  const [qaPrintPreference, setQaPrintPreference] = useState<'paper' | 'thermal'>('paper');
  const [customQaFields, setCustomQaFields] = useState<string[]>([]);
  const [showAddQaFieldModal, setShowAddQaFieldModal] = useState(false);
  const [newQaFieldText, setNewQaFieldText] = useState('');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [showManageStepsModal, setShowManageStepsModal] = useState(false);
  const [editingStepProductId, setEditingStepProductId] = useState<string | null>(null);
  const [customProductionSteps, setCustomProductionSteps] = useState<Record<string, ProductionStep[]>>({});

  // Sync orders from API data
  React.useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  // Load custom QA fields from localStorage on component mount
  React.useEffect(() => {
    const loadCustomQaFields = () => {
      const savedFields = JSON.parse(localStorage.getItem('customQaFields') || '[]');
      setCustomQaFields(savedFields);
    };

    loadCustomQaFields();

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

  // Save custom QA fields to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('customQaFields', JSON.stringify(customQaFields));
  }, [customQaFields]);

  // Load and save custom production steps
  React.useEffect(() => {
    const savedSteps = JSON.parse(localStorage.getItem('customProductionSteps') || '{}');
    setCustomProductionSteps(savedSteps);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('customProductionSteps', JSON.stringify(customProductionSteps));
  }, [customProductionSteps]);

  // Get production steps for a product (custom or default)
  const getProductionStepsForProduct = (productId: string, starterType?: 'white' | 'whole-wheat' | 'rye', starterAmount?: number): ProductionStep[] => {
    return customProductionSteps[productId] || initializeProductionSteps(productId, productId, starterType, starterAmount);
  };

  // Calculate production status from steps
  const getProductionStatus = (productId: string): { status: string; progress: number; color: string } => {
    const steps = getProductionStepsForProduct(productId);
    const stepStatuses = Object.keys(productionSteps).filter(key => key.startsWith(`${productId}-step-`));
    
    if (stepStatuses.length === 0) {
      return { status: 'Not Started', progress: 0, color: 'bg-gray-100 text-gray-800' };
    }

    const completedCount = stepStatuses.filter(key => productionSteps[key]?.status === 'complete').length;
    const inProgressCount = stepStatuses.filter(key => productionSteps[key]?.status === 'in-progress').length;
    const progress = Math.round((completedCount / steps.length) * 100);

    if (completedCount === steps.length) {
      return { status: 'Complete', progress: 100, color: 'bg-green-600 text-white' };
    } else if (inProgressCount > 0 || completedCount > 0) {
      return { status: 'In Progress', progress, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Not Started', progress: 0, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Check for orders that need to start production and add to notifications
  React.useEffect(() => {
    if (orders.length === 0) return;

    orders.forEach(order => {
      if (shouldStartProduction(order) && order.status === 'CONFIRMED') {
        // Check if we've already sent notification (use localStorage)
        const alertKey = `production-alert-${order.id}`;
        const alreadyAlerted = localStorage.getItem(alertKey);
        
        if (!alreadyAlerted) {
          const leadTime = order.orderItems[0]?.product.leadTimeDays || 3;
          const kitchenStart = calculateKitchenStartDate(order.dueAt!, leadTime);
          
          // Add notification to the notification system instead of toast
          addNotification({
            type: 'production',
            title: '🔔 Production Alert',
            message: `Order #${order.orderNumber} for ${order.customerName} needs to start production today! Kitchen Start: ${kitchenStart.toLocaleDateString()} | Delivery: ${new Date(order.dueAt!).toLocaleDateString()}`,
            priority: 'high',
            actionUrl: '/dashboard/vendor/orders',
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              kitchenStart: kitchenStart.toISOString(),
              dueDate: order.dueAt
            }
          });
          
          localStorage.setItem(alertKey, 'true');
        }
      }
    });
  }, [orders, addNotification]);

  // AI insights can be added later if needed
  const aiInsights = null;
  const isLoadingInsights = false;

  // Calculate kitchen start date based on delivery date and lead time
  const calculateKitchenStartDate = (deliveryDate: string, leadTimeDays: number = 3): Date => {
    const delivery = new Date(deliveryDate);
    const kitchenStart = new Date(delivery);
    kitchenStart.setDate(kitchenStart.getDate() - leadTimeDays);
    return kitchenStart;
  };

  // Initialize production steps for an order
  const initializeProductionSteps = (orderId: string, productId: string, starterType?: 'white' | 'whole-wheat' | 'rye', starterAmount?: number): ProductionStep[] => {
    return [
      {
        stepNumber: 1,
        name: 'Prep Starter',
        description: `Prepare ${starterAmount || 100}g of ${starterType || 'white'} sourdough starter`,
        status: 'pending',
        estimatedDuration: 30,
        notes: starterType ? `Starter type: ${starterType}` : undefined
      },
      {
        stepNumber: 2,
        name: 'Mixing',
        description: 'Mix all ingredients according to recipe',
        status: 'pending',
        estimatedDuration: 20
      },
      {
        stepNumber: 3,
        name: 'Proofing',
        description: 'Bulk fermentation - stretch and fold every 30 minutes',
        status: 'pending',
        estimatedDuration: 180
      },
      {
        stepNumber: 4,
        name: 'Shaping',
        description: 'Shape loaves and place in bannetons',
        status: 'pending',
        estimatedDuration: 30
      },
      {
        stepNumber: 5,
        name: 'Cold Retard',
        description: 'Overnight cold proof in refrigerator',
        status: 'pending',
        estimatedDuration: 720
      },
      {
        stepNumber: 6,
        name: 'Bake',
        description: 'Preheat oven to 475°F, score and bake',
        status: 'pending',
        estimatedDuration: 45
      }
    ];
  };

  // Check if order should be in kitchen based on lead time
  const shouldStartProduction = (order: Order): boolean => {
    if (!order.dueAt) return false;
    const leadTime = order.orderItems[0]?.product.leadTimeDays || 3;
    const kitchenStart = calculateKitchenStartDate(order.dueAt, leadTime);
    const today = new Date();
    return today >= kitchenStart;
  };

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

        batches[item.productId]!.totalQuantity += item.quantity;
        batches[item.productId]!.orders.push({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          quantity: item.quantity
        });

        // Aggregate ingredients
        if (item.product?.recipe) {
          const batchMultiplier = item.quantity / item.product.recipe.yieldAmount;
          item.product.recipe.ingredients?.forEach(ing => {
            const key = `${ing.name}-${ing.unit}`;
            if (!batches[item.productId]!.ingredients[key]) {
              batches[item.productId]!.ingredients[key] = {
                quantity: 0,
                unit: ing.unit
              };
            }
            batches[item.productId]!.ingredients[key]!.quantity += ing.quantity * batchMultiplier;
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
      PENDING: 'bg-yellow-600 text-white',
      CONFIRMED: 'bg-blue-600 text-white',
      IN_PRODUCTION: 'bg-orange-600 text-white',
      READY: 'bg-green-600 text-white',
      OUT_FOR_DELIVERY: 'bg-purple-600 text-white',
      DELIVERED: 'bg-gray-600 text-white',
      PICKED_UP: 'bg-gray-600 text-white',
      CANCELLED: 'bg-red-600 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-600 text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-600 text-white',
      MEDIUM: 'bg-blue-600 text-white',
      HIGH: 'bg-red-600 text-white',
      RUSH: 'bg-red-700 text-white',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-600 text-white';
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

  const handleOrderModification = async (modificationData: any) => {
    try {
      // Make API call to save the order modification
      const response = await fetch(`/api/orders/${modificationData.orderId}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(modificationData),
      });

      if (!response.ok) {
        throw new Error('Failed to save order modifications');
      }

      const result = await response.json();
      
      // Update the local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === modificationData.orderId 
            ? { ...order, ...result.updatedOrder }
            : order
        )
      );

      toast.success('Order modifications saved successfully');
      return result;
    } catch (error) {
      console.error('Error saving order modifications:', error);
      toast.error('Failed to save order modifications');
      throw error;
    }
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
        // Mark batch as incomplete - move orders back to IN_PRODUCTION
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.orderItems.some(item => item.productId === productId)) {
              return { ...order, status: 'IN_PRODUCTION' };
            }
            return order;
          })
        );
        toast.success('Batch marked incomplete - orders moved back to production');
      } else {
        newSet.add(productId);
        // Mark batch as complete - move orders to READY for labeling
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.orderItems.some(item => item.productId === productId)) {
              return { ...order, status: 'READY' };
            }
            return order;
          })
        );
        toast.success('Batch completed - orders moved to labeling & packaging');
      }
      return newSet;
    });
  };

  const handlePrintLabel = (order: Order) => {
    setSelectedOrderForLabel(order);
    setShowLabelModal(true);
  };

  const sendBackToProduction = (order: Order, notes: string) => {
    // Update order status back to IN_PRODUCTION
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'IN_PRODUCTION', reworkNotes: notes }
          : o
      )
    );
    
    // Remove from completed batches if it was there
    const productIds = order.orderItems.map(item => item.productId);
    setCompletedBatches(prev => {
      const newSet = new Set(prev);
      productIds.forEach(productId => newSet.delete(productId));
      return newSet;
    });
    
    toast.success(`Order ${order.orderNumber} sent back to production with rework notes`);
    setShowReworkModal(false);
    setReworkNotes('');
    setSelectedOrderForRework(null);
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

      {/* KPI Tiles - Enhanced with shadows and click filtering */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card 
            className="p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 border-2 hover:border-accent"
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              toast.success('Showing all orders');
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
                </div>
              <Package className="h-8 w-8 text-blue-600" />
              </div>
          </Card>
          
          <Card 
            className="p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 border-2 hover:border-orange-500"
            onClick={() => {
              const today = new Date().toDateString();
              const dueTodayOrders = orders.filter(order => {
                if (!order.dueAt) return false;
                return new Date(order.dueAt).toDateString() === today;
              });
              if (dueTodayOrders.length > 0) {
                setSearchQuery('');
                toast.success(`Filtering ${dueTodayOrders.length} orders due today`);
              } else {
                toast('No orders due today', { icon: 'ℹ️' });
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.dueToday}</p>
                </div>
              <Clock className="h-8 w-8 text-orange-600" />
                </div>
          </Card>
          
          <Card 
            className="p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 border-2 hover:border-green-500"
            onClick={() => {
              setStatusFilter('DELIVERED');
              toast.success('Showing delivered orders');
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card 
            className="p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 border-2 hover:border-gray-500"
            onClick={() => {
              setStatusFilter('READY');
              toast.success('Showing finished orders');
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.finished}</p>
                </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
                </div>
          </Card>
          
          <Card className="p-4 shadow-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${summaryStats.revenue.toFixed(2)}</p>
                </div>
              <Package className="h-8 w-8 text-green-600" />
                </div>
          </Card>
          </div>

        {/* View Mode Toolbar - Extended across full width */}
        <div className="bg-offwhite rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* List/Calendar View Toggle - Wider and Flatter */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('list')}
                className={`text-sm px-6 py-2 ${
                  viewMode === 'list' 
                    ? 'bg-accent text-white' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('calendar')}
                className={`text-sm px-6 py-2 ${
                  viewMode === 'calendar' 
                    ? 'bg-accent text-white' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
            
            {/* Production Workflow Steps - Uniform Size */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-2 shadow-md border-2 border-purple-200">
              <Button
                onClick={() => setViewMode('batching')}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg font-semibold transition-all w-48 justify-center h-12 ${
                  viewMode === 'batching' 
                    ? 'bg-charcoal text-black shadow-lg scale-105' 
                    : 'bg-white text-purple-700 hover:bg-purple-100 border-2 border-purple-200'
                }`}
                title="Step 1: Production"
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  viewMode === 'batching' ? 'bg-white text-charcoal' : 'bg-purple-200 text-purple-800'
                }`}>
                  1
                </div>
                <ChefHat className="h-5 w-5" />
                <span className="text-sm font-medium text-center">Production</span>
              </Button>
              
              <div className="flex items-center justify-center">
                <div className="text-purple-400 text-xl font-bold">→</div>
              </div>
              
              <Button
                onClick={() => setViewMode('labeling')}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg font-semibold transition-all w-48 justify-center h-12 ${
                  viewMode === 'labeling' 
                    ? 'bg-green-600 text-charcoal shadow-lg scale-105' 
                    : 'bg-white text-green-700 hover:bg-green-100 border-2 border-green-200'
                }`}
                title="Step 2: Labeling & Packaging"
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  viewMode === 'labeling' ? 'bg-white text-green-600' : 'bg-green-200 text-green-800'
                }`}>
                  2
                </div>
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium text-center leading-tight">Labeling &<br />Packaging</span>
              </Button>
              
              <div className="flex items-center justify-center">
                <div className="text-green-400 text-xl font-bold">→</div>
              </div>
              
              <Button
                onClick={() => setViewMode('qa')}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg font-semibold transition-all w-48 justify-center h-12 ${
                  viewMode === 'qa' 
                    ? 'bg-indigo-600 text-charcoal shadow-lg scale-105' 
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border-2 border-indigo-200'
                }`}
                title="Step 3: Final QA"
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  viewMode === 'qa' ? 'bg-white text-indigo-600' : 'bg-indigo-200 text-indigo-800'
                }`}>
                  3
                </div>
                <CheckSquare className="h-5 w-5" />
                <span className="text-sm font-medium text-center">Final QA</span>
              </Button>
            </div>
            
            {/* Export Button */}
            <Button 
              variant="secondary" 
              className="px-6 py-2.5 bg-accent2 text-white hover:bg-accent2/90 shadow-md"
              onClick={() => {
                // Export functionality
                const exportData = orders.map(order => ({
                  'Order Number': order.orderNumber,
                  'Customer': order.customerName,
                  'Status': order.status,
                  'Priority': order.priority,
                  'Items': order.orderItems.length,
                  'Total': `$${order.total.toFixed(2)}`,
                  'Due Date': order.dueAt ? new Date(order.dueAt).toLocaleDateString() : 'N/A'
                }));
                
                // Convert to CSV
                const headers = Object.keys(exportData[0] || {});
                const csv = [
                  headers.join(','),
                  ...exportData.map(row => headers.map(header => (row as any)[header]).join(','))
                ].join('\n');
                
                // Download
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                toast.success(`Exported ${exportData.length} orders to CSV`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
              <thead className="bg-offwhite border-b-2 border-gray-300">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-8">
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300"
                                title="Select all orders"
                              />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-20">
                          Order
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-32">
                    Customer
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-16">
                    Priority
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-20">
                          Due
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-12">
                          Items
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-16">
                          Amount
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 divide-y divide-gray-200">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-muted">
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-muted">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-100 transition-colors">
                      <td className="px-2 py-4 whitespace-nowrap w-8">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                                className="rounded border-gray-300"
                                title="Select order"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-20">
                              <div>
                                <div className="text-sm font-semibold text-charcoal truncate">
                                  {order.orderNumber}
                                </div>
                                <div className="text-xs text-muted">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-32">
                              <div>
                                <div className="text-sm font-medium text-charcoal truncate">
                                  {order.customerName}
                                </div>
                                <div className="text-xs text-muted truncate">
                                  {order.customerEmail}
                                </div>
                              </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-20">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-16">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap w-20">
                              <div className="text-xs text-charcoal font-medium">
                                {order.dueAt ? new Date(order.dueAt).toLocaleDateString() : 'N/A'}
                              </div>
                              {order.dueAt && new Date(order.dueAt) < new Date() && (
                                <div className="text-xs text-red-600 font-semibold">Overdue</div>
                              )}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-12 text-xs text-charcoal">
                              {order.orderItems.length}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-16 text-xs font-semibold text-charcoal">
                              ${order.total.toFixed(2)}
                      </td>
                            <td className="px-2 py-4 whitespace-nowrap w-20 text-sm font-medium">
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 bg-accent text-white hover:bg-accent/90"
                                  onClick={() => setViewingOrder(order)}
                                  title="View order details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                                  onClick={() => {
                                    setOrderToEdit(order);
                                    setShowEditModal(true);
                                  }}
                                  title="Edit order"
                                >
                                  <Edit className="h-3 w-3" />
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
                            {ordersByDate[dateKey]?.length || 0} orders
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {ordersByDate[dateKey]?.map(order => (
                          <div key={order.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
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
                {/* Production Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Production</h2>
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
                                {(() => {
                                  const prodStatus = getProductionStatus(batch.productId);
                                  return (
                                    <Badge className={`${prodStatus.color} flex items-center gap-2`}>
                                      {prodStatus.status}
                                      {prodStatus.progress > 0 && ` (${prodStatus.progress}%)`}
                                    </Badge>
                                  );
                                })()}
                                {completedBatches.has(batch.productId) && (
                                  <Badge className="bg-green-600 text-white border-green-600">
                                    ✓ Complete
                                  </Badge>
                                )}
                              </div>
                              <p className="text-3xl font-bold text-blue-600 mb-2">
                                {batch.totalQuantity} units to produce
                              </p>
                              <p className="text-sm text-gray-600">
                                For {batch.orders.length} customer{batch.orders.length !== 1 ? 's' : ''}
                              </p>
                              
                              {/* Production Status Summary */}
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">Avg Lead Time:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {Math.round(batch.orders.reduce((sum, order) => {
                                      const fullOrder = orders.find(o => o.orderNumber === order.orderNumber);
                                      const leadTime = fullOrder?.orderItems?.[0]?.product?.leadTimeDays || 3;
                                      return sum + leadTime;
                                    }, 0) / batch.orders.length)} days
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">Orders in Production:</span>
                                  <span className="text-sm font-medium text-orange-600">
                                    {batch.orders.filter(order => {
                                      const fullOrder = orders.find(o => o.orderNumber === order.orderNumber);
                                      return fullOrder?.status === 'IN_PRODUCTION';
                                    }).length}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">Ready for Packaging:</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {batch.orders.filter(order => {
                                      const fullOrder = orders.find(o => o.orderNumber === order.orderNumber);
                                      return fullOrder?.status === 'READY';
                                    }).length}
                                  </span>
                                </div>
                              </div>
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

                          {/* Production Step Checklist - Collapsible */}
                          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <button
                                onClick={() => setExpandedChecklist(expandedChecklist === batch.productId ? null : batch.productId)}
                                className="flex items-center gap-2 font-bold text-purple-900 hover:text-purple-700 transition-colors"
                              >
                                <CheckSquare className="h-5 w-5" />
                                Production Checklist
                                {expandedChecklist === batch.productId ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              
                              <div className="flex items-center gap-2">
                                {batch.orders[0] && (
                                  <div className="text-xs bg-white rounded-lg px-3 py-1 border border-purple-200">
                                    <span className="text-gray-600">Batch: </span>
                                    <span className="font-semibold text-purple-900">
                                      {batch.totalQuantity} units
                                    </span>
                                    <span className="text-gray-600 mx-2">→</span>
                                    <span className="text-gray-600">Orders: </span>
                                    <span className="font-semibold text-purple-900">
                                      {batch.orders.length}
                                    </span>
                                  </div>
                                )}
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setEditingStepProductId(batch.productId);
                                    setShowManageStepsModal(true);
                                  }}
                                  className="bg-purple-600 text-white hover:bg-purple-700 text-xs"
                                >
                                  <Settings className="h-3 w-3 mr-1" />
                                  Manage Steps
                                </Button>
                              </div>
                            </div>
                            
                            {expandedChecklist === batch.productId && (
                            <div className="space-y-2">
                              {getProductionStepsForProduct(batch.productId, 'white', 100).map((step) => {
                                const stepKey = `${batch.productId}-step-${step.stepNumber}`;
                                const stepData: ProductionStep = productionSteps[stepKey] || step;
                                
                                return (
                                  <div 
                                    key={step.stepNumber} 
                                    className={`bg-white rounded-lg p-4 border-2 transition-all ${
                                      stepData.status === 'complete' 
                                        ? 'border-green-300 bg-green-50' 
                                        : stepData.status === 'in-progress'
                                        ? 'border-yellow-300 bg-yellow-50'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        stepData.status === 'complete' 
                                          ? 'bg-green-500 text-white' 
                                          : stepData.status === 'in-progress'
                                          ? 'bg-yellow-500 text-white'
                                          : 'bg-purple-200 text-purple-800'
                                      }`}>
                                        {step.stepNumber}
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-semibold text-gray-900">{step.name}</h5>
                                          <span className="text-xs text-gray-600">~{step.estimatedDuration} min</span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{step.description}</p>
                                        
                                        {/* Starter Integration for Step 1 */}
                                        {step.stepNumber === 1 && (
                                          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
                                            <p className="text-xs font-semibold text-amber-900 mb-2">Sourdough Starter Check:</p>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                              {starterInventory.map(starter => {
                                                const required = 100 * batch.totalQuantity;
                                                const hasEnough = starter.available >= required;
                                                return (
                                                  <div key={starter.type} className={`p-2 rounded ${hasEnough ? 'bg-green-600 border border-green-600 text-white' : 'bg-red-100 border border-red-300'}`}>
                                                    <p className="font-medium capitalize">{starter.type}</p>
                                                    <p className={hasEnough ? 'text-white' : 'text-red-800'}>
                                                      {starter.available}/{required}{starter.unit}
                                                    </p>
                                                    {!hasEnough && <p className="text-red-600 font-semibold">⚠️ Low!</p>}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2 mt-3">
                                          <button
                                            onClick={() => {
                                              const newSteps = { ...productionSteps };
                                              newSteps[stepKey] = { ...stepData, status: 'in-progress' };
                                              setProductionSteps(newSteps);
                                              toast.success(`Started: ${step.name}`);
                                            }}
                                            disabled={stepData.status !== 'pending'}
                                            className={`px-3 py-1 rounded text-xs font-medium ${
                                              stepData.status === 'pending'
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                          >
                                            Start
                                          </button>
                                          <button
                                            onClick={() => {
                                              const newSteps = { ...productionSteps };
                                              newSteps[stepKey] = { ...stepData, status: 'complete' };
                                              setProductionSteps(newSteps);
                                              toast.success(`✓ Completed: ${step.name}`);
                                            }}
                                            disabled={stepData.status === 'complete'}
                                            className={`px-3 py-1 rounded text-xs font-medium ${
                                              stepData.status !== 'complete'
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                          >
                                            ✓ Complete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
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
                          <details className="bg-white border border-gray-200 rounded-lg">
                            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
                              View Order Breakdown ({batch.orders.length} orders)
                            </summary>
                            <div className="p-4 border-t border-gray-200 space-y-3">
                              {batch.orders.map((order, idx) => {
                                // Get the order data to access lead time and status
                                const fullOrder = orders.find(o => o.orderNumber === order.orderNumber);
                                const leadTime = fullOrder?.orderItems?.[0]?.product?.leadTimeDays || 3;
                                const currentStep = fullOrder?.status === 'IN_PRODUCTION' ? 'Production' : 
                                                 fullOrder?.status === 'READY' ? 'Packaging' : 'Planning';
                                
                                return (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                        <span className="text-gray-600 ml-2">- {order.customerName}</span>
                                      </div>
                                      <div className="font-bold text-blue-600">{order.quantity} units</div>
                                    </div>
                                    
                                    {/* Step and Lead Time Indicators */}
                                    <div className="flex items-center gap-4">
                                      {/* Current Step Indicator */}
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">Current Step:</span>
                                        <Badge className={
                                          currentStep === 'Production' ? 'bg-orange-600 text-white' :
                                          currentStep === 'Packaging' ? 'bg-green-600 text-white' :
                                          'bg-blue-600 text-white'
                                        }>
                                          {currentStep}
                                        </Badge>
                                      </div>
                                      
                                      {/* Lead Time Indicator */}
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-xs text-gray-600">Lead Time:</span>
                                        <span className="text-sm font-medium text-gray-900">{leadTime} day{leadTime !== 1 ? 's' : ''}</span>
                                      </div>
                                      
                                      {/* Due Date */}
                                      {fullOrder?.dueAt && (
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-gray-500" />
                                          <span className="text-xs text-gray-600">Due:</span>
                                          <span className="text-sm font-medium text-gray-900">
                                            {new Date(fullOrder.dueAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Rework Notes Display */}
                                    {fullOrder?.reworkNotes && (
                                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                          <div>
                                            <p className="text-sm font-semibold text-red-900 mb-1">Rework Required</p>
                                            <p className="text-sm text-red-800">{fullOrder.reworkNotes}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Labeling & Packaging Center</h2>
                      <p className="text-white/90">
                        Generate professional labels with smart rules and real-time preview
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setLocation('/dashboard/vendor/package-templates')}
                        className="bg-white text-green-600 hover:bg-green-50"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Package Templates
                      </Button>
                      <Button
                        onClick={() => setShowLabelModal(true)}
                        className="bg-white text-green-600 hover:bg-green-50"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Advanced Label Generator
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-green-600 hover:bg-green-700 text-white border-white"
                        onClick={() => setLocation('/dashboard/vendor/package-templates')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Package-Label Template Status */}
                <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Package className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-purple-900 mb-2">Package Label Templates</h3>
                        <p className="text-purple-800 text-sm mb-3">
                          {availablePackaging.filter(p => p.labelTemplate).length} of {availablePackaging.length} packages have assigned label templates. 
                          <strong>Rule:</strong> Each package size must have exactly one label template assigned before labels can be printed. 
                          One label template can be shared across multiple package sizes.
                        </p>
                        
                        {/* Show packages needing templates */}
                        {availablePackaging.filter(p => !p.labelTemplate).length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-900 mb-1">Action Required</p>
                                <p className="text-xs text-yellow-700 mb-2">
                                  {availablePackaging.filter(p => !p.labelTemplate).map(p => p.name).join(', ')} need label templates assigned (one template per package size required)
                                </p>
                                <button
                                  onClick={() => setLocation('/dashboard/vendor/package-templates')}
                                  className="text-xs font-medium text-yellow-800 hover:text-yellow-900 underline"
                                >
                                  Click here to create templates →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setLocation('/dashboard/vendor/package-templates')}
                      variant="secondary"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Templates
                    </Button>
                  </div>
                </Card>

                {/* Phase 4 Label System Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-green-900 mb-2">Smart Label Generation</h3>
                        <p className="text-green-800 text-sm">
                          <strong>Label Assignment Rules:</strong> Create one label template via the template builder, then assign it to specific package sizes. 
                          One label template may be used for multiple package sizes, but each package size can only have ONE label assigned at a time. 
                          Use the template editor to design professional labels with dynamic order data.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Real-time Analytics Widget */}
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Today's Labels
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Generated</span>
                        <span className="font-semibold text-blue-600">147</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-semibold text-green-600">98.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Queue</span>
                        <span className="font-semibold text-amber-600">12 jobs</span>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={() => setShowLabelModal(true)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Generate All Labels
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={() => {
                          setShowLabelModal(true);
                          setTimeout(() => {
                            // Auto-switch to templates tab
                          }, 100);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Template
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={() => {
                          setShowLabelModal(true);
                          // Auto-switch to analytics tab
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </Card>
                </div>

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
                      <details className="bg-white border border-gray-200 rounded-lg">
                        <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
                          View Orders for This Product ({batch.orders.length} orders)
                        </summary>
                        <div className="p-4 border-t border-gray-200 space-y-2">
                          {batch.orders.map((order, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                <span className="text-gray-600 ml-2">- {order.customerName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="font-bold text-blue-600">{order.quantity} units</div>
                                <Button
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!packageInfo?.labelTemplate) {
                                      toast.error('Please assign a label template to this package first');
                                      return;
                                    }
                                    toast.success(`Printing ${order.quantity} label(s) for order ${order.orderNumber}`);
                                    // In production, this would trigger single label print
                                  }}
                                  className="text-xs px-3 py-1 bg-accent text-white hover:bg-accent/90"
                                  disabled={!packageInfo?.labelTemplate}
                                  title="Print labels for this order only"
                                >
                                  <Printer className="h-3 w-3 mr-1" />
                                  Print Label
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        {/* Check if selected package has a label template */}
                        {selectedPackage && packageInfo && !packageInfo.labelTemplate ? (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            onClick={() => {
                              toast.success(`Package "${packageInfo.name}" needs a label template`);
                              setLocation('/dashboard/vendor/package-templates');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template for This Package
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            className="flex-1"
                            disabled={needsPackageSelection}
                            onClick={() => {
                              // Use advanced label generator for this batch
                              setSelectedOrderForLabel(null); // Use all batch orders
                              setShowLabelModal(true);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Generate Labels ({batch.totalQuantity})
                          </Button>
                        )}
                        
                        {/* Single Label Reprint Button */}
                        <Button 
                          variant="secondary"
                          disabled={needsPackageSelection || !packageInfo?.labelTemplate}
                          onClick={() => {
                            if (!packageInfo?.labelTemplate) {
                              toast.error('No label template assigned to this package');
                              return;
                            }
                            toast.success(`Printing 1 label for ${batch.productName} (misprint/error replacement)`);
                            // In production, this would generate a single label
                          }}
                          className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-2 border-amber-300"
                          title="Print single label for error/misprint replacement"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print 1 Label
                        </Button>
                        
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={needsPackageSelection}
                          onClick={() => {
                            // Move orders to QA
                            setOrders(prevOrders => 
                              prevOrders.map(order => {
                                const hasProductInBatch = order.orderItems.some(item => item.productId === batch.productId);
                                if (hasProductInBatch) {
                                  return { ...order, status: 'READY' };
                                }
                                return order;
                              })
                            );
                            toast.success(`${batch.productName} marked as labeled and packaged - moved to QA!`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Packaged
                        </Button>
                        
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            // Find the first order in this batch to send back
                            const firstOrder = orders.find(order => 
                              order.orderItems.some(item => item.productId === batch.productId)
                            );
                            if (firstOrder) {
                              setSelectedOrderForRework(firstOrder);
                              setShowReworkModal(true);
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Send Back to Production
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Final QA & Customer Receipt</h2>
                      <p className="text-white/90">
                        Verify order accuracy, print customer receipt with thank you note
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-xs text-white/80 mb-2">QA Checklist Print Preference:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setQaPrintPreference('paper');
                            toast.success('QA checklists will print on 8.5x11 paper');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            qaPrintPreference === 'paper'
                              ? 'bg-white text-purple-700 shadow-lg'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          📄 Paper (8.5x11)
                        </button>
                        <button
                          onClick={() => {
                            setQaPrintPreference('thermal');
                            toast.success('QA checklists will print on thermal labels');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            qaPrintPreference === 'thermal'
                              ? 'bg-white text-purple-700 shadow-lg'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          🏷️ Thermal Label
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QA Instructions */}
                <Card className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
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
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddQaFieldModal(true)}
                      className="flex-shrink-0 bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Custom Fields ({customQaFields.length})
                    </Button>
                  </div>
                </Card>

                {/* Individual Orders for QA */}
                <>
                {orders.filter(order => order.status === 'READY' || order.status === 'IN_PRODUCTION').map((order) => (
                  <Card key={order.id} className="p-6 bg-offwhite shadow-lg border border-gray-200">
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
                              </div>
                              
                              <div className="space-y-2 mt-4">
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Products match receipt</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Packaging correct</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Appearance of labels good</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                  />
                                  <span className="text-sm text-gray-700">✓ Product quality</span>
                                </label>
                                
                                {/* Custom QA Fields */}
                                {customQaFields.map((field, idx) => (
                                  <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                    />
                                    <span className="text-sm text-gray-700 flex-1">✓ {field}</span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCustomQaFields(prev => prev.filter((_, i) => i !== idx));
                                        toast.success('Custom field removed');
                                      }}
                                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs px-2 py-1"
                                      title="Remove custom field"
                                    >
                                      Remove
                                    </button>
                                  </label>
                                ))}
                                
                                {/* Add Custom Field Button */}
                                <button
                                  onClick={() => setShowAddQaFieldModal(true)}
                                  className="w-full mt-2 px-3 py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Custom QA Field
                                </button>
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
                          onClick={() => {
                            if (qaPrintPreference === 'thermal') {
                              toast.success(`Generating thermal label for QA checklist: ${order.orderNumber}`);
                              // In production, this would send to thermal printer
                            } else {
                              // Generate paper QA checklist
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                  <head>
                                    <title>QA Checklist - ${order.orderNumber}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; padding: 20px; }
                                      h1 { color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 10px; }
                                      .info { margin: 20px 0; }
                                      .checklist { margin: 20px 0; }
                                      .item { margin: 15px 0; padding: 10px; border: 1px solid #ddd; }
                                      .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>Quality Assurance Checklist</h1>
                                    <div class="info">
                                      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                                      <p><strong>Customer:</strong> ${order.customerName}</p>
                                      <p><strong>Due Date:</strong> ${order.dueAt ? new Date(order.dueAt).toLocaleString() : 'N/A'}</p>
                                      <p><strong>Total Items:</strong> ${order.orderItems.length}</p>
                                    </div>
                                    <div class="checklist">
                                      <h2>Product Quality Checks:</h2>
                                      ${order.orderItems.map(item => `
                                        <div class="item">
                                          <h3>${item.productName} (Qty: ${item.quantity})</h3>
                                          <p><span class="checkbox"></span> Products match receipt</p>
                                          <p><span class="checkbox"></span> Packaging correct</p>
                                          <p><span class="checkbox"></span> Appearance of labels good</p>
                                          <p><span class="checkbox"></span> Product quality</p>
                                          ${customQaFields.map(field => `<p><span class="checkbox"></span> ${field}</p>`).join('')}
                                        </div>
                                      `).join('')}
                                    </div>
                                    <div style="margin-top: 40px;">
                                      <p><strong>Inspector Signature:</strong> _______________________________</p>
                                      <p><strong>Date/Time:</strong> ${new Date().toLocaleString()}</p>
                                    </div>
                                  </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                printWindow.print();
                              }
                              toast.success(`Printing QA checklist on paper for ${order.orderNumber}`);
                            }
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print QA Checklist ({qaPrintPreference === 'thermal' ? 'Thermal' : 'Paper'})
                        </Button>
                        <Button 
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            // Generate customer receipt
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                <head>
                                  <title>Receipt - ${order.orderNumber}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
                                    h1 { text-align: center; color: #5B6E02; }
                                    .receipt { border: 2px solid #5B6E02; padding: 20px; border-radius: 10px; }
                                    .thank-you { background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center; }
                                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                                    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                                    .total { font-size: 1.5em; font-weight: bold; color: #5B6E02; text-align: right; }
                                  </style>
                                </head>
                                <body>
                                  <div class="receipt">
                                    <h1>Order Receipt</h1>
                                    <p><strong>Order #:</strong> ${order.orderNumber}</p>
                                    <p><strong>Customer:</strong> ${order.customerName}</p>
                                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                                    ${order.dueAt ? `<p><strong>Pickup/Delivery:</strong> ${new Date(order.dueAt).toLocaleString()}</p>` : ''}
                                    <table>
                                      <thead>
                                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                      </thead>
                                      <tbody>
                                        ${order.orderItems.map(item => `
                                          <tr>
                                            <td>${item.productName}</td>
                                            <td>${item.quantity}</td>
                                            <td>$${item.unitPrice.toFixed(2)}</td>
                                            <td>$${item.total.toFixed(2)}</td>
                                          </tr>
                                        `).join('')}
                                      </tbody>
                                    </table>
                                    <p class="total">Total: $${order.total.toFixed(2)}</p>
                                  </div>
                                  <div class="thank-you">
                                    <h2>🎉 Thank You for Your Order!</h2>
                                    <p>We truly appreciate your support of our artisan craft. Every order helps us continue doing what we love. We hope you enjoy these handmade goods as much as we enjoyed creating them for you!</p>
                                    <p><em>Questions or concerns? Contact us anytime. We're here to help!</em></p>
                                  </div>
                                </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                            toast.success('Printing customer receipt...');
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Receipt
                        </Button>
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setOrders(prevOrders => 
                              prevOrders.map(o => 
                                o.id === order.id 
                                  ? { ...o, status: 'DELIVERED' }
                                  : o
                              )
                            );
                            toast.success(`Order ${order.orderNumber} marked as QA approved and delivered!`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          QA Approved
                        </Button>
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            setSelectedOrderForRework(order);
                            setShowReworkModal(true);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Send Back to Production
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

                {/* Add Custom QA Field Modal */}
                {showAddQaFieldModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg shadow-xl max-w-md w-full"
                    >
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold mb-1">Add Custom QA Field</h2>
                            <p className="text-purple-100 text-sm">Create a custom quality check for your workflow</p>
                          </div>
                          <button
                            onClick={() => {
                              setShowAddQaFieldModal(false);
                              setNewQaFieldText('');
                            }}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Close"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {/* Existing Custom Fields */}
                        {customQaFields.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Custom Fields ({customQaFields.length})
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {customQaFields.map((field, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
                                  <span className="text-sm text-gray-800">✓ {field}</span>
                                  <button
                                    onClick={() => {
                                      setCustomQaFields(prev => prev.filter((_, i) => i !== idx));
                                      toast.success('Custom field removed');
                                    }}
                                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add New Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add New QA Check
                          </label>
                          <input
                            type="text"
                            value={newQaFieldText}
                            onChange={(e) => setNewQaFieldText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newQaFieldText.trim()) {
                                setCustomQaFields(prev => [...prev, newQaFieldText.trim()]);
                                toast.success('Custom QA field added!');
                                setNewQaFieldText('');
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Temperature within range, Special dietary verified"
                            autoFocus
                          />
                          <p className="text-xs text-gray-500 mt-1">Press Enter or click "Add Field" to save</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900">
                            <strong>💡 Tip:</strong> Custom QA fields will be added to all QA checklists and appear in printed checklists. 
                            You can add multiple fields specific to your products (e.g., temperature checks, allergen verification).
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border-t p-6 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">
                          {customQaFields.length} custom field{customQaFields.length !== 1 ? 's' : ''} configured
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setShowAddQaFieldModal(false);
                              setNewQaFieldText('');
                            }}
                          >
                            Done
                          </Button>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              if (!newQaFieldText.trim()) {
                                toast.error('Please enter a QA field description');
                                return;
                              }
                              setCustomQaFields(prev => [...prev, newQaFieldText.trim()]);
                              toast.success('Custom QA field added!');
                              setNewQaFieldText('');
                            }}
                            disabled={!newQaFieldText.trim()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
                </>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

        {/* Manage Production Steps Modal */}
        {showManageStepsModal && editingStepProductId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Manage Production Steps</h2>
                    <p className="text-purple-100 text-sm">Customize the production workflow for this product</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowManageStepsModal(false);
                      setEditingStepProductId(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Current Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Production Steps ({getProductionStepsForProduct(editingStepProductId).length})
                  </label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getProductionStepsForProduct(editingStepProductId).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => {
                              const updatedSteps = [...getProductionStepsForProduct(editingStepProductId)];
                              updatedSteps[idx] = { ...step, name: e.target.value };
                              setCustomProductionSteps(prev => ({
                                ...prev,
                                [editingStepProductId]: updatedSteps
                              }));
                            }}
                            className="w-full font-semibold text-gray-900 px-2 py-1 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                            placeholder="Step name"
                          />
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => {
                              const updatedSteps = [...getProductionStepsForProduct(editingStepProductId)];
                              updatedSteps[idx] = { ...step, description: e.target.value };
                              setCustomProductionSteps(prev => ({
                                ...prev,
                                [editingStepProductId]: updatedSteps
                              }));
                            }}
                            className="w-full text-sm text-gray-700 px-2 py-1 border border-gray-300 rounded focus:border-purple-400 focus:outline-none"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={step.estimatedDuration}
                              onChange={(e) => {
                                const updatedSteps = [...getProductionStepsForProduct(editingStepProductId)];
                                updatedSteps[idx] = { ...step, estimatedDuration: parseInt(e.target.value) || 0 };
                                setCustomProductionSteps(prev => ({
                                  ...prev,
                                  [editingStepProductId]: updatedSteps
                                }));
                              }}
                              className="w-24 text-xs px-2 py-1 border border-gray-300 rounded focus:border-purple-400 focus:outline-none"
                              placeholder="Duration"
                            />
                            <span className="text-xs text-gray-600">minutes</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedSteps = getProductionStepsForProduct(editingStepProductId)
                              .filter((_, i) => i !== idx)
                              .map((s, i) => ({ ...s, stepNumber: i + 1 }));
                            setCustomProductionSteps(prev => ({
                              ...prev,
                              [editingStepProductId]: updatedSteps
                            }));
                            toast.success('Step removed');
                          }}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Remove step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Step */}
                <button
                  onClick={() => {
                    const currentSteps = getProductionStepsForProduct(editingStepProductId);
                    const newStep: ProductionStep = {
                      stepNumber: currentSteps.length + 1,
                      name: 'Custom Step',
                      description: 'Add description here',
                      status: 'pending',
                      estimatedDuration: 30
                    };
                    setCustomProductionSteps(prev => ({
                      ...prev,
                      [editingStepProductId]: [...currentSteps, newStep]
                    }));
                    toast.success('Custom step added - click to edit');
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Production Step
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>💡 Tip:</strong> Customize steps for each product. Edit names, descriptions, and durations. 
                    Add custom steps for unique workflows. Remove unnecessary default steps. Changes are saved automatically.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border-t p-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    // Reset to defaults
                    const updatedSteps = { ...customProductionSteps };
                    delete updatedSteps[editingStepProductId];
                    setCustomProductionSteps(updatedSteps);
                    toast.success('Reset to default 6-step production workflow');
                  }}
                  className="text-sm text-red-600 hover:text-red-800 underline font-medium"
                >
                  Reset to Default Steps
                </button>
                <div className="flex gap-3">
                  <span className="text-sm text-gray-600">
                    {getProductionStepsForProduct(editingStepProductId).length} steps configured
                  </span>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setShowManageStepsModal(false);
                      setEditingStepProductId(null);
                      toast.success('Production steps updated!');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save & Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
            
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
                  <div className="bg-white rounded-lg p-4 space-y-2 border border-gray-200">
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
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(viewingOrder.status)}>
                          {viewingOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <span className="text-sm text-gray-600">Priority</span>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(viewingOrder.priority)}>
                          {viewingOrder.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <p className="font-medium text-gray-900 mt-1">{viewingOrder.paymentStatus}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                      <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
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

        {/* Advanced Label Generator */}
        {showLabelModal && (
          <AdvancedLabelGenerator
            isOpen={showLabelModal}
            onClose={() => {
              setShowLabelModal(false);
              setSelectedOrderForLabel(null);
            }}
            orders={selectedOrderForLabel ? [selectedOrderForLabel] : orders}
            onPrintComplete={(jobIds) => {
              toast.success(`Label generation complete! ${jobIds.length} print jobs created.`);
              setShowLabelModal(false);
              setSelectedOrderForLabel(null);
            }}
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

        {/* Rework Modal */}
        {showReworkModal && selectedOrderForRework && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Send Back to Production</h3>
                  <p className="text-sm text-gray-600 mt-1">Order: {selectedOrderForRework.orderNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowReworkModal(false);
                    setReworkNotes('');
                    setSelectedOrderForRework(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Issue Found</h4>
                      <p className="text-sm text-red-700">
                        This order will be sent back to production for rework. Please provide details about what needs to be fixed.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rework Notes *
                  </label>
                  <textarea
                    value={reworkNotes}
                    onChange={(e) => setReworkNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Describe what needs to be fixed or redone..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setShowReworkModal(false);
                      setReworkNotes('');
                      setSelectedOrderForRework(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!reworkNotes.trim()) {
                        toast.error('Please provide rework notes');
                        return;
                      }
                      sendBackToProduction(selectedOrderForRework, reworkNotes);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Send Back to Production
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Edit Modal */}
        {orderToEdit && (
          <OrderEditModal
            order={orderToEdit}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setOrderToEdit(null);
            }}
            onSave={handleOrderModification}
          />
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage;
