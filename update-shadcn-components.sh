#!/bin/bash

# Update shadcn-vue components script
# This script updates all shadcn-vue components in src/components/ui

echo "🔄 Updating shadcn-vue components..."
echo ""

# Get all component directories
components=$(ls -d src/components/ui/*/ 2>/dev/null | xargs -n 1 basename)

if [ -z "$components" ]; then
    echo "❌ No components found in src/components/ui"
    exit 1
fi

# Count components
count=$(echo "$components" | wc -l | tr -d ' ')
echo "Found $count components to update:"
echo "$components" | tr '\n' ', ' | sed 's/, $/\n/'
echo ""

# Convert to space-separated list
components_list=$(echo "$components" | tr '\n' ' ')

# Run the shadcn-vue add command
echo "Running: npx shadcn-vue@latest add $components_list"
echo ""

npx shadcn-vue@latest add $components_list

echo ""
echo "✅ Component update complete!"
