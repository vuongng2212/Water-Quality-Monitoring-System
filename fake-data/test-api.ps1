# Test script for backend API using PowerShell
# Run: .\test-api.ps1

$API_URL = 'http://localhost:8081/api/sensor-data'
$SETTINGS_URL = 'http://localhost:8081/api/device/settings'
$API_KEY = 'ef81b8ba-c741-41c2-9a91-7f5f45e104fa'

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
        ph = [math]::Round((Get-Random -Minimum 55 -Maximum 95) / 10.0, 1)
        temperature = [math]::Round((Get-Random -Minimum 300 -Maximum 450) / 10.0, 1)
        turbidity = [math]::Round((Get-Random -Minimum 400 -Maximum 550) / 10.0, 2)
        tds = Get-Random -Minimum 800 -Maximum 1100
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