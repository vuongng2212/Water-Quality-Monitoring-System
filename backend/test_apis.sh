#!/bin/bash

# Stop on first error
set -e

echo "--- 1. Logging in as admin ---"
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "admin",
    "password": "admin"
}')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "Login failed. Could not get JWT token."
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "Login successful. JWT obtained."
echo ""

echo "--- 2. Creating a new device ---"
DEVICE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/devices \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "name": "ESP32-Test-Device"
}')

API_KEY=$(echo $DEVICE_RESPONSE | jq -r '.apiKey')
DEVICE_ID=$(echo $DEVICE_RESPONSE | jq -r '.id')

if [ -z "$API_KEY" ] || [ "$API_KEY" == "null" ]; then
    echo "Failed to create device."
    echo "Response: $DEVICE_RESPONSE"
    exit 1
fi

echo "Device created successfully."
echo "Device ID: $DEVICE_ID"
echo "API Key: $API_KEY"
echo ""

echo "--- 3. Sending sensor data ---"
# Use -w "%{http_code}" to get the HTTP status code
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/sensor-data \
-H "Content-Type: application/json" \
-H "X-API-KEY: $API_KEY" \
-d '{
    "ph": 7.5,
    "temperature": 26.1,
    "turbidity": 1.2,
    "conductivity": 550
}')

if [ "$STATUS_CODE" -ne 201 ]; then
    echo "Failed to send sensor data. HTTP Status: $STATUS_CODE"
    exit 1
fi

echo "Sensor data sent successfully (HTTP 201)."
echo ""

echo "--- 4. Retrieving sensor data history ---"
curl -s -X GET http://localhost:8080/api/sensor-data/history/$DEVICE_ID \
-H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "--- Test script finished successfully ---"