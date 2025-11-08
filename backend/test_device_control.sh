#!/bin/bash

# Test Device Control APIs
echo "=== Testing Device Control APIs ==="

# First, login to get JWT token
echo "1. Logging in as admin..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "adminA",
    "password": "admin"
}')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ Login failed. Could not get JWT token."
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Login successful. JWT obtained."

# Get first device ID
echo "2. Getting device list..."
DEVICES_RESPONSE=$(curl -s -X GET http://localhost:8081/api/devices \
-H "Authorization: Bearer $TOKEN")

DEVICE_ID=$(echo $DEVICES_RESPONSE | jq -r '.[0].id')

if [ -z "$DEVICE_ID" ] || [ "$DEVICE_ID" == "null" ]; then
    echo "❌ No devices found."
    echo "Response: $DEVICES_RESPONSE"
    exit 1
fi

echo "✅ Found device ID: $DEVICE_ID"

# Test valve control - Open valve
echo "3. Testing valve control (OPEN)..."
VALVE_RESPONSE=$(curl -s -X POST http://localhost:8081/api/controls/devices/$DEVICE_ID/valve \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "open": true
}')

if [ $? -eq 0 ]; then
    echo "✅ Valve control (OPEN) successful"
    echo "Response: $VALVE_RESPONSE"
else
    echo "❌ Valve control (OPEN) failed"
fi

# Test valve control - Close valve
echo "4. Testing valve control (CLOSE)..."
VALVE_RESPONSE=$(curl -s -X POST http://localhost:8081/api/controls/devices/$DEVICE_ID/valve \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "open": false
}')

if [ $? -eq 0 ]; then
    echo "✅ Valve control (CLOSE) successful"
    echo "Response: $VALVE_RESPONSE"
else
    echo "❌ Valve control (CLOSE) failed"
fi

# Test data interval setting
echo "5. Testing data interval setting..."
INTERVAL_RESPONSE=$(curl -s -X POST http://localhost:8081/api/controls/devices/$DEVICE_ID/interval \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "interval": 15
}')

if [ $? -eq 0 ]; then
    echo "✅ Data interval setting successful"
    echo "Response: $INTERVAL_RESPONSE"
else
    echo "❌ Data interval setting failed"
fi

echo "=== Test completed ==="