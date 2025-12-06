# 🔧 TROUBLESHOOTING GUIDE
## Water Quality Monitoring System - IoT Team

**Purpose:** Help IoT team debug common issues when integrating with backend  
**Last Updated:** January 2024  
**Audience:** IoT Developers (ESP8266/ESP32 firmware engineers)

---

## 📋 TABLE OF CONTENTS

1. [HTTP Errors (4xx/5xx)](#http-errors)
2. [Authentication Issues](#authentication-issues)
3. [Data Validation Failures](#data-validation-failures)
4. [Network & Connection Issues](#network--connection-issues)
5. [Device Control Commands Issues](#device-control-commands-issues)
6. [Database & Latency Issues](#database--latency-issues)
7. [Debugging Tools & Techniques](#debugging-tools--techniques)
8. [Common Firmware Bugs](#common-firmware-bugs)
9. [Performance Optimization Tips](#performance-optimization-tips)

---

## 🚫 HTTP ERRORS

### Error 400: Bad Request

**Symptom:** 
```
HTTP 400 Bad Request
{
  "error": "Validation failed",
  "message": "pH value out of range [0, 14]",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Possible Causes:**
1. **Invalid JSON format**
   - Typo in field names (e.g., "PH" instead of "ph")
   - Missing required field
   - Wrong data type (string instead of float)

2. **Value out of range**
   - pH < 0 or pH > 14
   - Temperature < -40 or > 60
   - Turbidity < 0 or > 1000
   - Conductivity < 0 or > 5000

3. **Malformed JSON**
   - Missing quotes: `{ph: 7.2}` ❌ vs `{"ph": 7.2}` ✅
   - Trailing comma: `{"ph": 7.2,}` ❌
   - Extra spaces: `{"ph" : 7.2}` ✅ (ok)

**Debug Steps:**
```cpp
// 1. Print payload before sending
Serial.println("Sending: " + payload);

// 2. Validate values locally first
if (ph < 0 || ph > 14) {
  Serial.println("ERROR: pH out of range");
  return;
}

// 3. Check JSON syntax with online validator
// https://jsonlint.com/

// 4. Log HTTP response
Serial.print("HTTP Status: ");
Serial.println(httpCode);
Serial.println("Response: " + response);
```

**Solution:**
```cpp
// Correct payload format
String payload = "{";
payload += "\"ph\":" + String(ph, 2) + ",";      // 2 decimals
payload += "\"temperature\":" + String(temp, 2) + ",";
payload += "\"turbidity\":" + String(turbidity, 2) + ",";
payload += "\"conductivity\":" + String(conductivity);  // No comma on last
payload += "}";

Serial.println("Payload: " + payload);  // Debug: verify format
```

---

### Error 401: Unauthorized

**Symptom:**
```
HTTP 401 Unauthorized
{
  "error": "Invalid or expired API Key",
  "message": "Device not found or key mismatch"
}
```

**Possible Causes:**
1. **API Key not sent**
   - Missing header `X-API-KEY`
   - Typo in header name (case-sensitive: `X-API-KEY` ≠ `x-api-key`)

2. **API Key incorrect**
   - Copy-paste error
   - Expired/revoked (admin deleted device)
   - Device ID mismatch (wrong key for this device)

3. **API Key format wrong**
   - Should be UUID v4: `550e8400-e29b-41d4-a716-446655440000`
   - Check for extra spaces or special chars

**Debug Steps:**
```cpp
// 1. Verify API Key is set correctly
#define API_KEY "550e8400-e29b-41d4-a716-446655440000"
Serial.println("API Key: " + String(API_KEY));

// 2. Check header is sent
http.addHeader("X-API-KEY", API_KEY);  // Correct
// http.addHeader("x-api-key", API_KEY);  // WRONG - case matters!

// 3. Log full request
Serial.print("URL: ");
Serial.println(url);
Serial.print("Header: X-API-KEY = ");
Serial.println(API_KEY);

// 4. Test with curl
// curl -X POST http://localhost:8080/api/sensor-data \
//   -H "X-API-KEY: 550e8400-..." \
//   -d {...}
```

**Solution:**
```cpp
#include <WiFiClient.h>
#include <HTTPClient.h>

const char* API_KEY = "550e8400-e29b-41d4-a716-446655440000";
const char* SERVER_URL = "https://api.factory.com/api/sensor-data";

void sendSensorData(float ph, float temp, float turbidity, int cond) {
  HTTPClient http;
  
  http.begin(SERVER_URL);
  
  // IMPORTANT: Case-sensitive header name
  http.addHeader("X-API-KEY", API_KEY);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"ph\":" + String(ph, 2) + ", ...}";
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 201) {
    Serial.println("SUCCESS: Data sent");
  } else if (httpCode == 401) {
    Serial.println("ERROR: Check API Key!");
    Serial.println("Response: " + http.getString());
  }
  
  http.end();
}
```

---

### Error 403: Forbidden

**Symptom:**
```
HTTP 403 Forbidden
{
  "error": "Access Denied",
  "message": "Device is inactive or not authorized"
}
```

**Possible Causes:**
1. **Device disabled**
   - Admin disabled device from UI
   - Device status: `is_active = false` in database

2. **Wrong factory**
   - API Key belongs to different factory
   - Device transferred to another factory

3. **Device deleted**
   - Admin deleted device
   - Key no longer valid

**Solution:**
```
1. Contact admin to check device status
2. Ask admin to enable device in UI
3. If deleted, admin must create new device + provide new API Key
4. Verify device belongs to your factory
```

---

### Error 413: Payload Too Large

**Symptom:**
```
HTTP 413 Payload Too Large
```

**Possible Causes:**
1. **Payload > 1 KB**
   - Unlikely with just 4 sensor values (~200 bytes)
   - Could happen if adding extra fields

**Solution:**
```cpp
// Check payload size before sending
String payload = "{...}";
Serial.print("Payload size: ");
Serial.print(payload.length());
Serial.println(" bytes");

if (payload.length() > 1024) {
  Serial.println("ERROR: Payload too large!");
  return;
}

// Max payload should be ~200 bytes:
// {"ph":7.2,"temperature":25.5,"turbidity":2.3,"conductivity":650}
// = ~70 bytes (very small)
```

---

### Error 429: Too Many Requests

**Symptom:**
```
HTTP 429 Too Many Requests
Header: Retry-After: 60
```

**Possible Causes:**
1. **Sending too frequently**
   - Device interval < 10 seconds
   - Multiple devices burst-sending at same time
   - Accidental multiple connections

2. **Rate limit (future feature)**
   - Backend limits ~100 requests/minute per device
   - Current v1.0 doesn't enforce, but will in v2.0

**Solution:**
```cpp
// Check interval setting
const int SEND_INTERVAL_MS = 30000;  // 30 seconds - GOOD
// const int SEND_INTERVAL_MS = 5000;   // 5 seconds - BAD

// Implement rate limiting on device side
unsigned long lastSendTime = 0;

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastSendTime >= SEND_INTERVAL_MS) {
    sendSensorData();
    lastSendTime = currentTime;
  }
  
  // Handle 429 response
  if (httpCode == 429) {
    Serial.println("Rate limit hit. Waiting longer...");
    delay(60000);  // Wait 60 seconds per Retry-After header
  }
}
```

---

### Error 500/503: Server Error

**Symptom:**
```
HTTP 500 Internal Server Error
HTTP 503 Service Unavailable
```

**Possible Causes:**
1. **Database connection lost**
   - MariaDB crashed/restarted
   - Network between Spring Boot ↔ Database down

2. **Backend crashed**
   - Java exception in Spring Boot
   - Out of memory
   - Disk full

3. **Network timeout**
   - Request took > 30 seconds
   - Server hung on something

**Debug Steps:**
```cpp
// Device side: Implement retry with exponential backoff
int retryCount = 0;
const int MAX_RETRIES = 3;

while (retryCount < MAX_RETRIES) {
  int httpCode = http.POST(payload);
  
  if (httpCode == 201 || httpCode == 200) {
    Serial.println("SUCCESS");
    break;
  } else if (httpCode >= 500) {
    retryCount++;
    unsigned long waitTime = 1000 * pow(2, retryCount - 1);  // 1s, 2s, 4s
    Serial.print("Server error. Retry after ");
    Serial.print(waitTime);
    Serial.println("ms");
    delay(waitTime);
  } else {
    Serial.println("Non-recoverable error. Stop retrying.");
    break;
  }
}

// Backend side: Check logs
// SSH to server: tail -f /var/log/water-monitoring/application.log
// Docker: docker logs water-monitoring-backend
```

**Solution:**
```
1. Device: Implement exponential backoff retry (max 3 times)
2. Device: Log error locally (to EEPROM/SPIFFS)
3. Wait for backend to recover
4. Once recovered, resend buffered data
5. Backend admin: Check logs for root cause
```

---

## 🔐 AUTHENTICATION ISSUES

### "Device not found or key mismatch"

**Symptom:**
```
HTTP 401
Message: "Device not found or key mismatch"
```

**Causes:**
1. API Key doesn't exist in database
2. API Key disabled/revoked
3. Typo in API Key

**Check:**
```
1. Ask admin to verify device exists in Web UI
2. Check Device Management → Copy exact API Key
3. Verify no extra spaces/characters
4. Test with curl:
   curl -H "X-API-KEY: YOUR_KEY" http://localhost:8080/api/sensor-data -d {...}
```

---

### "Invalid JWT Token"

**Symptom (Web Dashboard):**
```
Error: Invalid or expired token
Redirect to login page
```

**Causes:**
1. Token expired (24 hour lifetime)
2. Token corrupted/invalid
3. Wrong secret key on server

**Solution:**
```javascript
// Frontend: Store token in localStorage
const token = localStorage.getItem('token');

// Check expiry
const decoded = jwt_decode(token);
if (decoded.exp * 1000 < Date.now()) {
  // Token expired, re-login
  window.location.href = '/login';
}

// Send with Authorization header
fetch('/api/sensor-data/latest', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

---

## ❌ DATA VALIDATION FAILURES

### pH Out of Range

**Symptom:**
```
HTTP 400
"pH value out of range [0, 14]"
```

**Causes:**
1. **Sensor reading wrong**
   - pH sensor not calibrated
   - Sensor broken (returning negative/extreme values)
   - Wrong analog-to-digital conversion

2. **Software bug**
   - Integer division truncating values
   - Wrong scaling formula
   - Uninitialized variable

**Debug Steps:**
```cpp
float readPHSensor() {
  int rawValue = analogRead(PH_PIN);
  
  // Debug: Print raw value
  Serial.print("Raw pH ADC: ");
  Serial.println(rawValue);
  
  // Convert to voltage (ESP32: 0-4095 → 0-3.3V)
  float voltage = (rawValue / 4095.0) * 3.3;
  Serial.print("Voltage: ");
  Serial.println(voltage);
  
  // Convert voltage to pH (depends on sensor)
  // Example: linear calibration 0V=0pH, 3.3V=14pH
  float ph = (voltage / 3.3) * 14.0;
  
  // VALIDATE before sending
  if (ph < 0 || ph > 14) {
    Serial.println("ERROR: pH out of range!");
    return -1;  // Error code
  }
  
  Serial.print("Calculated pH: ");
  Serial.println(ph);
  
  return ph;
}
```

**Solution:**
```
1. Calibrate sensor with 7.0 and 10.0 pH buffers
2. Test sensor independently (verify voltage output)
3. Check ADC conversion formula
4. Add local validation before sending
5. Test with known values (water with known pH)
```

---

### Temperature Out of Range

**Similar to pH, check:**
1. Sensor type (DS18B20, DHT22, LM35)
2. Calibration (compare with thermometer)
3. Wire connections
4. Library version

```cpp
float readTemperature() {
  float temp = sensor.readTemperature();
  
  // Validate: should be between -40 and 60°C
  if (temp < -40.0 || temp > 60.0) {
    Serial.println("ERROR: Temp out of range!");
    Serial.print("Got: ");
    Serial.println(temp);
    return -999;  // Error
  }
  
  return temp;
}
```

---

### Turbidity/Conductivity Issues

**Common Problems:**

1. **Noise in analog readings**
   - Solution: Take multiple samples, average them
   ```cpp
   float readTurbidity() {
     float sum = 0;
     for (int i = 0; i < 10; i++) {
       sum += analogRead(TURBIDITY_PIN);
       delay(10);
     }
     return (sum / 10.0) / 4095.0 * 1000.0;  // Scale to NTU
   }
   ```

2. **Sensor unplugged/broken**
   - Check wiring
   - Verify ADC channel not used by WiFi
   - Test with multimeter

---

## 🌐 NETWORK & CONNECTION ISSUES

### WiFi Connection Fails

**Symptom:**
```
WiFi.status() != WL_CONNECTED
Cannot reach server
```

**Debug:**
```cpp
void setupWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal: ");
    Serial.println(WiFi.RSSI());  // dBm, higher is better (-30 to -80)
  } else {
    Serial.println("WiFi connection FAILED!");
    Serial.print("Status code: ");
    Serial.println(WiFi.status());
    // Status codes: WL_IDLE_STATUS, WL_SSID_CHANGE, WL_INIT_STATE, etc.
  }
}
```

**Solutions:**
1. Check WiFi credentials (SSID/password)
2. Verify device near WiFi router
3. Check WiFi frequency (2.4GHz vs 5GHz)
4. Restart router + device
5. Update ESP32/ESP8266 firmware

---

### HTTP Connection Timeout

**Symptom:**
```
Connection timeout after 10 seconds
Server not responding
```

**Debug:**
```cpp
void sendWithTimeout() {
  HTTPClient http;
  
  // Set timeouts
  http.setConnectTimeout(10000);  // 10 seconds to connect
  http.setTimeout(30000);          // 30 seconds to get response
  
  http.begin(url);
  
  Serial.println("Connecting to server...");
  int httpCode = http.POST(payload);
  
  if (httpCode == HTTPC_ERROR_CONNECT_TIMEOUT) {
    Serial.println("ERROR: Connection timeout (can't reach server)");
    Serial.println("Check: Server IP, Firewall, Network");
  } else if (httpCode == HTTPC_ERROR_READ_TIMEOUT) {
    Serial.println("ERROR: Read timeout (server slow/crashed)");
    Serial.println("Check: Server status, Database");
  } else if (httpCode < 0) {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode));
  } else {
    Serial.print("HTTP Status: ");
    Serial.println(httpCode);
  }
  
  http.end();
}
```

**Solutions:**
1. Check server IP address is correct
2. Ping server: `ping api.factory.com`
3. Check DNS resolution: Add `http.begin("http://192.168.1.100:8080/...")`
4. Check firewall rules (port 8080 open?)
5. Verify server is running: `ps aux | grep java`

---

### SSL/HTTPS Certificate Error

**Symptom:**
```
SSL error / Certificate verification failed
HTTPS connection fails
```

**Debug & Fix:**
```cpp
// Option 1: Disable certificate verification (DEV ONLY!)
http.begin(url);
http.setInsecure();  // DANGER: Security risk, dev only
int httpCode = http.POST(payload);

// Option 2: Add CA certificate (PRODUCTION)
const char* ca_cert = R"(-----BEGIN CERTIFICATE-----
... cert content ...
-----END CERTIFICATE-----)";

WiFiClientSecure client;
client.setCACert(ca_cert);
http.begin(client, url);
int httpCode = http.POST(payload);

// Option 3: Check certificate date
// Make sure server cert not expired
// openssl s_client -connect api.factory.com:443 -showcerts
```

---

### DNS Resolution Fails

**Symptom:**
```
Cannot resolve hostname
GetHostByName failed
```

**Debug:**
```cpp
void testDNS() {
  const char* hostname = "api.factory.com";
  
  Serial.print("Resolving: ");
  Serial.println(hostname);
  
  IPAddress ip = WiFi.hostByName(hostname);
  
  if (ip == (uint32_t)0x00000000) {
    Serial.println("ERROR: DNS resolution failed!");
    Serial.println("Solutions:");
    Serial.println("1. Check WiFi connected");
    Serial.println("2. Check DNS server reachable");
    Serial.println("3. Use IP address instead: 192.168.1.100");
  } else {
    Serial.print("Resolved to: ");
    Serial.println(ip);
  }
}
```

---

## 🎛️ DEVICE CONTROL COMMANDS ISSUES

### Commands Not Received (GET returns empty array)

**Symptom:**
```
GET /api/controls/devices/1/commands → []
No commands returned even though admin sent one
```

**Debug Steps:**
```
1. Verify device polling endpoint
   - Correct URL: /api/controls/devices/{deviceId}/commands
   - Correct device ID
   - Correct header: X-API-KEY

2. Check polling frequency
   - Should poll every 10-15 seconds
   - Not just once at startup

3. Verify device ID in URL matches API Key
   - If device 1 has key A, use /api/controls/devices/1/commands
   - If device 2 has key B, use /api/controls/devices/2/commands
   - API Key determines deviceId automatically
```

**Correct Implementation:**
```cpp
unsigned long lastCommandCheck = 0;
const int COMMAND_CHECK_INTERVAL = 15000;  // 15 seconds

void loop() {
  // Poll commands regularly
  if (millis() - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    checkForCommands();
    lastCommandCheck = millis();
  }
}

void checkForCommands() {
  HTTPClient http;
  String url = String(SERVER) + "/api/controls/devices/" + String(DEVICE_ID) + "/commands";
  
  http.begin(url);
  http.addHeader("X-API-KEY", API_KEY);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Commands: " + response);
    
    // Parse JSON array and execute commands
    // ...
  } else {
    Serial.print("Error checking commands: ");
    Serial.println(httpCode);
  }
  
  http.end();
}
```

---

### Device Command Timeout (No Status Report)

**Symptom:**
```
Admin sends command
Device receives it
But device forgets to report status
Command stays PENDING forever
```

**Solution:**
```cpp
// Always report command status after executing

void executeCommand(JsonObject cmd) {
  String commandId = cmd["id"].as<String>();
  String commandType = cmd["type"].as<String>();
  
  bool success = false;
  String result = "";
  
  if (commandType == "VALVE_CONTROL") {
    bool open = cmd["payload"]["open"].as<bool>();
    success = controlValve(open);
    result = success ? "Valve opened" : "Valve failed";
  }
  else if (commandType == "UPDATE_INTERVAL") {
    int interval = cmd["payload"]["interval"].as<int>();
    success = updateInterval(interval);
    result = success ? "Interval updated" : "Update failed";
  }
  
  // IMPORTANT: Report status
  reportCommandStatus(commandId, success ? "COMPLETED" : "FAILED", result);
}

void reportCommandStatus(String cmdId, String status, String result) {
  HTTPClient http;
  String url = String(SERVER) + "/api/controls/commands/" + cmdId + "/status";
  
  http.begin(url);
  http.addHeader("X-API-KEY", API_KEY);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"status\":\"" + status + "\",\"result\":{\"message\":\"" + result + "\"}}";
  
  int httpCode = http.PUT(payload);
  
  if (httpCode == 200) {
    Serial.println("Status reported successfully");
  } else {
    Serial.print("Failed to report status: ");
    Serial.println(httpCode);
  }
  
  http.end();
}
```

---

## 📊 DATABASE & LATENCY ISSUES

### Insert Slow / Response Takes > 1 second

**Symptom:**
```
POST /api/sensor-data takes 1-2 seconds
Dashboard updates slowly
```

**Causes:**
1. Database slow (too many records, missing index)
2. Network latency (bad WiFi signal)
3. Server processing slow (Java GC pause)

**Debug:**
```cpp
unsigned long startTime = millis();
int httpCode = http.POST(payload);
unsigned long endTime = millis();

Serial.print("Request took: ");
Serial.print(endTime - startTime);
Serial.println("ms");

// Expected: < 500ms
// Acceptable: < 1000ms
// Bad: > 1000ms
```

**Optimization:**
```
1. Device side:
   - Reduce WiFi interference (move closer to router)
   - Use 5GHz WiFi if available
   - Reduce payload size (but already minimal)

2. Server side (IT team):
   - Add index on (device_id, created_at)
   - Archive old data (> 1 year)
   - Increase database RAM
   - Monitor slow query log
```

---

### Data Not Appearing in Database

**Symptom:**
```
HTTP 201 returned (success)
But data not in database
```

**Debug:**
```
1. Check if data actually got inserted:
   mysql> SELECT COUNT(*) FROM sensor_data WHERE device_id = 1;
   
2. Check timestamp column:
   mysql> SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 5;
   
3. Check database logs:
   tail -f /var/log/mysql/error.log
   
4. Check Spring Boot logs:
   docker logs water-monitoring-backend | grep -i error
```

**Possible Issues:**
- Database transaction rolled back
- Data inserted but filtered by factory_id
- Clock out of sync (data from future/past)

---

## 🐛 COMMON FIRMWARE BUGS

### 1. JSON Serialization Library Issues

**Problem:**
```cpp
// WRONG: ArduinoJson v5 syntax on v6
StaticJsonBuffer<256> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

// CORRECT: ArduinoJson v6 syntax
StaticJsonDocument<256> doc;
JsonObject root = doc.to<JsonObject>();
```

**Fix:**
```cpp
#include <ArduinoJson.h>

void sendData(float ph, float temp) {
  // Create JSON with ArduinoJson v6
  StaticJsonDocument<256> doc;
  doc["ph"] = ph;
  doc["temperature"] = temp;
  doc["turbidity"] = 2.3;
  doc["conductivity"] = 650;
  
  // Serialize to string
  String payload;
  serializeJson(doc, payload);
  
  // Send via HTTP
  // ...
}
```

---

### 2. Memory Leak / Out of Memory

**Symptom:**
```
Device crashes after running 1-2 days
Stack overflow errors
Watchdog reset
```

**Debug:**
```cpp
void setup() {
  Serial.begin(115200);
  printFreeMemory();
}

void loop() {
  sendSensorData();
  
  // Print memory every 100 iterations
  static int counter = 0;
  if (++counter % 100 == 0) {
    printFreeMemory();
  }
  
  delay(30000);
}

void printFreeMemory() {
  Serial.print("Free Heap: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
  
  // Typical ESP32: 250-300KB free
  // If < 50KB: Memory leak!
}
```

**Common Leaks:**
```cpp
// WRONG: HTTPClient not cleaned up
HTTPClient http;
http.begin(url);
http.POST(payload);
// http.end() missing → memory leak!

// CORRECT:
HTTPClient http;
http.begin(url);
http.POST(payload);
http.end();  // Always call end()

// WRONG: String concatenation in loop
String payload = "";
for (int i = 0; i < 1000; i++) {
  payload += "data";  // Creates new strings, old ones not freed
}

// CORRECT: Use StringBuilder
String payload;
for (int i = 0; i < 1000; i++) {
  payload.concat("data");  // More efficient
}
```

---

### 3. Floating Point Precision Loss

**Problem:**
```cpp
// WRONG: Sends too many decimals
float ph = 7.123456789;
String payload = "{\"ph\":" + String(ph) + "}";
// Result: {"ph":7.12345674} (precision loss after 7 decimals)

// CORRECT: Limit to 2 decimals
String payload = "{\"ph\":" + String(ph, 2) + "}";
// Result: {"ph":7.12}
```

**Best Practice:**
```cpp
String payload = "{";
payload += "\"ph\":" + String(ph, 2) + ",";           // 2 decimals
payload += "\"temperature\":" + String(temp, 2) + ","; // 2 decimals
payload += "\"turbidity\":" + String(turbidity, 2) + ",";
payload += "\"conductivity\":" + String(conductivity); // Integer, no decimal
payload += "}";
```

---

### 4. WiFi Reconnection Bug

**Problem:**
```cpp
// WRONG: Assumes WiFi stays connected forever
if (WiFi.status() != WL_CONNECTED) {
  return;  // Never tries to reconnect!
}

// CORRECT: Auto-reconnect
void ensureWiFiConnected() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.reconnect();
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi reconnected!");
    }
  }
}

void loop() {
  ensureWiFiConnected();
  sendSensorData();
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION TIPS

### 1. Reduce Data Send Frequency (Save Power)

```cpp
// Default: Every 30 seconds
const int SEND_INTERVAL = 30 * 1000;  // 30 seconds

// For battery-powered device: Every 5 minutes
const int SEND_INTERVAL = 5 * 60 * 1000;  // 5 minutes

// But keep command polling frequent to respond quickly
const int COMMAND_CHECK_INTERVAL = 15 * 1000;  // 15 seconds
```

### 2. Use SPIFFS/EEPROM for Buffering

```cpp
#include <SPIFFS.h>

void bufferDataOffline(float ph, float temp, float turbidity, int cond) {
  // Create JSON
  StaticJsonDocument<256> doc;
  doc["ph"] = ph;
  doc["temperature"] = temp;
  doc["turbidity"] = turbidity;
  doc["conductivity"] = cond;
  doc["timestamp"] = millis();
  
  // Append to file
  File file = SPIFFS.open("/sensor_log.json", "a");
  if (file) {
    serializeJson(doc, file);
    file.print("\n");
    file.close();
    Serial.println("Data buffered to SPIFFS");
  }
}

void sendBufferedDataOnceOnline() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  File file = SPIFFS.open("/sensor_log.json", "r");
  if (!file) return;
  
  while (file.available()) {
    String line = file.readStringUntil('\n');
    if (line.length() > 0) {
      sendToServer(line);
    }
  }
  
  file.close();
  SPIFFS.remove("/sensor_log.json");  // Clear after sent
}
```

### 3. Optimize JSON Size

```cpp
// BEFORE: 150 bytes
{"ph":7.12,"temperature":25.50,"turbidity":2.30,"conductivity":650}

// AFTER: 80 bytes (shorter field names for embedded systems)
{"p":7.12,"t":25.50,"tu":2.30,"c":650}

// But backend expects long names, so not worth it
// Better: Send as compact JSON array instead
[7.12, 25.50, 2.30, 650]  // But parsing harder
```

### 4. Monitor WiFi Signal Strength

```cpp
void printWiFiSignal() {
  int rssi = WiFi.RSSI();  // Received Signal Strength Indicator (dBm)
  
  Serial.print("WiFi Signal: ");
  Serial.print(rssi);
  Serial.println(" dBm");
  
  // -30 to -50: Excellent
  // -50 to -60: Good
  // -60 to -70: Fair
  // -70 to -80: Poor
  // < -80: Very poor / disconnected
  
  if (rssi < -70) {
    Serial.println("WARNING: Weak WiFi signal. May have timeouts.");
  }
}
```

### 5. Use Deep Sleep to Save Battery

```cpp
// ESP32 Deep Sleep: ~10µA vs 80mA normal
const int SLEEP_DURATION = 30 * 1000 * 1000;  // 30 seconds in microseconds

void loop() {
  sendSensorData();
  
  Serial.println("Going to deep sleep...");
  delay(100);  // Let serial finish
  
  ESP.deepSleep(SLEEP_DURATION);
  // Wake up after 30 seconds, reboot
}
```

---

## 🧪 TESTING CHECKLIST

Before deploying to production, verify:

- [ ] HTTP 201 response received when sending sensor data
- [ ] HTTP 400 errors trigger when values out of range
- [ ] HTTP 401 triggers with wrong API Key
- [ ] Exponential backoff retry works (test with server offline)
- [ ] Commands polled every 10-15 seconds
- [ ] Command status reported after execution
- [ ] Data buffered when WiFi offline
- [ ] Buffered data sent when reconnected
- [ ] No memory leaks (free heap stable after 24 hours)
- [ ] WiFi reconnects automatically after disconnect
- [ ] SSL/HTTPS connection works in production
- [ ] Watchdog timeout doesn't trigger (device stays stable)
- [ ] Power consumption acceptable (if battery-powered)

---

## 📞 GETTING HELP

**If none of these solutions work:**

1. **Collect debug info:**
   ```
   - Serial monitor output (10+ lines)
   - HTTP status code + response body
   - WiFi RSSI and IP address
   - Free heap memory
   - Device API Key
   - Server timestamp
   ```

2. **Test with Postman/curl:**
   ```bash
   curl -X POST http://server:8080/api/sensor-data \
     -H "X-API-KEY: your-key" \
     -H "Content-Type: application/json" \
     -d '{"ph":7.2,"temperature":25.5,"turbidity":2.3,"conductivity":650}' -v
   ```

3. **Contact Backend Team:**
   - Email: [backend-team@company.com]
   - Slack: #water-monitoring-tech
   - Include: debug info + test results

---

**Last Updated:** January 2024  
**Tested On:** ESP32 DevKit, ESP8266, Arduino IDE 2.x, ArduinoJson v6
