#!/bin/bash

# Stop on first error
set -e

echo "--- Starting Multi-Tenancy API Tests ---"
echo ""

BASE_URL="http://localhost:8080/api"

# --- 1. Login as adminA ---
echo "--- 1. Logging in as adminA ---"
TOKEN_ADMIN_A_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "adminA",
    "password": "admin"
}')
TOKEN_ADMIN_A=$(echo $TOKEN_ADMIN_A_RESPONSE | jq -r '.token')

if [ -z "$TOKEN_ADMIN_A" ] || [ "$TOKEN_ADMIN_A" == "null" ]; then
    echo "Login as adminA failed. Could not get JWT token."
    echo "Response: $TOKEN_ADMIN_A_RESPONSE"
    exit 1
fi
echo "Login as adminA successful. JWT obtained."
echo ""

# --- 2. Login as adminB ---
echo "--- 2. Logging in as adminB ---"
TOKEN_ADMIN_B_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "adminB",
    "password": "admin"
}')
TOKEN_ADMIN_B=$(echo $TOKEN_ADMIN_B_RESPONSE | jq -r '.token')

if [ -z "$TOKEN_ADMIN_B" ] || [ "$TOKEN_ADMIN_B" == "null" ]; then
    echo "Login as adminB failed. Could not get JWT token."
    echo "Response: $TOKEN_ADMIN_B_RESPONSE"
    exit 1
fi
echo "Login as adminB successful. JWT obtained."
echo ""

# --- 3. AdminA creates a user and a device ---
echo "--- 3. AdminA creates a user (employeeA_test) and a device (deviceA_test) ---"
EMPLOYEE_A_USERNAME="employeeA_test_$(date +%s)"
EMPLOYEE_A_EMAIL="employeeA_test_$(date +%s)@factorya.com"
DEVICE_A_NAME="DeviceA_Test_$(date +%s)"

EMPLOYEE_A_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/users \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN_A" \
-d "{
    \"username\": \"$EMPLOYEE_A_USERNAME\",
    \"password\": \"password\",
    \"email\": \"$EMPLOYEE_A_EMAIL\",
    \"role\": \"EMPLOYEE\"
}")
EMPLOYEE_A_ID=$(echo $EMPLOYEE_A_CREATE_RESPONSE | jq -r '.id')
echo "AdminA created EmployeeA with ID: $EMPLOYEE_A_ID"

DEVICE_A_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/devices \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN_A" \
-d "{
    \"name\": \"$DEVICE_A_NAME\"
}")
DEVICE_A_ID=$(echo $DEVICE_A_CREATE_RESPONSE | jq -r '.id')
echo "AdminA created DeviceA with ID: $DEVICE_A_ID"
echo ""

# --- 4. AdminB creates a user and a device ---
echo "--- 4. AdminB creates a user (employeeB_test) and a device (deviceB_test) ---"
EMPLOYEE_B_USERNAME="employeeB_test_$(date +%s)"
EMPLOYEE_B_EMAIL="employeeB_test_$(date +%s)@factoryb.com"
DEVICE_B_NAME="DeviceB_Test_$(date +%s)"

EMPLOYEE_B_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/users \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN_B" \
-d "{
    \"username\": \"$EMPLOYEE_B_USERNAME\",
    \"password\": \"password\",
    \"email\": \"$EMPLOYEE_B_EMAIL\",
    \"role\": \"EMPLOYEE\"
}")
EMPLOYEE_B_ID=$(echo $EMPLOYEE_B_CREATE_RESPONSE | jq -r '.id')
echo "AdminB created EmployeeB with ID: $EMPLOYEE_B_ID"

DEVICE_B_CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/devices \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN_ADMIN_B" \
-d "{
    \"name\": \"$DEVICE_B_NAME\"
}")
DEVICE_B_ID=$(echo $DEVICE_B_CREATE_RESPONSE | jq -r '.id')
echo "AdminB created DeviceB with ID: $DEVICE_B_ID"
echo ""

