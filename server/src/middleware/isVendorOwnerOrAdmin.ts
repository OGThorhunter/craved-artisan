import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const isVendorOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req.session as any;
    const { vendorId } = req.params;

    if (!user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User not authenticated" 
      });
    }

    // Check if vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, userId: true }
    });

    if (!vendor) {
      return res.status(404).json({ 
        error: "Vendor not found",
        message: "Vendor does not exist" 
      });
    }

    // Allow access if user is ADMIN or the vendor owner
    if (user.role === "ADMIN" || user.id === vendor.userId) {
      return next();
    }

    return res.status(403).json({ 
      error: "Access denied",
      message: "You don't have permission to access this vendor's financial data" 
    });
  } catch (error) {
    console.error('Error in isVendorOwnerOrAdmin middleware:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to verify access permissions" 
    });
  }
}; 