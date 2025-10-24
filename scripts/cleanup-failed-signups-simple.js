#!/usr/bin/env node

/**
 * Simple cleanup script for failed signup attempts
 * 
 * This script provides a SQL query to manually clean up abandoned user records.
 * Run this query in your database management tool (pgAdmin, DBeaver, etc.)
 */

console.log('🧹 Craved Artisan - Failed Signup Cleanup');
console.log('==========================================');
console.log('');

console.log('📋 SQL Query to identify abandoned signups:');
console.log('');
console.log(`
-- Find users that appear to be abandoned signups
SELECT 
    id,
    email,
    name,
    role,
    "profileCompleted",
    "emailVerified",
    "createdAt"
FROM "User" 
WHERE 
    "profileCompleted" = false 
    AND "emailVerified" = false
    AND "createdAt" < '2024-01-15'
ORDER BY "createdAt" DESC;
`);

console.log('');
console.log('📋 SQL Query to delete abandoned signups (run after reviewing above):');
console.log('');
console.log(`
-- Delete user agreements first (foreign key constraint)
DELETE FROM "UserAgreement" 
WHERE "userId" IN (
    SELECT id FROM "User" 
    WHERE 
        "profileCompleted" = false 
        AND "emailVerified" = false
        AND "createdAt" < '2024-01-15'
        AND id NOT IN (
            SELECT "userId" FROM "VendorProfile" WHERE "userId" IS NOT NULL
            UNION
            SELECT "userId" FROM "EventCoordinatorProfile" WHERE "userId" IS NOT NULL
            UNION  
            SELECT "userId" FROM "CustomerProfile" WHERE "userId" IS NOT NULL
        )
);

-- Delete abandoned users
DELETE FROM "User" 
WHERE 
    "profileCompleted" = false 
    AND "emailVerified" = false
    AND "createdAt" < '2024-01-15'
    AND id NOT IN (
        SELECT "userId" FROM "VendorProfile" WHERE "userId" IS NOT NULL
        UNION
        SELECT "userId" FROM "EventCoordinatorProfile" WHERE "userId" IS NOT NULL
        UNION  
        SELECT "userId" FROM "CustomerProfile" WHERE "userId" IS NOT NULL
    );
`);

console.log('');
console.log('⚠️  IMPORTANT SAFETY NOTES:');
console.log('');
console.log('1. Always backup your database before running DELETE queries');
console.log('2. Run the SELECT query first to see what will be deleted');
console.log('3. The DELETE query only removes users with no profile data');
console.log('4. This only affects abandoned signups, not legitimate users');
console.log('');
console.log('✅ The new signup flow prevents this issue from happening again');
console.log('   - Users are only created at the final step');
console.log('   - Abandoned signups no longer store emails');
console.log('   - No more "email already exists" errors');
