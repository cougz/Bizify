#!/bin/bash

# CORS Configuration Test Script for Bizify
# This script tests the CORS configuration of the Bizify API

set -e

API_URL=${1:-http://localhost:8000}
ORIGIN=${2:-http://localhost:3000}

echo "🧪 Testing CORS Configuration for Bizify API"
echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: Preflight request (OPTIONS)
echo "📋 Test 1: Preflight Request (OPTIONS)"
echo "Testing: $API_URL/api/dashboard"

response=$(curl -s -i \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -X OPTIONS \
  "$API_URL/api/dashboard" | head -20)

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ Preflight request successful"
    echo "   Access-Control-Allow-Origin found in response"
else
    echo "❌ Preflight request failed"
    echo "   No Access-Control-Allow-Origin header found"
fi

echo ""

# Test 2: Actual GET request
echo "📋 Test 2: Actual GET Request"
echo "Testing: $API_URL/api/dashboard"

response2=$(curl -s -i \
  -H "Origin: $ORIGIN" \
  -H "Content-Type: application/json" \
  -X GET \
  "$API_URL/api/dashboard" | head -20)

if echo "$response2" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ GET request CORS headers present"
else
    echo "❌ GET request missing CORS headers"
fi

echo ""

# Test 3: Check specific CORS headers
echo "📋 Test 3: CORS Headers Analysis"
echo "$response" | grep -E "Access-Control-" | while read -r line; do
    echo "   $line"
done

echo ""

# Test 4: Invalid origin test
echo "📋 Test 4: Invalid Origin Test"
INVALID_ORIGIN="https://malicious-site.com"

response3=$(curl -s -i \
  -H "Origin: $INVALID_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  "$API_URL/api/dashboard" 2>/dev/null | head -10)

if echo "$response3" | grep -q "Access-Control-Allow-Origin: $INVALID_ORIGIN"; then
    echo "⚠️  WARNING: Invalid origin was allowed (check CORS_ORIGINS configuration)"
elif echo "$response3" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo "⚠️  WARNING: All origins allowed (*) - not recommended for production"
else
    echo "✅ Invalid origin correctly rejected"
fi

echo ""
echo "🏁 CORS Test Complete"
echo ""
echo "💡 Tips:"
echo "   - For production, set specific origins in CORS_ORIGINS"
echo "   - Never use CORS_ORIGINS=* in production"
echo "   - Check browser developer console for detailed CORS errors"
echo "   - Run this script after changing CORS configuration"
echo ""
echo "📚 For more information, see CORS_CONFIG.md"