#!/bin/bash

echo "========================================"
echo "  Checking for .gitignore files"
echo "========================================"
echo ""

GITIGNORE_FILES=$(find /app -name ".gitignore" -type f ! -path "*/node_modules/*" 2>/dev/null)

if [ -z "$GITIGNORE_FILES" ]; then
    echo "✅ SUCCESS: No .gitignore files found!"
    echo ""
    echo "Build folder is accessible:"
    ls -lh /app/frontend/build/ 2>&1 | grep -E "(RUN_ME|index.html|static)" || echo "❌ Build folder missing!"
else
    echo "❌ WARNING: Found .gitignore files:"
    echo "$GITIGNORE_FILES"
    echo ""
    echo "Removing them now..."
    find /app -name ".gitignore" -type f ! -path "*/node_modules/*" -delete
    echo "✅ Removed!"
fi

echo ""
echo "========================================"
echo "  Build folder contents:"
echo "========================================"
ls -lh /app/frontend/build/ 2>&1 | head -15

echo ""
echo "========================================"
echo "  Verification complete!"
echo "========================================"
