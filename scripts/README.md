# Database Cleanup Scripts

This directory contains scripts for cleaning up the database and maintaining data integrity.

## Failed Signup Cleanup

### Overview

The `cleanup-failed-signups.js` script removes abandoned user records that were created during the old multi-step signup flow but never completed. These are users who started the signup process but abandoned it before completion, leaving orphaned records in the database.

### Problem

Previously, the signup flow created user records at step 1 (credentials validation), which meant:
- Users who abandoned the signup process had their emails stored in the database
- When they tried to sign up again, they got "email already exists" errors
- This created a poor user experience and database bloat

### Solution

The signup flow has been refactored to only save data at the final step, but we need to clean up the existing abandoned records.

### Usage

#### Interactive Mode (Recommended)
```bash
./scripts/cleanup-failed-signups.sh
```

#### Direct Node.js Execution
```bash
# Dry run (see what would be deleted)
node scripts/cleanup-failed-signups.js --dry-run

# Actually delete the records
node scripts/cleanup-failed-signups.js
```

### What Gets Cleaned Up

The script identifies and removes users that meet ALL of these criteria:
- `profileCompleted = false`
- `emailVerified = false`
- Created before the signup flow fix (before 2024-01-15)
- No associated vendor, coordinator, or customer profile

### Safety Features

1. **Dry Run Mode**: Use `--dry-run` to see what would be deleted without making changes
2. **Confirmation Prompt**: The script waits 5 seconds before proceeding
3. **Detailed Logging**: Shows exactly what's being deleted
4. **Error Handling**: Continues if individual deletions fail
5. **Associated Data Cleanup**: Removes user agreements and other related records

### Example Output

```
🧹 Starting cleanup of failed signup attempts...

📊 Found 15 potentially abandoned user records

🎯 Found 8 users with no profile data to clean up

📋 Users to be deleted:
  1. user1@example.com (VENDOR) - Created: 2024-01-10T10:30:00.000Z
  2. user2@example.com (CUSTOMER) - Created: 2024-01-12T14:20:00.000Z
  ...

⚠️  This action cannot be undone!
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🗑️  Deleting abandoned user records...
✅ Successfully deleted 8 user records

🎉 Cleanup completed!
```

### Prerequisites

- Node.js installed
- Database connection configured
- Prisma client available
- Database backup (recommended before running)

### Notes

- The script is safe to run multiple times
- It only affects abandoned signups, not legitimate users
- Always run a dry run first to verify what will be deleted
- Consider running this during low-traffic periods
