# ⚡ QUICK START GUIDE
## Water Quality Monitoring System - IoT Team

**Goal:** Get you coding in 5 minutes  
**For:** IoT firmware developers (ESP8266/ESP32)

---

## 🚀 IN 5 MINUTES

### Step 1: Get Your API Key (Ask Backend Team)
```
Contact: [Backend Lead Email]
Message: "Can you create a device and give me the API Key?"

You'll receive:
- Device ID: 1, 2, 3, etc.
- API Key: 550e8400-e29b-41d4-a716-446655440000 (UUID)
```

### Step 2: Know The One Endpoint You MUST Use
```
POST /api/sensor-data
Header: X-API-KEY: {your-api-key}
Body: {"ph": 7.2, "temperature": 25.5, "turbidity": 2.3, "conductivity": 650}
```

### Step 3: Copy This Code (Arduino/ESP32)
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SSID = "YourWiFiSSID";
const char* PASSWORD = "YourWiFiPassword";
const char* API_KEY = "550e8400-e29b-41d4-a716-446655440000";  // YOUR KEY
const char* SERVER = "http://localhost:8080";  // or https://api.factory.com

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");
}

void loop() {
  // Read your sensors
  float ph = readPHSensor();           // Your sensor code
  float temperature = readTempSensor(); // Your sensor code
  float turbidity = readTurbiditySensor();
  int conductivity = readConductivitySensor();
  
  // Create JSON
  StaticJsonDocument<256> doc;
  doc["ph"] = ph;
  doc["temperature"] = temperature;
  doc["turbidity"] = turbidity;
  doc["conductivity"] = conductivity;
  
  String payload;
  serializeJson(doc, payload);
  
  // Send to server
  HTTPClient http;
  http.begin(String(SERVER) + "/api/sensor-data");
  http.addHeader("X-API-KEY", API_KEY);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 201 || httpCode == 200) {
    Serial.println("✓ Data sent successfully");
  } else {
    Serial.print("✗ Error: HTTP ");
    Serial.println(httpCode);
  }
  
  http.end();
  
  delay(30000);  // Send every 30 seconds
}

// Implement these with YOUR sensor reading logic:
float readPHSensor() { return 7.2; }
float readTempSensor() { return 25.5; }
float readTurbiditySensor() { return 2.3; }
int readConductivitySensor() { return 650; }
```

### Step 4: Test It
```bash
# Test the endpoint manually first
curl -X POST http://localhost:8080/api/sensor-data \
  -H "X-API-KEY: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"ph":7.2,"temperature":25.5,"turbidity":2.3,"conductivity":650}'

# You should get back:
# HTTP 201 Created
# {"id": 123, "timestamp": "2024-01-15T10:30:45Z", ...}
```

### Step 5: Done! 🎉
Your device is now sending data to the server.

---

## 📋 IMPORTANT RULES (Don't Ignore!)

| Rule | Why |
|------|-----|
| **Send every 30 seconds** | Faster = database overload, battery drain |
| **Validate before sending** | pH must be 0-14, Temp -40 to 60°C, etc. |
| **Use HTTPS in production** | Security requirement |
| **Implement retry logic** | Network may fail, needs exponential backoff |
| **Store API Key in config** | Never hardcode, never log it |
| **Add error handling** | Check HTTP status code, log failures |

---

## 🆘 WHEN SOMETHING BREAKS

### "HTTP 401 Unauthorized"
→ Check your API Key (typo? spaces? exact copy?)

### "HTTP 400 Bad Request"
→ Check payload format: All 4 fields required + valid ranges
```json
WRONG: {"ph": "seven"}
RIGHT: {"ph": 7.2, "temperature": 25.5, "turbidity": 2.3, "conductivity": 650}
```

### "Connection timeout"
→ Check server address is correct + server is running
```bash
ping localhost  # or your server IP
curl -v http://localhost:8080/api/sensor-data  # test connectivity
```

### "No response from server"
→ Implement retry:
```cpp
for(int i = 0; i < 3; i++) {
  int httpCode = http.POST(payload);
  if (httpCode == 201) break;  // Success
  delay(1000 * pow(2, i));      // Wait 1s, 2s, 4s
}
```

### "Device always crashes after 1 hour"
→ Memory leak - ensure you call `http.end()` after every request
```cpp
http.end();  // MUST DO THIS
```

---

## 📖 NEED MORE DETAILS?

| Topic | Read This |
|-------|-----------|
| Full API spec | `IoT_Briefing_Document.md` Section 2 |
| 20+ Q&A answers | `IoT_Briefing_Document.md` Section 4 |
| Debugging errors | `Troubleshooting_Guide.md` |
| Architecture | `Presentation_Summary.md` |

---

## 🎯 YOUR TODO CHECKLIST

- [ ] Get API Key from backend team
- [ ] Copy the example code above
- [ ] Replace SSID/PASSWORD with your WiFi
- [ ] Replace API_KEY with your actual key
- [ ] Implement sensor reading functions
- [ ] Test with curl command
- [ ] Upload to device
- [ ] Check Serial Monitor for "✓ Data sent successfully"
- [ ] Verify data appears on web dashboard
- [ ] Add retry logic for robustness
- [ ] Add offline buffering (optional but recommended)

---

## 💡 BONUS: Advanced Features (Optional)

### Poll Device Commands (Control from Web)
```cpp
void checkForCommands() {
  HTTPClient http;
  String url = String(SERVER) + "/api/controls/devices/1/commands";  // Device ID = 1
  http.begin(url);
  http.addHeader("X-API-KEY", API_KEY);
  
  int httpCode = http.GET();
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Commands: " + response);
    // Parse and execute commands...
  }
  http.end();
}

// Call in loop():
if (millis() - lastCommandCheck > 15000) {
  checkForCommands();
  lastCommandCheck = millis();
}
```

### Buffer Data When Offline (Save to Flash Memory)
```cpp
#include <SPIFFS.h>

void bufferDataOffline(String payload) {
  File file = SPIFFS.open("/sensor_log.json", "a");
  if (file) {
    file.println(payload);
    file.close();
    Serial.println("Data buffered");
  }
}

void sendBufferedWhenOnline() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  File file = SPIFFS.open("/sensor_log.json", "r");
  while (file.available()) {
    String line = file.readStringUntil('\n');
    // Send each line...
  }
  file.close();
  SPIFFS.remove("/sensor_log.json");
}
```

---

## 📞 GET HELP

**Stuck?** 
1. Check `Troubleshooting_Guide.md`
2. Post in Slack: #water-monitoring-tech
3. Include: error message + curl command that reproduces issue

**Have questions?**
- Email: [backend-team@company.com]
- Meeting: Weekly sync Tuesday 10 AM

---

## 🏁 WHAT'S NEXT

1. ✅ Send sensor data (you just did this)
2. ⏳ Implement device control (poll commands)
3. ⏳ Add offline buffering (optional)
4. ⏳ Optimize power consumption (if battery)
5. ⏳ Integration testing with web dashboard
6. ⏳ UAT & production deployment

---

**Good luck! 🚀 You got this!**

**Need full documentation?** See INDEX.md or IoT_Briefing_Document.md