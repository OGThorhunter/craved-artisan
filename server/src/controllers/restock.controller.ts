import { Request, Response } from 'express';
import { restockSuggestions } from '../services/restock.service';

export async function getSuggestions(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { lookbackDays } = req.query;
  
  try {
    const suggestions = await restockSuggestions(vendorId, {
      lookbackDays: lookbackDays ? parseInt(lookbackDays as string) : undefined
    });
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting restock suggestions:', error);
    res.status(500).json({ error: 'Failed to get restock suggestions' });
  }
}

export async function createPO(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { supplierId, lines } = req.body;
  
  try {
    // Generate a PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // For now, just return the PO details (you can wire Supplier later)
    const purchaseOrder = {
      poNumber,
      vendorId,
      supplierId: supplierId || null,
      lines: lines || [],
      status: 'draft',
      createdAt: new Date(),
      totalAmount: lines?.reduce((sum: number, line: any) => sum + (line.quantity * line.unitCost), 0) || 0
    };
    
    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
}
