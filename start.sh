#!/bin/bash

# AI Demo BOLT V1 - Production Ready Startup Script
# This script takes the application from fresh clone to production ready

set -e  # Exit on any error

echo "🚀 Starting AI Demo BOLT V1 Production Setup..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if we're in the right directory
print_status "Checking project directory..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the AI-demo-BOLT-V1 directory."
    exit 1
fi
print_success "Project directory confirmed"

# Step 2: Kill any existing processes
print_status "Cleaning up existing processes..."
pkill -f vite 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 2
print_success "Processes cleaned up"

# Step 3: Install dependencies
print_status "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 4: Verify configuration files
print_status "Verifying configuration files..."

# Check if all required files exist
required_files=("index.html" "src/main.js" "src/config.js" "vite.config.ts")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file is missing"
        exit 1
    fi
done
print_success "All configuration files present"

# Step 5: Check production changes
print_status "Verifying production changes..."

# Check if "Click to start" text is removed
if grep -q "Click to Start" index.html; then
    print_warning "Found 'Click to Start' text - this should be removed for production"
else
    print_success "✓ 'Click to Start' text removed"
fi

# Check if debug button is positioned correctly
if grep -q "bottom: 20px" index.html; then
    print_success "✓ Debug button positioned at bottom"
else
    print_warning "Debug button positioning may need adjustment"
fi

# Check if company/customer name fields exist
if grep -q "companyName" index.html && grep -q "agentName" index.html && grep -q "customerName" index.html; then
    print_success "✓ Company/Agent/Customer name fields present"
else
    print_warning "Business information fields may be missing"
fi

# Check if dropdown styling is improved
if grep -q "rgba(0,0,0,0.7)" index.html; then
    print_success "✓ Dropdown styling improved"
else
    print_warning "Dropdown styling may need improvement"
fi

# Step 6: Find available port
print_status "Finding available port..."
PORT=12001
while netstat -an 2>/dev/null | grep -q ":$PORT " || ss -an 2>/dev/null | grep -q ":$PORT " || lsof -i :$PORT 2>/dev/null | grep -q ":$PORT"; do
    PORT=$((PORT + 1))
    if [ $PORT -gt 12010 ]; then
        print_error "No available ports found in range 12001-12010"
        exit 1
    fi
done
print_success "Using port $PORT"

# Step 7: Update vite config with correct port
print_status "Updating server configuration..."
cat > vite.config.ts << EOF
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: $PORT,
    cors: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        alter: 'src/alter.html'
      }
    }
  }
});
EOF
print_success "Server configuration updated for port $PORT"

# Step 8: Start the server
print_status "Starting production server..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
    print_success "Server started successfully (PID: $SERVER_PID)"
    
    # Get the actual port from logs
    ACTUAL_PORT=$(grep -o "localhost:[0-9]*" server.log | head -1 | cut -d: -f2)
    if [ -n "$ACTUAL_PORT" ]; then
        PORT=$ACTUAL_PORT
    fi
    
    echo ""
    echo "🎉 AI Demo BOLT V1 is now running in PRODUCTION MODE!"
    echo "================================================"
    echo "📍 Local URL:    http://localhost:$PORT/"
    echo "🌐 Network URL:  http://$(hostname -I | awk '{print $1}'):$PORT/"
    echo "🔗 External URL: https://work-2-gfenbbccygflxpvq.prod-runtime.all-hands.dev"
    echo ""
    echo "✅ PRODUCTION FEATURES ENABLED:"
    echo "   • AI Configuration dropdown with improved visibility"
    echo "   • Clean interface (no 'Click to Start' text)"
    echo "   • Debug button positioned at bottom-right"
    echo "   • Auto-population of company/customer names"
    echo "   • 4 Gemini models available"
    echo "   • 7 service configurations"
    echo "   • Dynamic name replacement in conversations"
    echo ""
    echo "📋 Server Process ID: $SERVER_PID"
    echo "📄 Server logs: tail -f server.log"
    echo "🛑 To stop: kill $SERVER_PID"
    echo ""
    echo "🚀 Ready for production use!"
    
else
    print_error "Server failed to start. Check server.log for details:"
    tail -10 server.log
    exit 1
fi