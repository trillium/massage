#!/bin/bash

# Supabase Installation Script for Trillium Massage
# Installs all necessary Supabase dependencies

set -e  # Exit on error

echo "🚀 Installing Supabase dependencies..."

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "📦 Installing @supabase/supabase-js..."
pnpm add @supabase/supabase-js

echo "📦 Installing @supabase/ssr..."
pnpm add @supabase/ssr

echo "📦 Installing supabase CLI (dev dependency)..."
pnpm add -D supabase

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Copy .env.supabase.template to .env.local"
echo "3. Add your Supabase credentials to .env.local"
echo "4. See SUPABASE_SETUP_GUIDE.md for detailed instructions"
