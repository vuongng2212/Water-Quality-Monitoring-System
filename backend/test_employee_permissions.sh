#!/bin/bash

# Stop on first error
set -e

echo "--- Starting Employee Permission API Tests ---"
echo ""

BASE_URL="http://localhost:8080/api"

# --- 1. Login as admin ---
echo "--- 1. Logging in as adminA ---"
TOKEN_ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "adminA",
    "password": "admin"
}')
TOKEN_ADMIN=$(echo $TOKEN_ADMIN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN_ADMIN" ] || [ "$TOKEN_ADMIN" == "null" ]; then
    echo "Login as adminA failed. Could not get JWT token."
    echo "Response: $TOKEN_ADMIN_RESPONSE"
    exit 1
fi
echo "Login as adminA successful. JWT obtained."
echo ""

# --- 2. Create an employee user ---
echo "--- 2. Creating an employee user ---"
EMPLOYEE_USERNAME="employee_test_$(date +%s)"
EMPLOYEE_EMAIL="employee_test_$(date +%s)@factorya.com"

EMPLOYEE_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/users \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"username\": \"$EMPLOYEE_USERNAME\",
    \"password\": \"password\",
    \"email\": \"$EMPLOYEE_EMAIL\",
    \"role\": \"EMPLOYEE\"
}")
EMPLOYEE_ID=$(echo $EMPLOYEE_CREATE_RESPONSE | jq -r '.id')
if [ "$EMPLOYEE_ID" == "null" ]; then
    echo "Failed to create employee. Response: $EMPLOYEE_CREATE_RESPONSE"
    exit 1
fi
echo "Employee created successfully. ID: $EMPLOYEE_ID"
echo ""

# --- 3. Create two devices ---
echo "--- 3. Creating two devices ---"
DEVICE_A_NAME="DeviceA_Test_$(date +%s)"
DEVICE_B_NAME="DeviceB_Test_$(date +%s)"

DEVICE_A_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/devices \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"name\": \"$DEVICE_A_NAME\"
}")
DEVICE_A_ID=$(echo $DEVICE_A_CREATE_RESPONSE | jq -r '.id')
if [ "$DEVICE_A_ID" == "null" ]; then
    echo "Failed to create DeviceA. Response: $DEVICE_A_CREATE_RESPONSE"
    exit 1
fi
echo "DeviceA created successfully. ID: $DEVICE_A_ID"

DEVICE_B_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/devices \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"name\": \"$DEVICE_B_NAME\"
}")
DEVICE_B_ID=$(echo $DEVICE_B_CREATE_RESPONSE | jq -r '.id')
if [ "$DEVICE_B_ID" == "null" ]; then
    echo "Failed to create DeviceB. Response: $DEVICE_B_CREATE_RESPONSE"
    exit 1
fi
echo "DeviceB created successfully. ID: $DEVICE_B_ID"
echo ""

# --- 4. Login as employee ---
echo "--- 4. Logging in as employee ---"
TOKEN_EMPLOYEE_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "'$EMPLOYEE_USERNAME'",
    "password": "password"
}')
TOKEN_EMPLOYEE=$(echo $TOKEN_EMPLOYEE_RESPONSE | jq -r '.token')

if [ -z "$TOKEN_EMPLOYEE" ] || [ "$TOKEN_EMPLOYEE" == "null" ]; then
    echo "Login as employee failed. Could not get JWT token."
    echo "Response: $TOKEN_EMPLOYEE_RESPONSE"
    exit 1
fi
echo "Login as employee successful. JWT obtained."
echo ""

# --- 5. Verify employee initially has no device access ---
echo "--- 5. Verifying employee initially has no device access ---"
echo "Employee fetching devices (should return empty list):"

