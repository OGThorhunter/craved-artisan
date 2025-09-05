import { Router } from 'express';
import { logger } from '../logger';
import multer from 'multer';
import path from 'path';

export const aiReceiptParserRouter = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and text files are allowed.'));
    }
  },
});

// Interfaces for receipt parsing
interface ParsedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods' | 'unknown';
  confidence: number; // 0-100
  lineNumber?: number;
  rawText?: string;
}

interface ParsedReceipt {
  id: string;
  storeName?: string;
  storeAddress?: string;
  receiptDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  items: ParsedItem[];
  rawText: string;
  confidence: number; // Overall confidence score
  processingTime: number; // in milliseconds
  createdAt: string;
}

interface ParsedShoppingList {
  id: string;
  title?: string;
  items: ParsedItem[];
  estimatedTotal?: number;
  rawText: string;
  confidence: number;
  processingTime: number;
  createdAt: string;
}

interface ParsingResult {
  success: boolean;
  data?: ParsedReceipt | ParsedShoppingList;
  error?: string;
  suggestions?: string[];
}

// Mock AI parsing function - in production, this would call OpenAI, Google Vision, or similar
const mockAIParseReceipt = async (text: string, imageData?: Buffer): Promise<ParsedReceipt> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock receipt data based on common patterns
  const mockReceipts = [
    {
      storeName: "Whole Foods Market",
      storeAddress: "123 Main St, Boulder, CO 80301",
      receiptDate: new Date().toISOString(),
      totalAmount: 45.67,
      taxAmount: 3.42,
      items: [
        {
          id: "item-1",
          name: "Organic All-Purpose Flour",
          quantity: 2,
          unit: "bag",
          price: 4.99,
          totalPrice: 9.98,
          category: "food_grade" as const,
          confidence: 95,
          lineNumber: 1,
          rawText: "Organic All-Purpose Flour 2 @ $4.99"
        },
        {
          id: "item-2",
          name: "Active Dry Yeast",
          quantity: 1,
          unit: "packet",
          price: 2.49,
          totalPrice: 2.49,
          category: "food_grade" as const,
          confidence: 92,
          lineNumber: 2,
          rawText: "Active Dry Yeast 1 @ $2.49"
        },
        {
          id: "item-3",
          name: "Extra Virgin Olive Oil",
          quantity: 1,
          unit: "bottle",
          price: 12.99,
          totalPrice: 12.99,
          category: "food_grade" as const,
          confidence: 88,
          lineNumber: 3,
          rawText: "Extra Virgin Olive Oil 1 @ $12.99"
        },
        {
          id: "item-4",
          name: "Himalayan Pink Salt",
          quantity: 1,
          unit: "jar",
          price: 8.99,
          totalPrice: 8.99,
          category: "food_grade" as const,
          confidence: 90,
          lineNumber: 4,
          rawText: "Himalayan Pink Salt 1 @ $8.99"
        },
        {
          id: "item-5",
          name: "Custom Gift Boxes",
          quantity: 10,
          unit: "piece",
          price: 0.75,
          totalPrice: 7.50,
          category: "packaging" as const,
          confidence: 85,
          lineNumber: 5,
          rawText: "Custom Gift Boxes 10 @ $0.75"
        }
      ]
    },
    {
      storeName: "Home Depot",
      storeAddress: "456 Oak Ave, Denver, CO 80202",
      receiptDate: new Date().toISOString(),
      totalAmount: 78.45,
      taxAmount: 5.89,
      items: [
        {
          id: "item-6",
          name: "Oak Wood Planks",
          quantity: 4,
          unit: "piece",
          price: 22.00,
          totalPrice: 88.00,
          category: "raw_materials" as const,
          confidence: 93,
          lineNumber: 1,
          rawText: "Oak Wood Planks 4 @ $22.00"
        },
        {
          id: "item-7",
          name: "Steel Screws",
          quantity: 1,
          unit: "box",
          price: 12.99,
          totalPrice: 12.99,
          category: "raw_materials" as const,
          confidence: 87,
          lineNumber: 2,
          rawText: "Steel Screws 1 @ $12.99"
        }
      ]
    }
  ];
  
  // Select a random mock receipt
  const selectedReceipt = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
  
  return {
    id: `receipt-${Date.now()}`,
    ...selectedReceipt,
    items: selectedReceipt.items.map(item => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    rawText: text,
    confidence: 85 + Math.random() * 10, // 85-95% confidence
    processingTime: 2000,
    createdAt: new Date().toISOString()
  };
};

