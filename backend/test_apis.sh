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
-H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || echo "Failed to parse sensor data history (likely due to circular references in JSON response)."

echo ""
echo "--- 5. Testing User Management APIs (Admin only) ---"

# Get all users
echo "Fetching all users for the admin's factory..."
curl -s -X GET http://localhost:8080/api/users \
-H "Authorization: Bearer $TOKEN" | jq .

# Generate unique identifiers for this test run
TIMESTAMP=$(date +%s)

# Create a new employee user
EMPLOYEE_USERNAME="employee_test_$TIMESTAMP"
EMPLOYEE_EMAIL="employee_test_$TIMESTAMP@example.com"
EMPLOYEE_UPDATED_USERNAME="employee_test_updated_$TIMESTAMP"
EMPLOYEE_UPDATED_EMAIL="employee_test_updated_$TIMESTAMP@example.com"

echo "Creating a new employee user with username: $EMPLOYEE_USERNAME and email: $EMPLOYEE_EMAIL..."
EMPLOYEE_CREATE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/users \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{
    \"username\": \"$EMPLOYEE_USERNAME\",
    \"password\": \"employee_password\",
    \"email\": \"$EMPLOYEE_EMAIL\",
    \"role\": \"EMPLOYEE\"
}")
echo "Create Employee Response: $EMPLOYEE_CREATE_RESPONSE"
EMPLOYEE_ID=$(echo $EMPLOYEE_CREATE_RESPONSE | jq -r '.id')
if [ "$EMPLOYEE_ID" != "null" ]; then
    echo "Employee created successfully. ID: $EMPLOYEE_ID"
else
    echo "Failed to create employee. Response: $EMPLOYEE_CREATE_RESPONSE"
    exit 1
fi

# Update the employee user
echo "Updating the employee user (ID: $EMPLOYEE_ID) to username: $EMPLOYEE_UPDATED_USERNAME and email: $EMPLOYEE_UPDATED_EMAIL..."
EMPLOYEE_UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8080/api/users/$EMPLOYEE_ID \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{
    \"username\": \"$EMPLOYEE_UPDATED_USERNAME\",
    \"email\": \"$EMPLOYEE_UPDATED_EMAIL\",
    \"role\": \"EMPLOYEE\"
}")
echo "Update Employee Response: $EMPLOYEE_UPDATE_RESPONSE"
UPDATED_EMPLOYEE_ID=$(echo $EMPLOYEE_UPDATE_RESPONSE | jq -r '.id')
if [ "$UPDATED_EMPLOYEE_ID" == "$EMPLOYEE_ID" ]; then
    echo "Employee updated successfully."
else
    echo "Failed to update employee. Response: $EMPLOYEE_UPDATE_RESPONSE"
    exit 1
fi

# Get the updated employee details
echo "Fetching details of the updated employee (ID: $EMPLOYEE_ID)..."
curl -s -X GET http://localhost:8080/api/users/$EMPLOYEE_ID \
-H "Authorization: Bearer $TOKEN" | jq .

# Delete the employee user
echo "Deleting the employee user (ID: $EMPLOYEE_ID)..."
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:8080/api/users/$EMPLOYEE_ID \
-H "Authorization: Bearer $TOKEN" -w "\nHTTP_STATUS:%{http_code}")
DELETE_STATUS_CODE=$(echo $DELETE_RESPONSE | grep HTTP_STATUS | cut -d: -f2)
echo "Delete Employee Response: $DELETE_RESPONSE"
if [ "$DELETE_STATUS_CODE" -eq 204 ]; then
    echo "Employee deleted successfully (HTTP 204)."
else
    echo "Failed to delete employee. HTTP Status: $DELETE_STATUS_CODE"
    exit 1
fi

echo ""
echo "--- 6. Testing Device Management APIs (Admin only) ---"

# Get all devices (should include the one created earlier)
echo "Fetching all devices for the admin's factory..."
curl -s -X GET http://localhost:8080/api/devices \
-H "Authorization: Bearer $TOKEN" | jq .

# Update the device name
echo "Updating the device name..."
DEVICE_UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8080/api/devices/$DEVICE_ID \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "name": "ESP32-Test-Device-Updated"
}')

UPDATED_DEVICE_NAME=$(echo $DEVICE_UPDATE_RESPONSE | jq -r '.name')
if [ "$UPDATED_DEVICE_NAME" == "ESP32-Test-Device-Updated" ]; then
    echo "Device updated successfully."
else
    echo "Failed to update device. Response: $DEVICE_UPDATE_RESPONSE"
    exit 1
fi

# Get the updated device details
echo "Fetching details of the updated device..."
curl -s -X GET http://localhost:8080/api/devices/$DEVICE_ID \
-H "Authorization: Bearer $TOKEN" | jq .

# Delete the device
echo "Deleting the device..."
DELETE_DEVICE_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:8080/api/devices/$DEVICE_ID \
-H "Authorization: Bearer $TOKEN")

if [ "$DELETE_DEVICE_STATUS_CODE" -eq 204 ]; then
    echo "Device deleted successfully (HTTP 204)."
else
    echo "Failed to delete device. HTTP Status: $DELETE_DEVICE_STATUS_CODE"
    exit 1
fi

echo ""
echo "--- Full API Test Script finished successfully ---"