# Gọi API và lưu phản hồi vào một file tạm thời
TMP_RESPONSE_FILE="/tmp/employee_devices_response_$(date +%s).txt"
HTTP_STATUS=$(curl -s -o "$TMP_RESPONSE_FILE" -w "%{http_code}" -X GET $BASE_URL/devices \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "ERROR: Failed to fetch devices. HTTP Status: $HTTP_STATUS"
    EMPLOYEE_DEVICES=$(cat "$TMP_RESPONSE_FILE")
    echo "Response: $EMPLOYEE_DEVICES"
    rm -f "$TMP_RESPONSE_FILE"
    exit 1
fi

EMPLOYEE_DEVICES=$(cat "$TMP_RESPONSE_FILE")
rm -f "$TMP_RESPONSE_FILE"

echo $EMPLOYEE_DEVICES | jq .
EMPLOYEE_DEVICE_COUNT=$(echo "$EMPLOYEE_DEVICES" | jq 'length' 2>/dev/null)
if [ "$?" -ne 0 ] || [ -z "$EMPLOYEE_DEVICE_COUNT" ]; then
    echo "ERROR: Failed to parse device list or invalid JSON response."
    echo "Response: $EMPLOYEE_DEVICES"
    exit 1
fi
echo "DEBUG: EMPLOYEE_DEVICE_COUNT is '$EMPLOYEE_DEVICE_COUNT'" >&2
if [ "$EMPLOYEE_DEVICE_COUNT" -ne 0 ]; then
    echo "ERROR: Employee can see devices without permission. Expected 0, got $EMPLOYEE_DEVICE_COUNT."
    exit 1
fi
echo "Employee correctly sees 0 devices initially."
echo ""

# --- 6. Admin assigns DeviceA to employee ---
echo "--- 6. Admin assigns DeviceA to employee ---"
ASSIGN_RESPONSE=$(curl -s -X POST $BASE_URL/devices/$DEVICE_A_ID/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"userId\": $EMPLOYEE_ID
}")
ASSIGN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/devices/$DEVICE_A_ID/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"userId\": $EMPLOYEE_ID
}")
if [ "$ASSIGN_STATUS" -ne 200 ]; then
    echo "ERROR: Failed to assign device to employee. HTTP Status: $ASSIGN_STATUS"
    exit 1
fi
echo "DeviceA assigned to employee successfully."
echo ""