const mockAIParseShoppingList = async (text: string): Promise<ParsedShoppingList> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock shopping list parsing
  const mockShoppingLists = [
    {
      title: "Weekly Grocery Shopping",
      items: [
        {
          id: "item-1",
          name: "All-Purpose Flour",
          quantity: 3,
          unit: "bag",
          price: 0, // Shopping lists typically don't have prices
          totalPrice: 0,
          category: "food_grade" as const,
          confidence: 92,
          rawText: "3 bags of all-purpose flour"
        },
        {
          id: "item-2",
          name: "Active Dry Yeast",
          quantity: 2,
          unit: "packet",
          price: 0,
          totalPrice: 0,
          category: "food_grade" as const,
          confidence: 88,
          rawText: "2 packets of active dry yeast"
        },
        {
          id: "item-3",
          name: "Olive Oil",
          quantity: 1,
          unit: "bottle",
          price: 0,
          totalPrice: 0,
          category: "food_grade" as const,
          confidence: 90,
          rawText: "1 bottle of olive oil"
        }
      ],
      estimatedTotal: 0
    },
    {
      title: "Craft Supplies",
      items: [
        {
          id: "item-4",
          name: "Oak Planks",
          quantity: 6,
          unit: "piece",
          price: 0,
          totalPrice: 0,
          category: "raw_materials" as const,
          confidence: 95,
          rawText: "6 oak planks for furniture"
        },
        {
          id: "item-5",
          name: "Steel Brackets",
          quantity: 12,
          unit: "piece",
          price: 0,
          totalPrice: 0,
          category: "raw_materials" as const,
          confidence: 87,
          rawText: "12 steel brackets"
        },
        {
          id: "item-6",
          name: "Gift Boxes",
          quantity: 20,
          unit: "piece",
          price: 0,
          totalPrice: 0,
          category: "packaging" as const,
          confidence: 89,
          rawText: "20 gift boxes"
        }
      ],
      estimatedTotal: 0
    }
  ];
  
  const selectedList = mockShoppingLists[Math.floor(Math.random() * mockShoppingLists.length)];
  
  return {
    id: `shopping-list-${Date.now()}`,
    ...selectedList,
    items: selectedList.items.map(item => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    rawText: text,
    confidence: 80 + Math.random() * 15, // 80-95% confidence
    processingTime: 1500,
    createdAt: new Date().toISOString()
  };
};

// In-memory storage for parsed documents (in production, use database)
let parsedReceipts: ParsedReceipt[] = [];
let parsedShoppingLists: ParsedShoppingList[] = [];

