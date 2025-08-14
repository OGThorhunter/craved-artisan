import prisma, { OrderStatus, TaxAlertType, WalletTransactionType } from '../lib/prisma';

export interface WalletTransaction {
  id: string;
  vendorId: string;
  type: WalletTransactionType.DEBIT | WalletTransactionType.CREDIT;
  source: string;
  amount: number;
  description?: string;
  referenceId?: string;
  metadata?: any;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  vendorId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabelPrintRequest {
  vendorId: string;
  type: 'shipping' | 'inventory' | 'tax_doc' | 'custom';
  quantity: number;
  labelData: any;
  metadata?: any;
}

export interface LabelPrint {
  id: string;
  vendorId: string;
  type: WalletTransactionType;
  quantity: number;
  cost: number;
  status: string;
  fileUrl?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get or create wallet for a vendor
 */
export async function getOrCreateWallet(vendorId: string): Promise<Wallet> {
  let wallet = await prisma.wallet.findUnique({
    where: { vendorId }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        vendorId,
        balance: 0
      }
    });
  }

  return wallet;
}

/**
 * Get wallet balance for a vendor
 */
export async function getWalletBalance(vendorId: string): Promise<number> {
  const wallet = await getOrCreateWallet(vendorId);
  return wallet.balance;
}

/**
 * Add funds to wallet
 */
export async function addFundsToWallet(
  vendorId: string,
  amount: number,
  source: string,
  description?: string,
  referenceId?: string,
  metadata?: any
): Promise<WalletTransaction> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const transaction = await prisma.$transaction(async (tx) => {
    // Get or create wallet
    let wallet = await tx.wallet.findUnique({
      where: { vendorId }
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          vendorId,
          balance: 0
        }
      });
    }

    // Create transaction record
    const transaction = await tx.walletTransaction.create({
      data: {
        vendorId,
        type: WalletTransactionType.CREDIT,
        source,
        amount,
        description,
        referenceId,
        metadata
      }
    });

    // Update wallet balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + amount }
    });

    return transaction;
  });

  return transaction;
}

/**
 * Deduct funds from wallet
 */
export async function deductFundsFromWallet(
  vendorId: string,
  amount: number,
  source: string,
  description?: string,
  referenceId?: string,
  metadata?: any
): Promise<WalletTransaction> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const transaction = await prisma.$transaction(async (tx) => {
    // Get wallet
    const wallet = await tx.wallet.findUnique({
      where: { vendorId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Create transaction record
    const transaction = await tx.walletTransaction.create({
      data: {
        vendorId,
        type: WalletTransactionType.DEBIT,
        source,
        amount,
        description,
        referenceId,
        metadata
      }
    });

    // Update wallet balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - amount }
    });

    return transaction;
  });

  return transaction;
}

/**
 * Get wallet transactions for a vendor
 */
export async function getWalletTransactions(
  vendorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WalletTransaction[]> {
  const transactions = await prisma.walletTransaction.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  return transactions;
}

/**
 * Calculate label print cost based on type and quantity
 */
export function calculateLabelCost(type: string, quantity: number): number {
  const baseCosts = {
    shipping: 0.25,
    inventory: 0.15,
    tax_doc: 0.10,
    custom: 0.30
  };

  const baseCost = baseCosts[type as keyof typeof baseCosts] || 0.25;
  return baseCost * quantity;
}

/**
 * Process label print request with wallet deduction
 */
export async function processLabelPrint(request: LabelPrintRequest): Promise<LabelPrint> {
  const { vendorId, type, quantity, labelData, metadata } = request;
  const cost = calculateLabelCost(type, quantity);

  // Check wallet balance
  const balance = await getWalletBalance(vendorId);
  if (balance < cost) {
    throw new Error('Insufficient wallet balance for label printing');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create label print record
    const labelPrint = await tx.labelPrint.create({
      data: {
        vendorId,
        type,
        quantity,
        cost,
        status: 'processing',
        metadata: {
          ...metadata,
          labelData
        }
      }
    });

    // Deduct funds from wallet
    await tx.walletTransaction.create({
      data: {
        vendorId,
        type: WalletTransactionType.DEBIT,
        source: 'Label Print',
        amount: cost,
        description: `${type} label print (${quantity} labels)`,
        referenceId: labelPrint.id,
        metadata: {
          labelType: type,
          quantity,
          labelPrintId: labelPrint.id
        }
      }
    });

    // Update wallet balance
    await tx.wallet.update({
      where: { vendorId },
      data: { balance: balance - cost }
    });

    return labelPrint;
  });

  return result;
}

/**
 * Generate label file (placeholder - would integrate with actual label service)
 */
export async function generateLabelFile(labelPrintId: string): Promise<string> {
  // This would integrate with an actual label generation service
  // For now, we'll simulate the process
  
  const labelPrint = await prisma.labelPrint.findUnique({
    where: { id: labelPrintId }
  });

  if (!labelPrint) {
    throw new Error('Label print not found');
  }

  // Simulate label generation
  const fileUrl = `https://api.craved-artisan.com/labels/${labelPrintId}.pdf`;

  // Update label print status
  await prisma.labelPrint.update({
    where: { id: labelPrintId },
    data: {
      status: FulfillmentStatus.COMPLETED,
      fileUrl
    }
  });

  return fileUrl;
}

/**
 * Get label print history for a vendor
 */
export async function getLabelPrintHistory(
  vendorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<LabelPrint[]> {
  const labelPrints = await prisma.labelPrint.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  return labelPrints;
}

/**
 * Get label print statistics for a vendor
 */
export async function getLabelPrintStats(vendorId: string, startDate?: Date, endDate?: Date) {
  const whereClause: any = { vendorId };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  const stats = await prisma.labelPrint.groupBy({
    by: ['type'],
    where: whereClause,
    _sum: {
      quantity: true,
      cost: true
    },
    _count: {
      id: true
    }
  });

  const totalCost = await prisma.labelPrint.aggregate({
    where: whereClause,
    _sum: {
      cost: true
    }
  });

  return {
    byType: stats,
    totalCost: totalCost._sum.cost || 0
  };
}

/**
 * Refund label print cost (for failed prints)
 */
export async function refundLabelPrint(labelPrintId: string): Promise<WalletTransaction> {
  const labelPrint = await prisma.labelPrint.findUnique({
    where: { id: labelPrintId }
  });

  if (!labelPrint) {
    throw new Error('Label print not found');
  }

  if (labelPrint.status !== FulfillmentStatus.FAILED) {
    throw new Error('Can only refund failed label prints');
  }

  // Add refund to wallet
  const transaction = await addFundsToWallet(
    labelPrint.vendorId,
    labelPrint.cost,
    'Label Print Refund',
    `Refund for failed ${labelPrint.type} label print`,
    labelPrintId,
    {
      originalLabelPrintId: labelPrintId,
      originalCost: labelPrint.cost
    }
  );

  return transaction;
} 