# --- 5. Verify data isolation for AdminA ---
echo "--- 5. Verifying data isolation for AdminA ---"
echo "AdminA fetching all users:"
ADMIN_A_USERS=$(curl -s -X GET $BASE_URL/users \
-H "Authorization: Bearer $TOKEN_ADMIN_A")
echo $ADMIN_A_USERS | jq .
if [[ $(echo $ADMIN_A_USERS | jq '.[] | select(.id=='$EMPLOYEE_B_ID')') != "" ]]; then
    echo "ERROR: AdminA can see EmployeeB. Isolation failed!"
    exit 1
fi
echo "AdminA correctly cannot see EmployeeB."

echo "AdminA fetching all devices:"
ADMIN_A_DEVICES=$(curl -s -X GET $BASE_URL/devices \
-H "Authorization: Bearer $TOKEN_ADMIN_A")
echo $ADMIN_A_DEVICES | jq .
if [[ $(echo $ADMIN_A_DEVICES | jq '.[] | select(.id=='$DEVICE_B_ID')') != "" ]]; then
    echo "ERROR: AdminA can see DeviceB. Isolation failed!"
    exit 1
fi
echo "AdminA correctly cannot see DeviceB."

echo "AdminA attempting to fetch EmployeeB by ID (expecting error):"
ADMIN_A_GET_EMPLOYEE_B=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/users/$EMPLOYEE_B_ID \
-H "Authorization: Bearer $TOKEN_ADMIN_A")
if [ "$ADMIN_A_GET_EMPLOYEE_B" != "403" ]; then # Expecting 403 Forbidden for unauthorized access
    echo "ERROR: AdminA could fetch EmployeeB by ID, or received unexpected status: $ADMIN_A_GET_EMPLOYEE_B. Isolation failed!"
    exit 1
fi
echo "AdminA correctly received error for EmployeeB by ID (HTTP $ADMIN_A_GET_EMPLOYEE_B)."

echo "AdminA attempting to fetch DeviceB by ID (expecting error):"
ADMIN_A_GET_DEVICE_B=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/devices/$DEVICE_B_ID \
-H "Authorization: Bearer $TOKEN_ADMIN_A")
if [ "$ADMIN_A_GET_DEVICE_B" != "403" ]; then # Expecting 403 Forbidden for unauthorized access
    echo "ERROR: AdminA could fetch DeviceB by ID, or received unexpected status: $ADMIN_A_GET_DEVICE_B. Isolation failed!"
    exit 1
fi
echo "AdminA correctly received error for DeviceB by ID (HTTP $ADMIN_A_GET_DEVICE_B)."
echo ""

# --- 6. Verify data isolation for AdminB ---
echo "--- 6. Verifying data isolation for AdminB ---"
echo "AdminB fetching all users:"
ADMIN_B_USERS=$(curl -s -X GET $BASE_URL/users \
-H "Authorization: Bearer $TOKEN_ADMIN_B")
echo $ADMIN_B_USERS | jq .
if [[ $(echo $ADMIN_B_USERS | jq '.[] | select(.id=='$EMPLOYEE_A_ID')') != "" ]]; then
    echo "ERROR: AdminB can see EmployeeA. Isolation failed!"
    exit 1
fi
echo "AdminB correctly cannot see EmployeeA."

echo "AdminB fetching all devices:"
ADMIN_B_DEVICES=$(curl -s -X GET $BASE_URL/devices \
-H "Authorization: Bearer $TOKEN_ADMIN_B")
echo $ADMIN_B_DEVICES | jq .
if [[ $(echo $ADMIN_B_DEVICES | jq '.[] | select(.id=='$DEVICE_A_ID')') != "" ]]; then
    echo "ERROR: AdminB can see DeviceA. Isolation failed!"
    exit 1
fi
echo "AdminB correctly cannot see DeviceA."

echo "--- Multi-Tenancy API Tests Finished Successfully ---"