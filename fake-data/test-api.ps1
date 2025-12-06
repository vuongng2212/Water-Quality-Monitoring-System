# Test script for backend API using PowerShell
# Run: .\test-api.ps1

$API_URL = 'http://localhost:8081/api/sensor-data'
$SETTINGS_URL = 'http://localhost:8081/api/device/settings'
$API_KEY = 'd8ab63e7-3896-4909-8215-ba43a28edc8d'

Write-Host "Testing backend API..."
Write-Host "Settings URL: $SETTINGS_URL"
Write-Host "API Key: $($API_KEY.Substring(0,10))..."

# Function to fetch settings
function Get-DeviceSettings {
    try {
        $headers = @{
            'Content-Type' = 'application/json'
            'X-API-KEY' = $API_KEY
            'Cache-Control' = 'no-cache'
        }
        $response = Invoke-RestMethod -Uri $SETTINGS_URL -Method GET -Headers $headers
        Write-Host "Fetched settings: $($response | ConvertTo-Json -Compress)"
        return $response
    } catch {
        Write-Host "Error fetching settings: $($_.Exception.Message)"
        return $null
    }
}

# Function to send sensor data
function Send-SensorData {
    param($settings)
    $data = @{
        ph = [math]::Round((Get-Random -Minimum 45 -Maximum 85) / 10.0, 1)
        temperature = [math]::Round((Get-Random -Minimum 200 -Maximum 300) / 10.0, 1)
        turbidity = [math]::Round((Get-Random -Minimum 10 -Maximum 35) / 10.0, 2)
        conductivity = Get-Random -Minimum 500 -Maximum 800
        currentSettings = $settings
    }
    try {
        $headers = @{
            'Content-Type' = 'application/json'
            'X-API-KEY' = $API_KEY
            'Cache-Control' = 'no-cache'
        }
        $response = Invoke-WebRequest -Uri $API_URL -Method POST -Headers $headers -Body ($data | ConvertTo-Json)
        Write-Host "Sent data successfully! Status: $($response.StatusCode)"
    } catch {
        Write-Host "Error sending data: $($_.Exception.Message)"
    }
}

# Main loop
while ($true) {
    $settings = Get-DeviceSettings
    if ($settings) {
        Send-SensorData -settings $settings
    }
    Start-Sleep -Seconds ($settings.dataIntervalSeconds)
}