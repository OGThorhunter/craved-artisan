#!/bin/bash

# Cleanup script for failed signup attempts
# This script helps clean up abandoned user records from the old signup flow

echo "🧹 Craved Artisan - Failed Signup Cleanup Script"
echo "================================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if Prisma is available
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo "❌ Prisma is not installed. Please run 'npm install' first"
    exit 1
fi

echo "📋 Available options:"
echo "  1. Dry run (show what would be deleted)"
echo "  2. Clean up failed signups"
echo "  3. Exit"
echo ""

read -p "Select an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔍 Running dry run..."
        node scripts/cleanup-failed-signups.js --dry-run
        ;;
    2)
        echo ""
        echo "⚠️  WARNING: This will permanently delete user records!"
        echo "Make sure you have a database backup before proceeding."
        echo ""
        read -p "Are you sure you want to continue? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo ""
            echo "🗑️  Running cleanup..."
            node scripts/cleanup-failed-signups.js
        else
            echo "❌ Cleanup cancelled"
        fi
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
