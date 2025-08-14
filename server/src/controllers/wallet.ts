import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  getOrCreateWallet,
  getWalletBalance,
  addFundsToWallet,
  deductFundsFromWallet,
  getWalletTransactions,
  processLabelPrint,
  generateLabelFile,
  getLabelPrintHistory,
  getLabelPrintStats,
  refundLabelPrint,
  calculateLabelCost,
  LabelPrintRequest
} from '../utils/walletService';

/**
 * Get wallet balance for a vendor
 */
export const getWalletBalanceController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const balance = await getWalletBalance(vendorId);

    res.json({
      success: true,
      balance
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get wallet balance'
    });
  }
};

/**
 * Get wallet transactions for a vendor
 */
export const getWalletTransactionsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const transactions = await getWalletTransactions(
      vendorId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get wallet transactions'
    });
  }
};

/**
 * Add funds to wallet (admin only)
 */
export const addFundsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { amount, source, description, referenceId, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be positive'
      });
    }

    const transaction = await addFundsToWallet(
      vendorId,
      amount,
      source,
      description,
      referenceId,
      metadata
    );

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add funds to wallet'
    });
  }
};

/**
 * Calculate label print cost
 */
export const calculateLabelCostController = async (req: Request, res: Response) => {
  try {
    const { type, quantity } = req.query;

    if (!type || !quantity) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'type and quantity are required'
      });
    }

    const cost = calculateLabelCost(type as string, parseInt(quantity as string));

    res.json({
      success: true,
      cost,
      type,
      quantity: parseInt(quantity as string)
    });
  } catch (error) {
    console.error('Error calculating label cost:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate label cost'
    });
  }
};

/**
 * Process label print request
 */
export const processLabelPrintController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { type, quantity, labelData, metadata } = req.body;

    if (!type || !quantity || !labelData) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'type, quantity, and labelData are required'
      });
    }

    const request: LabelPrintRequest = {
      vendorId,
      type,
      quantity,
      labelData,
      metadata
    };

    const labelPrint = await processLabelPrint(request);

    // Generate label file asynchronously
    generateLabelFile(labelPrint.id).catch(error => {
      console.error('Error generating label file:', error);
    });

    res.json({
      success: true,
      labelPrint
    });
  } catch (error: any) {
    console.error('Error processing label print:', error);
    
    if (error.message === 'Insufficient wallet balance for label printing') {
      return res.status(402).json({
        error: 'Insufficient wallet balance',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process label print'
    });
  }
};

/**
 * Get label print status
 */
export const getLabelPrintStatusController = async (req: Request, res: Response) => {
  try {
    const { labelPrintId } = req.params;

    const labelPrint = await prisma.labelPrint.findUnique({
      where: { id: labelPrintId }
    });

    if (!labelPrint) {
      return res.status(404).json({
        error: 'Label print not found',
        message: 'Label print does not exist'
      });
    }

    res.json({
      success: true,
      labelPrint
    });
  } catch (error) {
    console.error('Error getting label print status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get label print status'
    });
  }
};

/**
 * Download label file
 */
export const downloadLabelFileController = async (req: Request, res: Response) => {
  try {
    const { labelPrintId } = req.params;

    const labelPrint = await prisma.labelPrint.findUnique({
      where: { id: labelPrintId }
    });

    if (!labelPrint) {
      return res.status(404).json({
        error: 'Label print not found',
        message: 'Label print does not exist'
      });
    }

    if (labelPrint.status !== 'completed' || !labelPrint.fileUrl) {
      return res.status(400).json({
        error: 'Label not ready',
        message: 'Label is still being processed or failed'
      });
    }

    // In a real implementation, you would stream the file from storage
    // For now, we'll redirect to the file URL
    res.json({
      success: true,
      downloadUrl: labelPrint.fileUrl
    });
  } catch (error) {
    console.error('Error downloading label file:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to download label file'
    });
  }
};

/**
 * Get label print history for a vendor
 */
export const getLabelPrintHistoryController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const labelPrints = await getLabelPrintHistory(
      vendorId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      labelPrints
    });
  } catch (error) {
    console.error('Error getting label print history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get label print history'
    });
  }
};

/**
 * Get label print statistics for a vendor
 */
export const getLabelPrintStatsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate as string);
    }
    if (endDate) {
      end = new Date(endDate as string);
    }

    const stats = await getLabelPrintStats(vendorId, start, end);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting label print stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get label print statistics'
    });
  }
};

/**
 * Refund label print (admin only)
 */
export const refundLabelPrintController = async (req: Request, res: Response) => {
  try {
    const { labelPrintId } = req.params;

    const transaction = await refundLabelPrint(labelPrintId);

    res.json({
      success: true,
      transaction
    });
  } catch (error: any) {
    console.error('Error refunding label print:', error);
    
    if (error.message.includes('not found') || error.message.includes('failed')) {
      return res.status(400).json({
        error: 'Invalid refund request',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to refund label print'
    });
  }
};

/**
 * Export label print history as CSV
 */
export const exportLabelPrintHistoryController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate as string);
    }
    if (endDate) {
      end = new Date(endDate as string);
    }

    const whereClause: any = { vendorId };
    if (start || end) {
      whereClause.createdAt = {};
      if (start) whereClause.createdAt.gte = start;
      if (end) whereClause.createdAt.lte = end;
    }

    const labelPrints = await prisma.labelPrint.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Convert to CSV format
    const csvHeader = 'ID,Type,Quantity,Cost,Status,Created At,File URL\n';
    const csvRows = labelPrints.map(print => 
      `${print.id},${print.type},${print.quantity},${print.cost},${print.status},${print.createdAt.toISOString()},${print.fileUrl || ''}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="label-prints-${vendorId}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting label print history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export label print history'
    });
  }
}; 