// POST /api/ai-receipt-parser/parse-receipt - Parse receipt from text or image
aiReceiptParserRouter.post('/ai-receipt-parser/parse-receipt', upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageFile = req.file;
    
    if (!text && !imageFile) {
      return res.status(400).json({ error: 'Either text or image file is required' });
    }
    
    logger.info('Starting receipt parsing', { 
      hasText: !!text, 
      hasImage: !!imageFile,
      imageSize: imageFile?.size 
    });
    
    let inputText = text || '';
    
    // If image is provided, simulate OCR text extraction
    if (imageFile) {
      // In production, this would use OCR (Tesseract, Google Vision, etc.)
      inputText = `
        WHOLE FOODS MARKET
        123 Main St, Boulder, CO 80301
        Date: ${new Date().toLocaleDateString()}
        
        Organic All-Purpose Flour 2 @ $4.99     $9.98
        Active Dry Yeast 1 @ $2.49              $2.49
        Extra Virgin Olive Oil 1 @ $12.99       $12.99
        Himalayan Pink Salt 1 @ $8.99           $8.99
        Custom Gift Boxes 10 @ $0.75            $7.50
        
        Subtotal: $42.25
        Tax: $3.42
        Total: $45.67
      `;
    }
    
    const parsedReceipt = await mockAIParseReceipt(inputText, imageFile?.buffer);
    parsedReceipts.push(parsedReceipt);
    
    logger.info('Receipt parsing completed', { 
      receiptId: parsedReceipt.id,
      itemsCount: parsedReceipt.items.length,
      confidence: parsedReceipt.confidence
    });
    
    res.json({
      success: true,
      data: parsedReceipt,
      message: 'Receipt parsed successfully'
    });
    
  } catch (error) {
    logger.error('Error parsing receipt:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to parse receipt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/ai-receipt-parser/parse-shopping-list - Parse shopping list from text
aiReceiptParserRouter.post('/ai-receipt-parser/parse-shopping-list', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    logger.info('Starting shopping list parsing', { textLength: text.length });
    
    const parsedList = await mockAIParseShoppingList(text);
    parsedShoppingLists.push(parsedList);
    
    logger.info('Shopping list parsing completed', { 
      listId: parsedList.id,
      itemsCount: parsedList.items.length,
      confidence: parsedList.confidence
    });
    
    res.json({
      success: true,
      data: parsedList,
      message: 'Shopping list parsed successfully'
    });
    
  } catch (error) {
    logger.error('Error parsing shopping list:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to parse shopping list',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ai-receipt-parser/receipts - Get all parsed receipts
aiReceiptParserRouter.get('/ai-receipt-parser/receipts', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const limitedReceipts = parsedReceipts
      .slice(Number(offset), Number(offset) + Number(limit))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      receipts: limitedReceipts,
      total: parsedReceipts.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// GET /api/ai-receipt-parser/shopping-lists - Get all parsed shopping lists
aiReceiptParserRouter.get('/ai-receipt-parser/shopping-lists', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const limitedLists = parsedShoppingLists
      .slice(Number(offset), Number(offset) + Number(limit))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      shoppingLists: limitedLists,
      total: parsedShoppingLists.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Error fetching shopping lists:', error);
    res.status(500).json({ error: 'Failed to fetch shopping lists' });
  }
});

// GET /api/ai-receipt-parser/receipts/:id - Get specific receipt
aiReceiptParserRouter.get('/ai-receipt-parser/receipts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const receipt = parsedReceipts.find(r => r.id === id);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ receipt });
  } catch (error) {
    logger.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// GET /api/ai-receipt-parser/shopping-lists/:id - Get specific shopping list
aiReceiptParserRouter.get('/ai-receipt-parser/shopping-lists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = parsedShoppingLists.find(l => l.id === id);
    
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }
    
    res.json({ shoppingList: list });
  } catch (error) {
    logger.error('Error fetching shopping list:', error);
    res.status(500).json({ error: 'Failed to fetch shopping list' });
  }
});

// POST /api/ai-receipt-parser/import-to-inventory - Import parsed items to inventory
aiReceiptParserRouter.post('/ai-receipt-parser/import-to-inventory', async (req, res) => {
  try {
    const { receiptId, shoppingListId, selectedItems } = req.body;
    
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ error: 'Selected items are required' });
    }
    
    // Find the source document
    let sourceDoc: ParsedReceipt | ParsedShoppingList | undefined;
    if (receiptId) {
      sourceDoc = parsedReceipts.find(r => r.id === receiptId);
    } else if (shoppingListId) {
      sourceDoc = parsedShoppingLists.find(l => l.id === shoppingListId);
    }
    
    if (!sourceDoc) {
      return res.status(404).json({ error: 'Source document not found' });
    }
    
    // Process selected items for inventory import
    const importedItems = selectedItems.map((itemId: string) => {
      const item = sourceDoc!.items.find(i => i.id === itemId);
      if (!item) return null;
      
      return {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        description: `Imported from ${receiptId ? 'receipt' : 'shopping list'}`,
        category: item.category,
        unit: item.unit,
        currentStock: item.quantity,
        reorderPoint: Math.max(1, Math.floor(item.quantity * 0.2)), // 20% of quantity
        costPerUnit: item.price || 0,
        supplier: sourceDoc!.storeName || 'Unknown',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }).filter(Boolean);
    
    logger.info('Importing items to inventory', { 
      sourceType: receiptId ? 'receipt' : 'shopping list',
      sourceId: receiptId || shoppingListId,
      itemsCount: importedItems.length
    });
    
    // In production, this would save to the actual inventory database
    // For now, we'll just return the processed items
    
    res.json({
      success: true,
      importedItems,
      message: `${importedItems.length} items imported to inventory successfully`
    });
    
  } catch (error) {
    logger.error('Error importing to inventory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to import items to inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ai-receipt-parser/analytics - Get parsing analytics
aiReceiptParserRouter.get('/ai-receipt-parser/analytics', (req, res) => {
  try {
    const totalReceipts = parsedReceipts.length;
    const totalShoppingLists = parsedShoppingLists.length;
    const totalItems = [
      ...parsedReceipts.flatMap(r => r.items),
      ...parsedShoppingLists.flatMap(l => l.items)
    ].length;
    
    const avgConfidence = [
      ...parsedReceipts.map(r => r.confidence),
      ...parsedShoppingLists.map(l => l.confidence)
    ].reduce((sum, conf) => sum + conf, 0) / (totalReceipts + totalShoppingLists) || 0;
    
    const categoryBreakdown = totalItems > 0 ? {
      food_grade: totalItems.filter(item => item.category === 'food_grade').length,
      raw_materials: totalItems.filter(item => item.category === 'raw_materials').length,
      packaging: totalItems.filter(item => item.category === 'packaging').length,
      used_goods: totalItems.filter(item => item.category === 'used_goods').length,
      unknown: totalItems.filter(item => item.category === 'unknown').length
    } : {};
    
    const recentActivity = {
      receiptsLast7Days: parsedReceipts.filter(r => 
        new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      shoppingListsLast7Days: parsedShoppingLists.filter(l => 
        new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
    
    res.json({
      overview: {
        totalReceipts,
        totalShoppingLists,
        totalItems,
        avgConfidence: Math.round(avgConfidence * 100) / 100
      },
      categoryBreakdown,
      recentActivity,
      performance: {
        avgProcessingTime: {
          receipts: parsedReceipts.length > 0 
            ? parsedReceipts.reduce((sum, r) => sum + r.processingTime, 0) / parsedReceipts.length 
            : 0,
          shoppingLists: parsedShoppingLists.length > 0 
            ? parsedShoppingLists.reduce((sum, l) => sum + l.processingTime, 0) / parsedShoppingLists.length 
            : 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// DELETE /api/ai-receipt-parser/receipts/:id - Delete receipt
aiReceiptParserRouter.delete('/ai-receipt-parser/receipts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = parsedReceipts.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    parsedReceipts.splice(index, 1);
    
    res.json({ 
      success: true,
      message: 'Receipt deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting receipt:', error);
    res.status(500).json({ error: 'Failed to delete receipt' });
  }
});

// DELETE /api/ai-receipt-parser/shopping-lists/:id - Delete shopping list
aiReceiptParserRouter.delete('/ai-receipt-parser/shopping-lists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = parsedShoppingLists.findIndex(l => l.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }
    
    parsedShoppingLists.splice(index, 1);
    
    res.json({ 
      success: true,
      message: 'Shopping list deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting shopping list:', error);
    res.status(500).json({ error: 'Failed to delete shopping list' });
  }
});
