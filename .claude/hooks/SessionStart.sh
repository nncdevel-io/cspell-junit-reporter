#!/bin/bash

# Claude Code SessionStart hook for cspell-junit-reporter
# This hook runs at the start of each Claude Code session to ensure
# the development environment is ready

set -e

echo "🔧 Starting Claude Code session setup..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Run tests to ensure everything works
echo "🧪 Running tests..."
npm test

echo "✅ Claude Code session setup complete!"
echo "📝 Available commands:"
echo "  - npm run build   : Compile TypeScript"
echo "  - npm test        : Run Jest tests"
echo "  - npm run format  : Format code with Prettier"
echo "  - npm run clean   : Clean build artifacts"
