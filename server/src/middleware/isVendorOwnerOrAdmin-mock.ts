import { Request, Response, NextFunction } from 'express';

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

    // Mock vendor data - in real implementation this would come from database
    const mockVendors = [
      { id: 'vendor-1', userId: 'user-1' },
      { id: 'vendor-2', userId: 'user-2' },
      { id: 'vendor-3', userId: 'user-3' }
    ];

    const vendor = mockVendors.find(v => v.id === vendorId);

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
    console.error('Error in isVendorOwnerOrAdmin mock middleware:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to verify access permissions" 
    });
  }
}; 