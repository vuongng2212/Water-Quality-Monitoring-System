#!/usr/bin/env bash

set -euo pipefail

API_URL="${API_URL:-http://localhost:8081/api/sensor-data}"
SETTINGS_URL="${SETTINGS_URL:-http://localhost:8081/api/device/settings}"
API_KEY="${API_KEY:-9ab99d15-cc6c-4a4e-8f4f-477c8a8ed374}"
DEFAULT_INTERVAL_SECONDS=10

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required but not installed."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed."
  exit 1
fi

echo "Testing backend API..."
echo "Settings URL: $SETTINGS_URL"
echo "API Key: ${API_KEY:0:10}..."

get_device_settings() {
  local response
  response=$(curl -sS -H "Content-Type: application/json" \
    -H "X-API-KEY: $API_KEY" \
    -H "Cache-Control: no-cache" \
    "$SETTINGS_URL?t=$(date +%s)")

  if [[ -z "$response" ]]; then
    echo "Error fetching settings: empty response"
    return 1
  fi

  echo "Fetched settings: $(jq -c '.' <<<"$response")" >&2
  printf '%s' "$response"
}

send_sensor_data() {
  local settings_json="$1"
  local ph temperature turbidity tds payload response status_code

  ph=$(awk -v r="$RANDOM" 'BEGIN { printf "%.1f", 5.5 + (r / 32767) * 4.0 }')
  temperature=$(awk -v r="$RANDOM" 'BEGIN { printf "%.1f", 30.0 + (r / 32767) * 15.0 }')
  turbidity=$(awk -v r="$RANDOM" 'BEGIN { printf "%.2f", 40.0 + (r / 32767) * 15.0 }')
  tds=$((800 + RANDOM % 300))

  payload=$(jq -n \
    --argjson currentSettings "$settings_json" \
    --arg ph "$ph" \
    --arg temperature "$temperature" \
    --arg turbidity "$turbidity" \
    --arg tds "$tds" \
    '{
      ph: ($ph | tonumber),
      temperature: ($temperature | tonumber),
      turbidity: ($turbidity | tonumber),
      tds: ($tds | tonumber),
      currentSettings: $currentSettings
    }')

  response=$(curl -sS -o /tmp/test-api-response.$$ -w "%{http_code}" \
    -X POST "$API_URL?t=$(date +%s)" \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: $API_KEY" \
    -H "Cache-Control: no-cache" \
    -d "$payload")
  status_code="$response"

  if [[ -f /tmp/test-api-response.$$ && -s /tmp/test-api-response.$$ ]]; then
    echo "Sent data successfully! Status: $status_code"
    echo "Response: $(cat /tmp/test-api-response.$$)"
  else
    echo "Sent data successfully! Status: $status_code"
  fi

  rm -f /tmp/test-api-response.$$
}

while true; do
  settings_json=$(get_device_settings) || {
    sleep "$DEFAULT_INTERVAL_SECONDS"
    continue
  }

  send_sensor_data "$settings_json"

  interval_seconds=$(jq -r '.dataIntervalSeconds // empty' <<<"$settings_json")
  if [[ -z "$interval_seconds" || "$interval_seconds" == "null" ]]; then
    interval_seconds="$DEFAULT_INTERVAL_SECONDS"
  fi

  sleep "$interval_seconds"
done
