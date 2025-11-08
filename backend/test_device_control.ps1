# Test Device Control APIs
Write-Host "=== Testing Device Control APIs ===" -ForegroundColor Cyan

# First, login to get JWT token
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    username = "adminA"
    password = "admin"
} | ConvertTo-Json

try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $tokenResponse.token

    if (-not $token) {
        Write-Host "❌ Login failed. Could not get JWT token." -ForegroundColor Red
        Write-Host "Response: $tokenResponse" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Login successful. JWT obtained." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get first device ID
Write-Host "2. Getting device list..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $devices = Invoke-RestMethod -Uri "http://localhost:8081/api/devices" -Method GET -Headers $headers
    $deviceId = $devices[0].id

    if (-not $deviceId) {
        Write-Host "❌ No devices found." -ForegroundColor Red
        Write-Host "Response: $devices" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Found device ID: $deviceId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get devices: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test valve control - Open valve
Write-Host "3. Testing valve control (OPEN)..." -ForegroundColor Yellow
$valveBody = @{
    open = $true
} | ConvertTo-Json

try {
    $valveResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/controls/devices/$deviceId/valve" -Method POST -Body $valveBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Valve control (OPEN) successful" -ForegroundColor Green
    Write-Host "Response: $($valveResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Valve control (OPEN) failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test valve control - Close valve
Write-Host "4. Testing valve control (CLOSE)..." -ForegroundColor Yellow
$valveBody = @{
    open = $false
} | ConvertTo-Json

try {
    $valveResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/controls/devices/$deviceId/valve" -Method POST -Body $valveBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Valve control (CLOSE) successful" -ForegroundColor Green
    Write-Host "Response: $($valveResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Valve control (CLOSE) failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test data interval setting
Write-Host "5. Testing data interval setting..." -ForegroundColor Yellow
$intervalBody = @{
    interval = 15
} | ConvertTo-Json

try {
    $intervalResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/controls/devices/$deviceId/interval" -Method POST -Body $intervalBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Data interval setting successful" -ForegroundColor Green
    Write-Host "Response: $($intervalResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Data interval setting failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test completed ===" -ForegroundColor Cyan