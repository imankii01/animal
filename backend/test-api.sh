#!/bin/bash

# 🎵 Moo Music Tracker Backend - API Testing Script
# Usage: bash test-api.sh

BASE_URL="http://localhost:5000/api"

echo "🎵 Moo Music Tracker - API Testing"
echo "=================================="
echo ""

# 1. Health check
echo "1️⃣ Health Check"
curl -s http://localhost:5000/health | jq .
echo ""

# 2. Create a session
echo "2️⃣ Creating a new milking session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2025-02-04T14:00:00Z",
    "end_time": "2025-02-04T14:15:00Z",
    "duration": 900,
    "milk_quantity": 5.2
  }')

echo "$SESSION_RESPONSE" | jq .

# Extract session ID for later use
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data._id')
echo "Session ID: $SESSION_ID"
echo ""

# 3. Get all sessions
echo "3️⃣ Retrieving all sessions..."
curl -s "$BASE_URL/sessions" | jq .
echo ""

# 4. Get session by ID
echo "4️⃣ Getting session by ID..."
curl -s "$BASE_URL/sessions/$SESSION_ID" | jq .
echo ""

# 5. Get statistics
echo "5️⃣ Getting session statistics..."
curl -s "$BASE_URL/sessions/stats/overview" | jq .
echo ""

# 6. Update session
echo "6️⃣ Updating session..."
curl -s -X PATCH "$BASE_URL/sessions/$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "milk_quantity": 6.5
  }' | jq .
echo ""

echo "✅ API testing complete!"
