#!/bin/bash

# Build script that includes React UI in Go binary
set -e

echo "🏗️  Building ChoreMe with embedded UI..."

# Check if Node.js is available
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm not found. Installing UI dependencies requires Node.js."
    echo "   You can still build the backend-only version with: go build cmd/choreme/main.go"
    exit 1
fi

# Build React PWA
echo "📦 Building React PWA..."
cd ../web
npm install --silent
npm run build
cd ../choreme

# Create the embed directory structure
echo "📁 Preparing embedded files..."
mkdir -p internal/web/build
cp -r ../web/build/* internal/web/build/

# Build Go binary with embedded UI
echo "🚀 Building Go binary with embedded UI..."
go build -o choreme cmd/choreme/main.go

echo "✅ Build complete! Run './choreme' to start with embedded UI"
echo "   The UI will be available at http://localhost:8080"