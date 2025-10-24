#!/usr/bin/env node

/**
 * Cleanup script for failed signup attempts
 * 
 * This script identifies and removes user records that were created during
 * the old multi-step signup flow but never completed (abandoned signups).
 * 
 * Criteria for cleanup:
 * - Users with profileCompleted = false
 * - Users with emailVerified = false  
 * - Users created before the new signup flow was implemented
 * - No associated vendor/coordinator profiles
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupFailedSignups() {
  console.log('🧹 Starting cleanup of failed signup attempts...\n');

  try {
    // Find users that appear to be abandoned signups
    const abandonedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { profileCompleted: false },
          { emailVerified: false },
          // Only clean up users created before today (when we fixed the signup flow)
          { createdAt: { lt: new Date('2024-01-15') } }
        ]
      },
      include: {
        vendorProfile: true,
        eventCoordinatorProfile: true,
        customerProfile: true
      }
    });

    console.log(`📊 Found ${abandonedUsers.length} potentially abandoned user records\n`);

    if (abandonedUsers.length === 0) {
      console.log('✅ No abandoned signups found. Database is clean!');
      return;
    }

    // Filter to only users without any profile data (true abandoned signups)
    const usersToDelete = abandonedUsers.filter(user => 
      !user.vendorProfile && 
      !user.eventCoordinatorProfile && 
      !user.customerProfile
    );

    console.log(`🎯 Found ${usersToDelete.length} users with no profile data to clean up\n`);

    if (usersToDelete.length === 0) {
      console.log('✅ No users without profiles found. All users have some profile data.');
      return;
    }

    // Show what will be deleted
    console.log('📋 Users to be deleted:');
    usersToDelete.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });

    console.log('\n⚠️  This action cannot be undone!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete the abandoned users
    console.log('🗑️  Deleting abandoned user records...');

    const deleteResults = await Promise.all(
      usersToDelete.map(async (user) => {
        try {
          // Delete any associated data first
          await prisma.userAgreement.deleteMany({
            where: { userId: user.id }
          });

          // Delete the user
          await prisma.user.delete({
            where: { id: user.id }
          });

          return { success: true, email: user.email };
        } catch (error) {
          console.error(`❌ Failed to delete user ${user.email}:`, error.message);
          return { success: false, email: user.email, error: error.message };
        }
      })
    );

    const successful = deleteResults.filter(r => r.success);
    const failed = deleteResults.filter(r => !r.success);

    console.log(`\n✅ Successfully deleted ${successful.length} user records`);
    
    if (failed.length > 0) {
      console.log(`❌ Failed to delete ${failed.length} user records:`);
      failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
    }

    console.log('\n🎉 Cleanup completed!');

  } catch (error) {
    console.error('💥 Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Add dry run option
async function dryRun() {
  console.log('🔍 DRY RUN - No changes will be made\n');

  try {
    const abandonedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { profileCompleted: false },
          { emailVerified: false },
          { createdAt: { lt: new Date('2024-01-15') } }
        ]
      },
      include: {
        vendorProfile: true,
        eventCoordinatorProfile: true,
        customerProfile: true
      }
    });

    const usersToDelete = abandonedUsers.filter(user => 
      !user.vendorProfile && 
      !user.eventCoordinatorProfile && 
      !user.customerProfile
    );

    console.log(`📊 Found ${abandonedUsers.length} potentially abandoned user records`);
    console.log(`🎯 Would delete ${usersToDelete.length} users with no profile data\n`);

    if (usersToDelete.length > 0) {
      console.log('📋 Users that would be deleted:');
      usersToDelete.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('💥 Error during dry run:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

if (isDryRun) {
  dryRun();
} else {
  cleanupFailedSignups();
}
