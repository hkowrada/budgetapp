#!/bin/bash

echo "========================================"
echo "  PDF Manager Pro - Starting..."
echo "========================================"
echo ""
echo "Opening PDF Manager in your browser..."
echo ""
echo "The app will open at: http://localhost:8080"
echo ""
echo "Keep this terminal open while using the app."
echo "Press Ctrl+C to stop the server."
echo ""
echo "========================================"
echo ""

# Get the directory of the script
cd "$(dirname "$0")"

# Open browser (works on Mac and Linux)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8080
elif command -v open > /dev/null; then
    open http://localhost:8080
fi

# Start Python server
python3 -m http.server 8080