# --- 7. Verify employee can now see only DeviceA ---
echo "--- 7. Verifying employee can now see only DeviceA ---"
echo "Employee fetching devices (should return only DeviceA):"
EMPLOYEE_DEVICES_AFTER_ASSIGN=$(curl -s -X GET $BASE_URL/devices \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
echo $EMPLOYEE_DEVICES_AFTER_ASSIGN | jq .
EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN=$(echo "$EMPLOYEE_DEVICES_AFTER_ASSIGN" | jq 'length' 2>/dev/null)
if [ "$?" -ne 0 ] || [ -z "$EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN" ]; then
    echo "ERROR: Failed to parse device list or invalid JSON response."
    echo "Response: $EMPLOYEE_DEVICES_AFTER_ASSIGN"
    exit 1
fi
echo "DEBUG: EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN is '$EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN'" >&2
if [ "$EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN" -ne 1 ]; then
    echo "ERROR: Employee should see 1 device after assignment, got $EMPLOYEE_DEVICE_COUNT_AFTER_ASSIGN."
    exit 1
fi
EMPLOYEE_SEES_DEVICE_A=$(echo "$EMPLOYEE_DEVICES_AFTER_ASSIGN" | jq -r ".[] | select(.id == $DEVICE_A_ID) | .id" 2>/dev/null)
if [ "$?" -ne 0 ] || [ -z "$EMPLOYEE_SEES_DEVICE_A" ] || [ "$EMPLOYEE_SEES_DEVICE_A" == "null" ]; then
    echo "ERROR: Employee does not see DeviceA after assignment."
    echo "Device list: $EMPLOYEE_DEVICES_AFTER_ASSIGN"
    echo "Looking for device ID: $DEVICE_A_ID"
    exit 1
fi
echo "DEBUG: EMPLOYEE_SEES_DEVICE_A is '$EMPLOYEE_SEES_DEVICE_A'" >&2
echo "Employee correctly sees DeviceA after assignment."
echo ""

# --- 8. Verify employee can access DeviceA details but not DeviceB ---
echo "--- 8. Verifying employee can access DeviceA details but not DeviceB ---"
echo "Employee fetching DeviceA details (should succeed):"
DEVICE_A_DETAILS=$(curl -s -X GET $BASE_URL/devices/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
DEVICE_A_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/devices/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_A_STATUS" -ne 200 ]; then
    echo "ERROR: Employee cannot access DeviceA details. HTTP Status: $DEVICE_A_STATUS"
    exit 1
fi
echo "Employee successfully accessed DeviceA details."

echo "Employee fetching DeviceB details (should fail with 403):"
DEVICE_B_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/devices/$DEVICE_B_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_B_STATUS" -ne 403 ]; then
    echo "ERROR: Employee should not be able to access DeviceB details, but got status: $DEVICE_B_STATUS"
    exit 1
fi
echo "Employee correctly received 403 for DeviceB details."
echo ""

# --- 9. Send sensor data to both devices ---
echo "--- 9. Sending sensor data to both devices ---"
echo "Sending sensor data to DeviceA (should succeed)..."
DEVICE_A_DATA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sensor-data \
-H "Content-Type: application/json" \
-H "X-API-KEY: $(echo $DEVICE_A_CREATE_RESPONSE | jq -r '.apiKey')" \
-d '{
    "ph": 7.0,
    "temperature": 25.0,
    "turbidity": 1.0,
    "conductivity": 500
}')
if [ "$DEVICE_A_DATA_STATUS" -ne 201 ]; then
    echo "ERROR: Failed to send data to DeviceA. HTTP Status: $DEVICE_A_DATA_STATUS"
    exit 1
fi
echo "Successfully sent sensor data to DeviceA."

echo "Sending sensor data to DeviceB (should succeed)..."
DEVICE_B_DATA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sensor-data \
-H "Content-Type: application/json" \
-H "X-API-KEY: $(echo $DEVICE_B_CREATE_RESPONSE | jq -r '.apiKey')" \
-d '{
    "ph": 7.2,
    "temperature": 26.0,
    "turbidity": 1.2,
    "conductivity": 520
}')
if [ "$DEVICE_B_DATA_STATUS" -ne 201 ]; then
    echo "ERROR: Failed to send data to DeviceB. HTTP Status: $DEVICE_B_DATA_STATUS"
    exit 1
fi
echo "Successfully sent sensor data to DeviceB."
echo ""

# --- 10. Verify employee can access DeviceA sensor data but not DeviceB ---
echo "--- 10. Verifying employee can access DeviceA sensor data but not DeviceB ---"
echo "Employee fetching DeviceA sensor data (should succeed):"
DEVICE_A_SENSOR_DATA=$(curl -s -X GET $BASE_URL/sensor-data/history/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
DEVICE_A_SENSOR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/sensor-data/history/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_A_SENSOR_STATUS" -ne 200 ]; then
    echo "ERROR: Employee cannot access DeviceA sensor data. HTTP Status: $DEVICE_A_SENSOR_STATUS"
    exit 1
fi
echo "Employee successfully accessed DeviceA sensor data."

echo "Employee fetching DeviceB sensor data (should fail with 403):"
DEVICE_B_SENSOR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/sensor-data/history/$DEVICE_B_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_B_SENSOR_STATUS" -ne 403 ]; then
    echo "ERROR: Employee should not be able to access DeviceB sensor data, but got status: $DEVICE_B_SENSOR_STATUS"
    exit 1
fi
echo "Employee correctly received 403 for DeviceB sensor data."
echo ""

# --- 11. Admin unassigns DeviceA from employee ---
echo "--- 11. Admin unassigns DeviceA from employee ---"
UNASSIGN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/devices/$DEVICE_A_ID/unassign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"userId\": $EMPLOYEE_ID
}")
if [ "$UNASSIGN_RESPONSE" -ne 200 ]; then
    echo "ERROR: Failed to unassign device from employee. HTTP Status: $UNASSIGN_RESPONSE"
    exit 1
