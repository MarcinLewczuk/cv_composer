#!/bin/bash

echo "🚀 Starting Backend Server..."
echo ""

# Start backend in background
npm run dev:backend &
BACKEND_PID=$!

echo "⏳ Waiting 3 seconds for server to start..."
sleep 3

echo ""
echo "🧪 Testing API endpoints..."
echo ""

# Test 1: Check if server is running
echo "1️⃣  Testing basic connectivity (GET /users)..."
curl -s -X GET http://localhost:3000/users -H "Content-Type: application/json" | head -c 100
echo ""
echo ""

# Test 2: Test CV generation
echo "2️⃣  Testing CV Generation (POST /api/cv/generate)..."
curl -s -X POST http://localhost:3000/api/cv/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Name: John Doe\nEmail: john@example.com\nSkills: TypeScript, Angular, Node.js\nExperience: Senior Developer at Tech Corp (2020-2024)"
  }' | head -c 200
echo ""
echo ""

echo "✅ Tests complete!"
echo ""
echo "To stop the server, run: kill $BACKEND_PID"
