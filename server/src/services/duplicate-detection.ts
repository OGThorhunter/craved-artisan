import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

interface DuplicateMatch {
  userId: string;
  email: string;
  name: string;
  matchType: 'EMAIL' | 'PHONE' | 'DEVICE' | 'NAME_SIMILARITY';
  confidence: number; // 0-1
  matchedValue: string;
}

interface MergePreview {
  primaryUser: {
    id: string;
    email: string;
    name: string;
    created_at: Date;
  };
  duplicateUser: {
    id: string;
    email: string;
    name: string;
    created_at: Date;
  };
  dataToMerge: {
    orders: number;
    roles: number;
    notes: number;
    tasks: number;
    riskFlags: number;
    securityEvents: number;
  };
  conflicts: string[];
}

/**
 * Service for detecting and merging duplicate user accounts
 */
export class DuplicateDetectionService {
  
  /**
   * Find potential duplicate accounts for a user
   */
  async findDuplicates(userId: string): Promise<DuplicateMatch[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      const matches: DuplicateMatch[] = [];
      
      // 1. Exact email match (excluding the user themselves)
      if (user.email) {
        const emailMatches = await prisma.user.findMany({
          where: {
            email: user.email,
            id: { not: userId }
          }
        });
        
        for (const match of emailMatches) {
          matches.push({
            userId: match.id,
            email: match.email,
            name: match.name || 'Unknown',
            matchType: 'EMAIL',
            confidence: 1.0,
            matchedValue: user.email
          });
        }
      }
      
      // 2. Phone number match
      if (user.phone) {
        const normalizedPhone = this.normalizePhone(user.phone);
        
        const phoneMatches = await prisma.user.findMany({
          where: {
            phone: { not: null },
            id: { not: userId }
          }
        });
        
        for (const match of phoneMatches) {
          if (match.phone && this.normalizePhone(match.phone) === normalizedPhone) {
            matches.push({
              userId: match.id,
              email: match.email,
              name: match.name || 'Unknown',
              matchType: 'PHONE',
              confidence: 0.95,
              matchedValue: user.phone
            });
          }
        }
      }
      
      // 3. Device fingerprint match (from security events)
      const deviceMatches = await this.findDeviceMatches(userId);
      matches.push(...deviceMatches);
      
      // 4. Name similarity match
      if (user.name) {
        const nameMatches = await this.findNameSimilarityMatches(userId, user.name);
        matches.push(...nameMatches);
      }
      
      // Remove duplicates and sort by confidence
      const uniqueMatches = this.deduplicateMatches(matches);
      
      logger.info(`Found ${uniqueMatches.length} potential duplicates for user ${userId}`);
      
      return uniqueMatches.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error(`Failed to find duplicates for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Find matches based on device fingerprint (IP + User Agent)
   */
  private async findDeviceMatches(userId: string): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];
    
    // Get recent security events for the user
    const userEvents = await prisma.securityEvent.findMany({
      where: {
        userId,
        ip: { not: null },
        userAgent: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    for (const event of userEvents) {
      if (!event.ip || !event.userAgent) continue;
      
      // Find other users with same IP + User Agent
      const otherEvents = await prisma.securityEvent.findMany({
        where: {
          ip: event.ip,
          userAgent: event.userAgent,
          userId: { not: userId }
        },
        distinct: ['userId'],
        include: {
          user: true
        }
      });
      
      for (const otherEvent of otherEvents) {
        matches.push({
          userId: otherEvent.userId,
          email: otherEvent.user.email,
          name: otherEvent.user.name || 'Unknown',
          matchType: 'DEVICE',
          confidence: 0.70,
          matchedValue: `${event.ip} / ${event.userAgent.substring(0, 50)}...`
        });
      }
    }
    
    return matches;
  }
  
  /**
   * Find matches based on name similarity
   */
  private async findNameSimilarityMatches(userId: string, userName: string): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];
    
    // Get all users with similar names (simple approach)
    const allUsers = await prisma.user.findMany({
      where: {
        name: { not: null },
        id: { not: userId }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    for (const user of allUsers) {
      if (!user.name) continue;
      
      const similarity = this.calculateStringSimilarity(
        userName.toLowerCase(),
        user.name.toLowerCase()
      );
      
      if (similarity > 0.8) {
        matches.push({
          userId: user.id,
          email: user.email,
          name: user.name,
          matchType: 'NAME_SIMILARITY',
          confidence: similarity * 0.6, // Lower confidence for name matches
          matchedValue: user.name
        });
      }
    }
    
    return matches;
  }
  
  /**
   * Normalize phone number for comparison
   */
  private normalizePhone(phone: string): string {
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Remove duplicate matches (same user matched multiple times)
   */
  private deduplicateMatches(matches: DuplicateMatch[]): DuplicateMatch[] {
    const seen = new Set<string>();
    const unique: DuplicateMatch[] = [];
    
    for (const match of matches) {
      if (!seen.has(match.userId)) {
        seen.add(match.userId);
        unique.push(match);
      }
    }
    
    return unique;
  }
  
  /**
   * Preview what would happen if two users were merged
   */
  async previewMerge(primaryUserId: string, duplicateUserId: string): Promise<MergePreview> {
    try {
      const [primaryUser, duplicateUser] = await Promise.all([
        prisma.user.findUnique({
          where: { id: primaryUserId },
          include: {
            orders: true,
            roles: true,
            userNotes: true,
            userTasks: true,
            riskFlags: true,
            securityEvents: true
          }
        }),
        prisma.user.findUnique({
          where: { id: duplicateUserId },
          include: {
            orders: true,
            roles: true,
            userNotes: true,
            userTasks: true,
            riskFlags: true,
            securityEvents: true
          }
        })
      ]);
      
      if (!primaryUser || !duplicateUser) {
        throw new Error('One or both users not found');
      }
      
      // Check for conflicts
      const conflicts: string[] = [];
      
      if (primaryUser.email !== duplicateUser.email) {
        conflicts.push(`Email mismatch: ${primaryUser.email} vs ${duplicateUser.email}`);
      }
      
      if (primaryUser.vendorProfile && duplicateUser.vendorProfile) {
        conflicts.push('Both users have vendor profiles');
      }
      
      if (primaryUser.coordinatorProfile && duplicateUser.coordinatorProfile) {
        conflicts.push('Both users have coordinator profiles');
      }
      
      return {
        primaryUser: {
          id: primaryUser.id,
          email: primaryUser.email,
          name: primaryUser.name || 'Unknown',
          created_at: primaryUser.created_at
        },
        duplicateUser: {
          id: duplicateUser.id,
          email: duplicateUser.email,
          name: duplicateUser.name || 'Unknown',
          created_at: duplicateUser.created_at
        },
        dataToMerge: {
          orders: duplicateUser.orders.length,
          roles: duplicateUser.roles.length,
          notes: duplicateUser.userNotes.length,
          tasks: duplicateUser.userTasks.length,
          riskFlags: duplicateUser.riskFlags.length,
          securityEvents: duplicateUser.securityEvents.length
        },
        conflicts
      };
    } catch (error) {
      logger.error('Failed to preview merge:', error);
      throw error;
    }
  }
  
  /**
   * Execute merge of duplicate user into primary user
   */
  async executeMerge(
    primaryUserId: string, 
    duplicateUserId: string, 
    adminId: string
  ): Promise<void> {
    try {
      // Start transaction
      await prisma.$transaction(async (tx) => {
        // 1. Move orders
        await tx.order.updateMany({
          where: { userId: duplicateUserId },
          data: { userId: primaryUserId }
        });
        
        // 2. Move roles (avoid duplicates)
        const duplicateRoles = await tx.userRole.findMany({
          where: { userId: duplicateUserId }
        });
        
        for (const role of duplicateRoles) {
          const existing = await tx.userRole.findFirst({
            where: {
              userId: primaryUserId,
              role: role.role
            }
          });
          
          if (!existing) {
            await tx.userRole.create({
              data: {
                userId: primaryUserId,
                role: role.role,
                scopes: role.scopes
              }
            });
          }
        }
        
        await tx.userRole.deleteMany({
          where: { userId: duplicateUserId }
        });
        
        // 3. Move notes
        await tx.userNote.updateMany({
          where: { userId: duplicateUserId },
          data: { userId: primaryUserId }
        });
        
        // 4. Move tasks
        await tx.userTask.updateMany({
          where: { userId: duplicateUserId },
          data: { userId: primaryUserId }
        });
        
        // 5. Move risk flags
        await tx.riskFlag.updateMany({
          where: { userId: duplicateUserId },
          data: { userId: primaryUserId }
        });
        
        // 6. Move security events
        await tx.securityEvent.updateMany({
          where: { userId: duplicateUserId },
          data: { userId: primaryUserId }
        });
        
        // 7. Soft delete duplicate user
        await tx.user.update({
          where: { id: duplicateUserId },
          data: {
            status: 'SOFT_DELETED',
            deletedAt: new Date()
          }
        });
        
        // 8. Create merge record
        await tx.duplicateUser.create({
          data: {
            primaryId: primaryUserId,
            duplicateId: duplicateUserId,
            mergedBy: adminId,
            mergeLog: JSON.stringify({
              mergedAt: new Date().toISOString(),
              mergedBy: adminId,
              dataTransferred: {
                orders: true,
                roles: true,
                notes: true,
                tasks: true,
                riskFlags: true,
                securityEvents: true
              }
            })
          }
        });
        
        // 9. Create audit record
        await tx.adminAudit.create({
          data: {
            adminId,
            action: 'MERGE_DUPLICATE_USER',
            target: `User:${primaryUserId}`,
            payload: {
              duplicateUserId,
              timestamp: new Date().toISOString()
            }
          }
        });
      });
      
      logger.info(`Successfully merged user ${duplicateUserId} into ${primaryUserId}`, {
        primaryUserId,
        duplicateUserId,
        adminId
      });
    } catch (error) {
      logger.error('Failed to execute merge:', error);
      throw error;
    }
  }
  
  /**
   * Weekly batch job to detect duplicates across all users
   */
  async detectAllDuplicates(): Promise<Map<string, DuplicateMatch[]>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE'
        },
        select: { id: true }
      });
      
      const allDuplicates = new Map<string, DuplicateMatch[]>();
      
      for (const user of users) {
        const duplicates = await this.findDuplicates(user.id);
        if (duplicates.length > 0) {
          allDuplicates.set(user.id, duplicates);
        }
      }
      
      logger.info(`Duplicate detection completed`, {
        usersChecked: users.length,
        usersWithDuplicates: allDuplicates.size
      });
      
      return allDuplicates;
    } catch (error) {
      logger.error('Batch duplicate detection error:', error);
      throw error;
    }
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();