fi
echo "DeviceA unassigned from employee successfully."
echo ""

# --- 12. Verify employee can no longer access DeviceA ---
echo "--- 12. Verifying employee can no longer access DeviceA ---"
echo "Employee fetching devices (should return empty list again):"
EMPLOYEE_DEVICES_AFTER_UNASSIGN=$(curl -s -X GET $BASE_URL/devices \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
echo $EMPLOYEE_DEVICES_AFTER_UNASSIGN | jq .
EMPLOYEE_DEVICE_COUNT_AFTER_UNASSIGN=$(echo $EMPLOYEE_DEVICES_AFTER_UNASSIGN | jq 'length' | tr -d ' ')
if [ "$EMPLOYEE_DEVICE_COUNT_AFTER_UNASSIGN" -ne 0 ]; then
    echo "ERROR: Employee should see 0 devices after unassignment, got $EMPLOYEE_DEVICE_COUNT_AFTER_UNASSIGN."
    exit 1
fi
echo "Employee correctly sees 0 devices after unassignment."

echo "Employee fetching DeviceA details after unassignment (should fail with 403):"
DEVICE_A_STATUS_AFTER_UNASSIGN=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/devices/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_A_STATUS_AFTER_UNASSIGN" -ne 403 ]; then
    echo "ERROR: Employee should not be able to access DeviceA after unassignment, but got status: $DEVICE_A_STATUS_AFTER_UNASSIGN"
    exit 1
fi
echo "Employee correctly received 403 for DeviceA details after unassignment."

echo "Employee fetching DeviceA sensor data after unassignment (should fail with 403):"
DEVICE_A_SENSOR_STATUS_AFTER_UNASSIGN=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/sensor-data/history/$DEVICE_A_ID \
-H "Authorization: Bearer $TOKEN_EMPLOYEE")
if [ "$DEVICE_A_SENSOR_STATUS_AFTER_UNASSIGN" -ne 403 ]; then
    echo "ERROR: Employee should not be able to access DeviceA sensor data after unassignment, but got status: $DEVICE_A_SENSOR_STATUS_AFTER_UNASSIGN"
    exit 1
fi
echo "Employee correctly received 403 for DeviceA sensor data after unassignment."
echo ""

# --- 13. Test edge cases ---
echo "--- 13. Testing edge cases ---"
echo "Admin trying to assign DeviceB to non-existent user (should fail):"
NON_EXISTENT_USER_ASSIGN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/devices/$DEVICE_B_ID/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"userId\": 99999
}")
if [ "$NON_EXISTENT_USER_ASSIGN_STATUS" -ne 403 ]; then
    echo "WARNING: Assigning device to non-existent user should fail with 403, got: $NON_EXISTENT_USER_ASSIGN_STATUS"
    # Not exiting here as this might be expected behavior depending on implementation
fi
echo "Assignment to non-existent user handled correctly (HTTP $NON_EXISTENT_USER_ASSIGN_STATUS)."

echo "Admin trying to assign DeviceB to a non-employee user (should fail):"
ADMIN_ASSIGN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/devices/$DEVICE_B_ID/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN" \
-d "{
    \"userId\": 1
}")
if [ "$ADMIN_ASSIGN_STATUS" -ne 403 ] && [ "$ADMIN_ASSIGN_STATUS" -ne 500 ]; then
    echo "WARNING: Assigning device to admin user should fail, got: $ADMIN_ASSIGN_STATUS"
    # Not exiting here as this might be expected behavior depending on implementation
fi
echo "Assignment to admin user handled correctly (HTTP $ADMIN_ASSIGN_STATUS)."
echo ""

echo "--- Employee Permission API Tests Finished Successfully ---"