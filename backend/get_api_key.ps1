# Get API key for device simulation
Write-Host "=== Getting API Key for Device Simulation ===" -ForegroundColor Cyan

# Login to get JWT token
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    username = "adminA"
    password = "admin"
} | ConvertTo-Json

try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $tokenResponse.token

    if (-not $token) {
        Write-Host "❌ Login failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Login successful." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get first device and its API key
Write-Host "2. Getting device API key..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $devices = Invoke-RestMethod -Uri "http://localhost:8081/api/devices" -Method GET -Headers $headers
    $device = $devices[0]

    if (-not $device) {
        Write-Host "❌ No devices found." -ForegroundColor Red
        exit 1
    }

    $apiKey = $device.apiKey
    Write-Host "✅ Device ID: $($device.id)" -ForegroundColor Green
    Write-Host "✅ API Key: $apiKey" -ForegroundColor Green

    # Update the send-sensor.js file
    Write-Host "3. Updating send-sensor.js with correct API key..." -ForegroundColor Yellow
    $scriptPath = "..\fake-data\send-sensor.js"
    $content = Get-Content $scriptPath -Raw
    $newContent = $content -replace "9fccf562-2e40-492b-9370-0fb4ca2ed522", $apiKey
    Set-Content $scriptPath $newContent

    Write-Host "✅ Updated send-sensor.js with API key: $apiKey" -ForegroundColor Green

} catch {
    Write-Host "❌ Failed to get device API key: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=== API Key Update Complete ===" -ForegroundColor Cyan
Write-Host "Now you can run: node ..\fake-data\send-sensor.js" -ForegroundColor White