# 📋 TÀI LIỆU TRÌNH BÀY IoT GROUP
## Hệ thống Giám sát Chất lượng Nước (Water Quality Monitoring System)

**Ngày soạn:** 2024
**Người soạn:** IT Development Team (Web & Backend)
**Đối tượng:** IoT Development Group

---

## 📑 MỤC LỤC

1. [Tóm tắt Dự án](#tóm-tắt-dự-án)
2. [Kiến trúc Hệ thống](#kiến-trúc-hệ-thống)
3. [API & Giao thức Truyền dữ liệu](#api--giao-thức-truyền-dữ-liệu)
4. [Câu hỏi IoT Group sẽ hỏi](#câu-hỏi-iot-group-sẽ-hỏi)
5. [Câu trả lời Mẫu](#câu-trả-lời-mẫu)
6. [Ví dụ Code IoT](#ví-dụ-code-iot)
7. [Troubleshooting & Lỗi thường gặp](#troubleshooting--lỗi-thường-gặp)

---

## 🎯 TÓM TẮT DỰ ÁN

### 📌 Mục tiêu Dự án

**Xây dựng nền tảng SaaS đa nhà máy (Multi-Tenant) để:**
- Giám sát chất lượng nước **theo thời gian thực** từ các cảm biến IoT
- Thu thập dữ liệu từ các thiết bị ESP8266/ESP32 tại các nhà máy xử lý nước
- Hiển thị dữ liệu dưới dạng biểu đồ, báo cáo, và cảnh báo email tự động
- Cho phép điều khiển thiết bị từ xa (van nước, cài đặt thông số)
- Hỗ trợ **RBAC (Role-Based Access Control)** cho Admin và Employee

### 🏭 Thành phần Hệ thống

```
IoT Devices (ESP8266/ESP32)
        ↓ (HTTP/REST + API Key)
    Gateway/Network
        ↓
Backend Server (Spring Boot)
        ↓ (Lưu trữ Database)
   MariaDB Database
        ↓
Frontend Web (React)
        ↓
    End Users (Admin/Employee)
```

### 📊 Luồng Dữ liệu Chi tiết

```
1. IoT Device Collection Phase:
   - Cảm biến đọc giá trị: pH, Temperature, Turbidity, Conductivity
   - Mỗi ~30 giây (tùy cấu hình), gửi HTTP POST tới Backend

2. Backend Processing Phase:
   - Spring Boot nhận dữ liệu, xác thực API Key
   - Validate dữ liệu (kiểm tra định dạng, giới hạn)
   - Lưu vào Database (MariaDB)
   - Kiểm tra ngưỡng cảnh báo
   - Nếu vượt ngưỡng: gửi email alert tự động

3. Database Storage Phase:
   - Dữ liệu được lưu với timestamp
   - Xác định factory_id tự động từ device_id
   - Giới hạn retention time (tuỳ chính sách)

4. Frontend Display Phase:
   - React fetch dữ liệu mới qua /api/sensor-data/latest
   - Hiển thị realtime trên Dashboard (Chart.js)
   - Lưu vào localStorage cache

5. Control Command Phase:
   - Admin/Employee gửi lệnh từ Web (VD: mở van)
   - Backend lưu lệnh vào Database
   - IoT Device polling mỗi ~10 giây để lấy lệnh mới
   - Device thực hiện lệnh, báo cáo status
```

### 👥 Phân chia Vai trò

| Vai trò | Trách nhiệm |
|---------|-----------|
| **IoT Group** | Phát triển firmware ESP8266/ESP32, cảm biến, giao tiếp HTTP |
| **IT Dev (Backend)** | API, Database, xác thực, xử lý dữ liệu, cảnh báo |
| **IT Dev (Frontend)** | UI Dashboard, biểu đồ, quản lý người dùng |
| **IT Dev (DevOps)** | Deploy, Docker, Nginx, SSL, monitoring |

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 🔄 Kiến trúc Tổng quát

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)                                          │
│  - Dashboard: Biểu đồ realtime (Chart.js)                      │
│  - Device Management: CRUD thiết bị                            │
│  - User Management: Quản lý người dùng                         │
│  - History & Reports: Xem lịch sử dữ liệu                      │
│  - Device Control: Điều khiển thiết bị                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS/REST API
                       │
┌──────────────────────v──────────────────────────────────────────┐
│                  APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot Backend (Java 17)                                  │
│                                                                 │
│  ┌─ CONTROLLERS ────────────────────────────────────────────┐  │
│  │ • AuthController (/api/auth)                             │  │
│  │ • UserController (/api/users)                            │  │
│  │ • DeviceController (/api/devices)                        │  │
│  │ • SensorDataController (/api/sensor-data)                │  │
│  │ • DeviceControlController (/api/controls)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ SECURITY LAYER ─────────────────────────────────────────┐  │
│  │ • JwtAuthenticationFilter (JWT for Users)                │  │
│  │ • ApiKeyAuthFilter (API Key for IoT)                     │  │
│  │ • Multi-Tenant Context Resolver                          │  │
│  │ • TenantFilterAspect (AOP)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ BUSINESS LOGIC ─────────────────────────────────────────┐  │
│  │ • AlertService (Email notifications)                     │  │
│  │ • DeviceService (CRUD, control commands)                 │  │
│  │ • UserService (RBAC, permissions)                        │  │
│  │ • SensorDataService (Validation, aggregation)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ DATA ACCESS (JPA) ──────────────────────────────────────┐  │
│  │ • DeviceRepository, UserRepository, etc.                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ SQL (JPA/Hibernate)
                       │
┌──────────────────────v──────────────────────────────────────────┐
│                    DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│  MariaDB 10.6 Database                                          │
│                                                                 │
│  Tables:                                                        │
│  • factories: Thông tin nhà máy (tenant)                       │
│  • users: Người dùng (Admin, Employee)                         │
│  • devices: Thiết bị IoT (each has unique apiKey)             │
│  • sensor_data: Dữ liệu từ cảm biến (pH, temp, etc.)         │
│  • device_settings: Cài đặt thiết bị (interval, threshold)    │
│  • device_control_commands: Lệnh điều khiển                   │
│  • employee_device_access: Phân quyền truy cập thiết bị        │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP + API Key
                       │
┌──────────────────────v──────────────────────────────────────────┐
│                    IoT LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│  ESP8266/ESP32 Microcontroller                                  │
│                                                                 │
│  Hardware:                                                      │
│  • pH Sensor (analog input)                                    │
│  • Temperature Sensor (DS18B20 / DHT22)                        │
│  • Turbidity Sensor (analog input)                             │
│  • Conductivity Sensor (analog input)                          │
│  • Water Valve Control Relay                                   │
│  • WiFi Module (built-in)                                      │
│                                                                 │
│  Firmware Logic:                                                │
│  1. Connect to WiFi                                            │
│  2. Read sensors every interval (default 30s)                  │
│  3. Send HTTP POST to /api/sensor-data with API Key           │
│  4. Poll /api/controls/devices/{id}/commands every 10s        │
│  5. Execute commands (valve control, change interval)          │
│  6. Handle connection loss & retry logic                       │
└─────────────────────────────────────────────────────────────────┘
```

### 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW WITH SECURITY                   │
└─────────────────────────────────────────────────────────────────┘

1. WEB USER LOGIN:
   ┌──────────────────────┐
   │ POST /api/auth/login │
   │ {username, password} │
   └──────────────┬───────┘
                  │
                  ↓
   ┌──────────────────────────────┐
   │ Spring Security Filter Chain  │
   │ - UsernamePasswordAuth        │
   │ - BCrypt Password Verify      │
   └──────────────┬───────────────┘
                  │
                  ↓
   ┌──────────────────────────────┐
   │ Generate JWT Token:          │
   │ Header: {alg, typ}           │
   │ Payload: {userId, role,      │
   │           factoryId, exp}     │
   │ Signature: HMAC-SHA256       │
   └──────────────┬───────────────┘
                  │
                  ↓
   ┌──────────────────────────────┐
   │ Return to Client:            │
   │ {token, type: Bearer,        │
   │  username, role, factoryName}│
   └──────────────────────────────┘

2. WEB USER API CALL (SECURED):
   ┌──────────────────────────────────┐
   │ GET /api/users                   │
   │ Authorization: Bearer {token}    │
   └──────────────┬───────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────┐
   │ JwtAuthenticationFilter:          │
   │ 1. Extract token from header     │
   │ 2. Verify signature (HMAC-SHA256)│
   │ 3. Decode payload                │
   │ 4. Check expiration              │
   │ 5. Load user from database       │
   └──────────────┬───────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────┐
   │ TenantFilterAspect (AOP):        │
   │ Set TenantContext.factoryId =    │
   │    (from JWT payload)            │
   └──────────────┬───────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────┐
   │ @PreAuthorize check:             │
   │ hasRole('ADMIN') ?               │
   └──────────────┬───────────────────┘
                  │
                  ├─ YES → Proceed to Controller
                  └─ NO → Return 403 Forbidden

3. IoT DEVICE DATA SUBMISSION:
   ┌──────────────────────────────────┐
   │ POST /api/sensor-data            │
   │ X-API-KEY: {device-api-key}      │
   │ {pH, temp, turbidity, cond}      │
   └──────────────┬───────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────┐
   │ ApiKeyAuthFilter:                │
   │ 1. Extract API Key from header   │
   │ 2. Lookup device in DB           │
   │ 3. Verify key matches            │
   │ 4. Load device & factoryId       │
   └──────────────┬───────────────────┘
                  │
                  ↓
   ┌──────────────────────────────────┐
   │ TenantContext.factoryId =        │
   │    device.factory_id             │
   └──────────────┬───────────────────┘
                  │
                  ├─ Valid → Save to DB
                  └─ Invalid → Return 401 Unauthorized

4. MULTI-TENANT DATA ISOLATION:
   ┌──────────────────────────────────┐
   │ In All Queries:                  │
   │ Query filters by:                │
   │ WHERE factory_id = ?             │
   │    (TenantContext.getFactoryId) │
   └──────────────────────────────────┘
```

---

## 📡 API & GIAO THỨC TRUYỀN DỮ LIỆU

### 🔑 Base URL & Authentication

```
Base URL: http://localhost:8080 (Dev)
          https://api.factory.com (Production)

Authentication Types:
1. JWT Token (cho Web Users)
   - Endpoint: POST /api/auth/login
   - Header: Authorization: Bearer {token}
   
2. API Key (cho IoT Devices)
   - Header: X-API-KEY: {device-api-key}
   - Được sinh tự động khi tạo device
   - Format: UUID v4
```

### 📤 API Endpoints dành cho IoT Devices

#### 1️⃣ **Gửi Dữ liệu Cảm biến**

```http
POST /api/sensor-data
X-API-KEY: device-12345-uuid-key
Content-Type: application/json

Request Body:
{
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 2.3,
  "conductivity": 650
}

Response (Success):
HTTP 201 Created
{
  "id": 1,
  "deviceId": 1,
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 2.3,
  "conductivity": 650,
  "timestamp": "2024-01-15T10:30:45Z",
  "factoryId": 1
}

Response (Error - Invalid API Key):
HTTP 401 Unauthorized
{
  "error": "Invalid or expired API Key",
  "message": "Device not found or key mismatch"
}

Response (Error - Bad Request):
HTTP 400 Bad Request
{
  "error": "Invalid request",
  "message": "pH value out of range [0, 14]"
}
```

#### 2️⃣ **Lấy Lệnh Điều khiển Thiết bị**

```http
GET /api/controls/devices/{deviceId}/commands
X-API-KEY: device-12345-uuid-key
Content-Type: application/json

Response (Success):
HTTP 200 OK
[
  {
    "id": 1,
    "type": "VALVE_CONTROL",
    "payload": { "open": true },
    "status": "PENDING",
    "createdAt": "2024-01-15T10:25:00Z"
  },
  {
    "id": 2,
    "type": "UPDATE_INTERVAL",
    "payload": { "interval": 60 },
    "status": "PENDING",
    "createdAt": "2024-01-15T10:26:00Z"
  }
]

Response (No Pending Commands):
HTTP 200 OK
[]
```

#### 3️⃣ **Báo cáo Trạng thái Lệnh**

```http
PUT /api/controls/commands/{commandId}/status
X-API-KEY: device-12345-uuid-key
Content-Type: application/json

Request Body:
{
  "status": "COMPLETED",
  "result": {
    "message": "Valve opened successfully",
    "actualValue": true
  }
}

Response (Success):
HTTP 200 OK
{
  "id": 1,
  "status": "COMPLETED",
  "result": {
    "message": "Valve opened successfully"
  },
  "completedAt": "2024-01-15T10:25:05Z"
}

Response (Error):
HTTP 400 Bad Request
{
  "error": "Invalid status",
  "message": "Status must be PENDING, IN_PROGRESS, COMPLETED, or FAILED"
}
```

#### 4️⃣ **Heartbeat / Keep-Alive**

```http
POST /api/devices/heartbeat
X-API-KEY: device-12345-uuid-key
Content-Type: application/json

Request Body:
{
  "version": "1.2.3",
  "uptime": 123456,
  "freeMemory": 45000,
  "wifiSignal": -65
}

Response (Success):
HTTP 200 OK
{
  "timestamp": "2024-01-15T10:30:45Z",
  "status": "OK",
  "message": "Device is online"
}
```

### 📥 API Endpoints dành cho Admin/Web

#### 5️⃣ **Điều khiển Van (Valve Control)**

```http
POST /api/controls/devices/{deviceId}/valve
Authorization: Bearer {jwt-token}
Content-Type: application/json

Request Body:
{
  "open": true
}

Response (Success):
HTTP 200 OK
{
  "id": 1,
  "type": "VALVE_CONTROL",
  "payload": { "open": true },
  "status": "PENDING",
  "createdAt": "2024-01-15T10:25:00Z",
  "message": "Command sent to device. Waiting for confirmation."
}
```

#### 6️⃣ **Cập nhật Tần suất Gửi dữ liệu**

```http
PUT /api/controls/devices/{deviceId}/interval
Authorization: Bearer {jwt-token}
Content-Type: application/json

Request Body:
{
  "interval": 60
}

Response (Success):
HTTP 200 OK
{
  "id": 2,
  "type": "UPDATE_INTERVAL",
  "payload": { "interval": 60 },
  "status": "PENDING",
  "createdAt": "2024-01-15T10:26:00Z",
  "message": "Interval update command sent. Device will apply after next heartbeat."
}
```

#### 7️⃣ **Bật/Tắt Thu thập Dữ liệu**

```http
PUT /api/controls/devices/{deviceId}/collecting
Authorization: Bearer {jwt-token}
Content-Type: application/json

Request Body:
{
  "collecting": false
}

Response (Success):
HTTP 200 OK
{
  "id": 3,
  "type": "TOGGLE_DATA_COLLECTION",
  "payload": { "collecting": false },
  "status": "PENDING"
}
```

#### 8️⃣ **Lấy Dữ liệu Mới nhất**

```http
GET /api/sensor-data/latest?deviceId=1
Authorization: Bearer {jwt-token}

Response (Success):
HTTP 200 OK
{
  "id": 1,
  "deviceId": 1,
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 2.3,
  "conductivity": 650,
  "timestamp": "2024-01-15T10:30:45Z"
}

Response (No Data):
HTTP 404 Not Found
{
  "error": "No data available",
  "message": "Device has not sent any data yet"
}
```

#### 9️⃣ **Xem Lịch sử Dữ liệu**

```http
GET /api/sensor-data/history/1?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z&limit=1000
Authorization: Bearer {jwt-token}

Response (Success):
HTTP 200 OK
[
  {
    "id": 100,
    "deviceId": 1,
    "ph": 7.1,
    "temperature": 24.8,
    "turbidity": 2.1,
    "conductivity": 648,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "id": 99,
    "deviceId": 1,
    "ph": 7.3,
    "temperature": 25.2,
    "turbidity": 2.5,
    "conductivity": 655,
    "timestamp": "2024-01-15T10:29:30Z"
  }
]
```

### 📋 Payload Format & Constraints

#### Sensor Data Payload

```json
{
  "ph": {
    "type": "float (4 bytes)",
    "range": "[0.0, 14.0]",
    "precision": "0.1",
    "example": 7.2
  },
  "temperature": {
    "type": "float",
    "range": "[-40.0, 60.0] (°C)",
    "precision": "0.1",
    "example": 25.5
  },
  "turbidity": {
    "type": "float",
    "range": "[0.0, 1000.0] (NTU)",
    "precision": "0.1",
    "example": 2.3
  },
  "conductivity": {
    "type": "float",
    "range": "[0.0, 5000.0] (µS/cm)",
    "precision": "1.0",
    "example": 650
  }
}
```

#### Validation Rules

| Field | Rule | Error Code |
|-------|------|-----------|
| pH | 0.0 ≤ pH ≤ 14.0 | 400 Bad Request |
| Temperature | -40.0 ≤ T ≤ 60.0 | 400 Bad Request |
| Turbidity | 0.0 ≤ NTU ≤ 1000.0 | 400 Bad Request |
| Conductivity | 0.0 ≤ µS ≤ 5000.0 | 400 Bad Request |
| API Key | Must be valid UUID in DB | 401 Unauthorized |
| Content-Type | Must be application/json | 415 Unsupported Media Type |

---

## ❓ CÂU HỎI IoT GROUP SẼ HỎI

### 1️⃣ **Về Định dạng Dữ liệu & Payload**

**Câu hỏi 1:** *API yêu cầu định dạng payload thế nào? Có cần wrapper object không?*

Định dạng dữ liệu được gửi từ IoT device phải tuân thủ JSON schema cụ thể. Dữ liệu được gửi trực tiếp mà không cần wrapper. Payload phải bao gồm 4 thông số chính: `ph`, `temperature`, `turbidity`, `conductivity`.

---

**Câu hỏi 2:** *Giá trị nào không hợp lệ? System sẽ trả về lỗi gì?*

Nếu bất kỳ thông số nào nằm ngoài phạm vi cho phép (pH: 0-14, Temp: -40 đến 60°C, Turbidity: 0-1000 NTU, Conductivity: 0-5000 µS/cm), hệ thống sẽ trả về HTTP 400 Bad Request với chi tiết lỗi.

---

**Câu hỏi 3:** *Có cần gửi timestamp không, hay server tự sinh?*

Server tự động sinh timestamp (timestamp UTC) khi nhận dữ liệu. IoT device không cần gửi timestamp. Nếu gửi, server sẽ ignore và dùng thời gian nhận được.

---

### 2️⃣ **Về Tần suất & Hiệu năng**

**Câu hỏi 4:** *Tần suất gửi dữ liệu tối đa hệ thống chịu được?*

Hệ thống hiện tại được thiết kế để xử lý mỗi device gửi dữ liệu mỗi 10-30 giây. Tối đa có thể hỗ trợ **mỗi 5 giây** trên một device, nhưng không khuyến nghị vì tăng tải database. Khuyến nghị mặc định: **30 giây/lần**.

---

**Câu hỏi 5:** *Nếu gửi dữ liệu quá nhanh sẽ bị throttle hay từ chối?*

Hiện tại backend **không có rate limiting**. Tuy nhiên, nên cân nhắc khi triển khai để tránh DDoS. Nếu gửi quá nhanh, database có thể bị overload, dẫn đến timeout. Sẽ thêm rate limiting trong version tới (1-2 request/giây mỗi device).

---

**Câu hỏi 6:** *Nếu mất kết nối WiFi, device phải làm gì?*

Device nên **buffer dữ liệu cảm biến** vào bộ nhớ cục bộ (nếu có), tối đa 100-1000 mẫu tùy RAM. Khi WiFi trở lại, hãy gửi lại dữ liệu miss (batch). Backend sẽ chấp nhận dữ liệu cũ dựa trên timestamp của nó.

---

### 3️⃣ **Về Xử lý Lỗi & Timeout**

**Câu hỏi 7:** *Server có cơ chế xử lý lỗi/timeout như thế nào?*

- HTTP Timeout: 30 giây (mặc định Spring Boot)
- Retry Strategy: Backend không retry, nhưng device nên **retry 3 lần** với exponential backoff (1s, 2s, 4s)
- Failed requests được log nhưng không lưu vào database
- Device nên tracking request status để biết data có thành công hay không

---

**Câu hỏi 8:** *Nếu API trả về 5xx error, device phải xử lý thế nào?*

Device nên **exponential backoff retry** tối đa 3 lần. Nếu 3 lần vẫn fail, log error vào local storage và skip lần này. Tiếp tục polling heartbeat để kiểm tra xem server còn sống không.

---

### 4️⃣ **Về Bảo mật**

**Câu hỏi 9:** *Có cần mã hoá dữ liệu không? Giao thức nào?*

Trong production, **PHẢI dùng HTTPS (TLS 1.2+)**. Dữ liệu sẽ được mã hoá trong transit. API Key không nên gửi qua HTTP. Payload JSON được mã hoá bởi TLS, không cần mã hoá thêm ở ứng dụng level.

---

**Câu hỏi 10:** *API Key được cấp như thế nào? Có thể rotate không?*

Mỗi device được cấp một **API Key duy nhất (UUID v4)** khi tạo device từ admin panel. API Key được lưu trong database. Hiện tại **chưa hỗ trợ rotate**, nhưng có thể delete device cũ + tạo device mới để có key mới.

---

**Câu hỏi 11:** *API Key có expiry date không? Hay vĩnh viễn?*

API Key hiện tại **không có expiry date**. Nó sẽ tồn tại cho đến khi device bị delete. Nên thêm key rotation feature trong tương lai (mỗi 1-2 năm).

---

### 5️⃣ **Về Phản hồi & Đồng bộ**

**Câu hỏi 12:** *Server có trả về phản hồi cần thiết cho IoT không?*

Có. Server trả về HTTP status code + JSON response. Response bao gồm:
- ID của record vừa lưu
- Timestamp mà server ghi nhận
- Trang thái của các lệnh control chờ xử lý

---

**Câu hỏi 13:** *Làm sao device biết dữ liệu được lưu thành công?*

Nếu nhận được HTTP 201 Created (hoặc 200 OK) + response JSON hợp lệ = thành công. Nếu HTTP 4xx hoặc 5xx = thất bại. Device nên check HTTP status code.

---

### 6️⃣ **Về Lệnh & Điều khiển**

**Câu hỏi 14:** *Làm sao device biết admin gửi lệnh (mở van, đổi interval)?*

Device phải **polling endpoint** `/api/controls/devices/{deviceId}/commands` mỗi **10-15 giây** để lấy danh sách lệnh pending. Backend sẽ trả về array các command với `status: PENDING`.

---

**Câu hỏi 15:** *Lệnh điều khiển có timeout không?*

Lệnh sẽ stay "PENDING" cho đến khi device báo cáo status lại. Nếu device không báo cáo trong vòng **5 phút**, admin nên có thể cancel lệnh từ UI hoặc tự động timeout (sẽ implement trong version tới).

---

**Câu hỏi 16:** *Một lệnh có thể được gửi tới nhiều device cùng lúc không?*

Hiện tại: **Không**. Mỗi lệnh dành cho 1 device. Muốn điều khiển nhiều device, phải tạo lệnh riêng cho từng device (batch từ admin panel).

---

### 7️⃣ **Về Database & Lưu trữ**

**Câu hỏi 17:** *Dữ liệu được lưu trữ như thế nào? Có nén không?*

Dữ liệu được lưu raw (floating point) trong bảng `sensor_data`. Không nén. Mỗi record chứa: deviceId, ph, temperature, turbidity, conductivity, timestamp. Tổng ~50 bytes/record.

---

**Câu hỏi 18:** *Có giới hạn retention time không? Dữ liệu cũ bị xoá khi nào?*

Hiện tại **không có auto-delete**. Dữ liệu sẽ lưu vô thời hạn. Khuyến nghị: giữ 1-2 năm dữ liệu online, archive cũ hơn. Sẽ implement archival policy trong tương lai.

---

**Câu hỏi 19:** *Database tối đa chứa bao nhiêu record?*

MariaDB 10.6 có thể xử lý **hàng triệu record**. Với 10 device × 2880 record/ngày (mỗi 30 giây), = 28,800 records/ngày. 1 năm = ~10 triệu records. Performance đạt được đến 50-100 triệu records với indexing đúng.

---

### 8️⃣ **Về Real-time & Streaming**

**Câu hỏi 20:** *Web hiển thị realtime hay batch?*

Frontend sử dụng **polling** (không WebSocket/MQTT). Frontend fetch `/api/sensor-data/latest` mỗi **5 giây** để cập nhật dashboard. Không phải true realtime, nhưng đủ cho monitoring nhà máy (5-10 giây delay chấp nhận được).

---

**Câu hỏi 21:** *Có dự định dùng WebSocket hay MQTT không?*

Hiện tại: **Không**. Đơn giản hóa architecture với REST polling. Nếu muốn true realtime trong tương lai, có thể thêm WebSocket hoặc MQTT broker (ví dụ: Mosquitto, Kafka).

---

### 9️⃣ **Về Device Identity & Multi-Tenancy**

**Câu hỏi 22:** *Làm sao hệ thống biết device thuộc factory nào?*

API Key → Lookup trong `devices` table → Tìm được `factory_id`. Backend tự động gán `factory_id` vào request context. Tất cả query sau đó sẽ filter theo `factory_id` này.

---

**Câu hỏi 23:** *Device từ Factory A có thể gửi dữ liệu với API Key của Factory B không?*

**Không**. API Key của Device B sẽ không match với device trong database. Backend sẽ reject với HTTP 401 Unauthorized.

---

**Câu hỏi 24:** *Nếu admin của Factory A thay đổi interval, sẽ ảnh hưởng tới Factory B không?*

**Không**. Backend dùng multi-tenant context. Khi admin Factory A gửi request, hệ thống tự động filter theo `factoryId` từ JWT token. Command chỉ tạo cho device của Factory A.

---

### 🔟 **Về Cảnh báo**

**Câu hỏi 25:** *Cảnh báo email được gửi khi nào?*

Khi bất kỳ thông số vượt ngưỡng cảnh báo được cấu hình. Ví dụ: pH > 8.5 hoặc < 6.0. Backend sẽ:
1. Kiểm tra ngưỡng
2. Gửi email tới admin + employee assigned
3. Lưu alert record vào database
4. Hiển thị trên UI

---

**Câu hỏi 26:** *Email gửi tới địa chỉ nào?*

Địa chỉ email lưu trong bảng `users`. Mỗi user có 1 email. Admin có thể cấu hình cảnh báo cho user nào.

---

**Câu hỏi 27:** *Nếu liên tục vượt ngưỡng, email sẽ gửi mỗi lần hay chỉ 1 lần?*

Hiện tại: **Mỗi lần dữ liệu vượt ngưỡng sẽ gửi email**. Nếu device gửi liên tục ~1 record/30 giây, sẽ gửi ~2 email/phút (spam). Cần implement **alert deduplication** (chỉ gửi 1 lần/5 phút nếu liên tục vượt).

---

---

## 📝 CÂU TRẢ LỜI MẪU

### Câu 1: Định dạng Payload là gì?

**Câu hỏi đầy đủ:**
*API yêu cầu định dạng payload thế nào? Có cần wrapper object không hay gửi trực tiếp JSON object?*

**Trả lời:**
API yêu cầu gửi JSON object trực tiếp, không cần wrapper. Cấu trúc như sau:

```json
{
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 2.3,
  "conductivity": 650
}
```

Tất cả 4 thông số là bắt buộc (required). Kiểu dữ liệu là float. Không được gửi null hoặc bỏ trống.

**Endpoint:**
```
POST /api/sensor-data
X-API-KEY: {device-api-key}
Content-Type: application/json
```

---

### Câu 2: Giá trị nào không hợp lệ? Lỗi thế nào?

**Câu hỏi đầy đủ:**
*Nếu giá trị nằm ngoài phạm vi cho phép thì server trả về lỗi gì? Có thể gửi dữ liệu sai format được không?*

**Trả lời:**
Backend có validation tuyệt đối. Nếu giá trị ngoài phạm vi:

```
pH:           0.0 ≤ x ≤ 14.0
Temperature: -40.0 ≤ x ≤ 60.0 (°C)
Turbidity:    0.0 ≤ x ≤ 1000.0 (NTU)
Conductivity: 0.0 ≤ x ≤ 5000.0 (µS/cm)
```

Server sẽ trả về **HTTP 400 Bad Request**:

```json
{
  "error": "Validation failed",
  "details": {
    "pH": "must be between 0 and 14",
    "temperature": "must be between -40 and 60"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Dữ liệu sai format (ví dụ: string "abc" thay vì number) cũng sẽ bị reject với error JSON parsing.

---

### Câu 3: Có cần gửi Timestamp không?

**Câu hỏi đầy đủ:**
*Device có cần gửi timestamp không, hay server tự sinh? Nếu gửi, server dùng cái nào?*

**Trả lời:**
**Không cần gửi timestamp**. Server tự động sinh timestamp UTC khi nhận request. Điều này tốt vì:
1. Tránh lỗi time sync trên device
2. Timestamp đảm bảo chính xác từ server

Nếu device muốn gửi timestamp (optional future feature), server sẽ:
- So sánh với server time
- Nếu chênh lệch > 5 phút, ignore timestamp device và dùng server time
- Để tránh trick time

---

### Câu 4: Tần suất gửi dữ liệu tối đa?

**Câu hỏi đầy đủ:**
*Hệ thống có thể xử lý tần suất gửi bao cao? Mỗi 5 giây? 1 giây? Có rate limiting không?*

**Trả lời:**
**Khuyến nghị: 30 giây/lần mỗi device.**

Hệ thống hiện tại có thể xử lý:
- Tối thiểu: 30 giây (khuyến nghị mặc định)
- Có thể: 10 giây (chấp nhận được)
- Giới hạn: 5 giây (có rủi ro overload DB)
- Không hỗ trợ: < 5 giây

Hiện tại **không có rate limiting**. Nếu gửi quá nhanh (< 5 giây/liên tục), database có thể bị chậm, dẫn đến timeout.

**Kế hoạch tương lai:** Sẽ thêm rate limiting (~1-2 request/giây/device).

---

### Câu 5: Nếu gửi quá nhanh bị gì?

**Câu hỏi đầy đủ:**
*Nếu device gửi dữ liệu mỗi 2 giây (quá nhanh), server sẽ reject hay accept?*

**Trả lời:**
Server sẽ **accept** (hiện tại không có rate limiting). Tuy nhiên, đó là **không khuyến nghị** vì:

1. **Database overload:** Tăng disk I/O, slow query
2. **Network waste:** Tốn bandwidth WiFi
3. **Power drain:** Device tiêu tốn pin nhanh

Nên **cấu hình interval tối thiểu 30 giây**. Nếu cần monitoring nhanh hơn, xem xét upgrade server hoặc dùng MQTT/WebSocket (phase 2).

---

### Câu 6: Nếu mất WiFi, device làm gì?

**Câu hỏi đầy đủ:**
*Nếu WiFi đứt, device có cách nào buffer dữ liệu hay lấy lại data miss không?*

**Trả lời:**
Backend hỗ trợ **retransmission dữ liệu miss**. Device nên:

1. **Buffer dữ liệu cảm biến** vào EEPROM/SPIFFS (flash memory):
   - Lưu max 100-500 mẫu (tuỳ RAM available)
   - Định dạng: timestamp + 4 thông số

2. **Khi WiFi trở lại:**
   - Gửi batch dữ liệu miss
   - Backend sẽ accept dữ liệu cũ dựa trên timestamp

3. **Ví dụ gửi batch:**
   ```
   POST /api/sensor-data/batch
   [
     {"timestamp": "2024-01-15T10:20:00Z", "ph": 7.1, ...},
     {"timestamp": "2024-01-15T10:21:00Z", "ph": 7.2, ...},
     ...
   ]
   ```

**Note:** Feature batch upload chưa implement, sẽ thêm sớm.

---

### Câu 7: Server xử lý timeout thế nào?

**Câu hỏi đầy đủ:**
*Nếu request timeout (> 30 giây), server sẽ phản ứng thế nào? Có retry không?*

**Trả lời:**
**HTTP Timeout (Server side):** 30 giây mặc định. Request chưa kết thúc sau 30s sẽ bị kill → HTTP 500/504 Gateway Timeout.

**Retry Strategy (Device side):**
Device nên tự implement retry logic:

```
Attempt 1: Wait 1 second, retry
Attempt 2: Wait 2 seconds, retry
Attempt 3: Wait 4 seconds, retry
Attempt 4: Give up, log error, continue next cycle
```

**Backend không retry.** Nếu request bị timeout, device không nhận confirmation. Vậy nên:
- Device tracking request status
- Nếu timeout, treat as failed
- Next cycle sẽ gửi dữ liệu mới (dữ liệu miss sẽ buffer)

---

### Câu 8: Nếu API trả về 5xx error?

**Câu hỏi đầy đủ:**
*Server báo lỗi 503, 500, 504... device phải xử lý thế nào? Có exponential backoff không?*

**Trả lời:**
**Exponential backoff retry:**

```
5xx Error → Retry 3 lần:
  Attempt 1: Wait 1s   → Retry
  Attempt 2: Wait 2s   → Retry
  Attempt 3: Wait 4s   → Retry
  All failed: Log to SPIFFS/EEPROM, Skip this cycle
```

**Ví dụ pseudocode:**
```cpp
for(int i = 0; i < 3; i++) {
  int status = sendData(sensorPayload);
  if (status == 200 || status == 201) {
    // Success
    break;
  } else if (status >= 500) {
    // Server error, retry
    delay(1000 * pow(2, i));
  } else {
    // Client error (4xx), don't retry
    break;
  }
}
```

Nên thêm logic polling heartbeat để detect khi server trở lại online.

---

### Câu 9: Có mã hoá dữ liệu không?

**Câu hỏi đầy đủ:**
*Payload JSON có cần mã hoá (encrypt) riêng không? Dùng TLS là đủ không?*

**Trả lời:**
**Chỉ cần HTTPS/TLS.** TLS sẽ mã hoá tất cả dữ liệu trong transit:

```
Device → [TLS Encryption] → Server
```

**Yêu cầu:**
- **Development:** HTTP ok (localhost)
- **Production:** **PHẢI HTTPS** (TLS 1.2+)
- **Certificate:** Self-signed ok (testing), CA-signed (production)

**Không cần application-level encryption** (VD: AES encrypt payload). TLS đã đủ.

**Cấu hình HTTPS Server:**
```
Nginx Reverse Proxy:
- Port 443 (HTTPS)
- SSL Certificate: /etc/ssl/certs/cert.pem
- Backend Spring Boot: Port 8080 (HTTP internal)
```

---

### Câu 10: API Key cấp như thế nào?

**Câu hỏi đầy đủ:**
*Làm sao device nhận API Key? Admin tạo device thì key tự sinh hay phải generate?*

**Trả lời:**
**Backend tự sinh tự động:**

1. **Admin tạo device từ Web UI:**
   ```
   POST /api/devices
   {
     "name": "Water Monitor 1",
     "location": "Tank A"
   }
   ```

2. **Server tự động sinh API Key (UUID v4):**
   ```json
   {
     "id": 1,
     "name": "Water Monitor 1",
     "apiKey": "550e8400-e29b-41d4-a716-446655440000",
     "factoryId": 1
   }
   ```

3. **Admin copy key, config vào device firmware**

4. **Device lưu key vào EEPROM, dùng trong header:**
   ```
   X-API-KEY: 550e8400-e29b-41d4-a716-446655440000
   ```

**Không thể regenerate key hiện tại.** Phải delete device + tạo mới. Sẽ thêm key rotation feature tương lai.

---

### Câu 11: API Key có expiry không?

**Câu hỏi đầy đủ:**
*API Key có expiration date không? Hay vĩnh viễn? Bao lâu cần rotate?*

**Trả lời:**
**Hiện tại: Không có expiry.** API Key tồn tại vô thời hạn cho đến khi device bị delete.

**Khuyến nghị security best practices:**
- Rotate key mỗi **1-2 năm**
- Nếu key bị leak, admin delete device + tạo mới

**Kế hoạch future:**
- Implement key rotation (multiple keys/device)
- Auto-expire key sau 1 năm
- Support key versioning

---

### Câu 12: Server trả gì sau khi nhận dữ liệu?

**Câu hỏi đầy đủ:**
*Device gửi dữ liệu, server trả về gì? Chỉ status code hay có response body?*

**Trả lời:**
**Server trả về HTTP status code + JSON response body:**

```json
HTTP 201 Created

{
  "id": 12345,
  "deviceId": 1,
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 2.3,
  "conductivity": 650,
  "timestamp": "2024-01-15T10:30:45Z",
  "factoryId": 1
}
```

**Thông tin trong response:**
- `id`: Record ID trong database
- `timestamp`: Thời gian server lưu
- `factoryId`: Factory mà device thuộc về

**Device dùng response để:**
- Xác nhận dữ liệu được lưu
- Lấy timestamp chính thức từ server (sync time)
- Debug: kiểm tra factoryId có đúng không

---

### Câu 13: Làm sao biết dữ liệu thành công?

**Câu hỏi đầy đủ:**
*Nếu nhận được response, làm sao chắc dữ liệu được lưu vào database?*

**Trả lời:**
**Kiểm tra HTTP status code:**

```
HTTP 201 Created (201)
→ Dữ liệu được lưu thành công

HTTP 400 Bad Request (400)
→ Validation failed, dữ liệu không hợp lệ (check response body)

HTTP 401 Unauthorized (401)
→ API Key sai/không tồn tại

HTTP 5xx (500, 503, 504)
→ Server error, dữ liệu có thể chưa lưu (retry)
```

**Device logic:**
```cpp
int httpCode = http.POST(payload);
if (httpCode == 201 || httpCode == 200) {
  // Success, data saved
  lastSuccessTime = now();
} else {
  // Failed, implement retry logic
}
```

---

### Câu 14: Device lấy lệnh điều khiển thế nào?

**Câu hỏi đầy đủ:**
*Admin gửi lệnh (mở van, đổi interval). Device làm sao biết có lệnh mới?*

**Trả lời:**
**Device phải polling endpoint:**

```
GET /api/controls/devices/{deviceId}/commands
X-API-KEY: {api-key}
```

**Tần suất: Mỗi 10-15 giây.**

**Response:**
```json
HTTP 200 OK

[
  {
    "id": 1,
    "type": "VALVE_CONTROL",
    "payload": { "open": true },
    "status": "PENDING"
  },
  {
    "id": 2,
    "type": "UPDATE_INTERVAL",
    "payload": { "interval": 60 },
    "status": "PENDING"
  }
]
```

**Device flow:**
1. Kiểm tra array commands
2. Tìm command với `status: PENDING`
3. Thực hiện lệnh
4. Report status: `PUT /api/controls/commands/{id}/status`

---

### Câu 15: Lệnh có timeout không?

**Câu hỏi đầy đủ:**
*Nếu device không báo cáo lệnh trong thời gian dài, lệnh sẽ được cancel hay vẫn pending?*

**Trả lời:**
**Hiện tại: Lệnh sẽ stay PENDING cho đến khi:**
1. Device báo cáo status (COMPLETED/FAILED), hoặc
2. Admin manually cancel từ UI (feature chưa implement)

**Vấn đề:** Nếu device không báo cáo, lệnh sẽ pending vô thời hạn.

**Khuyến nghị xử lý device side:**
```cpp
// Polling interval
if (now - lastPollTime > 15000) {  // 15 seconds
  getCommands();
  if (commands.length > 0) {
    executeCommand(commands[0]);
    reportStatus(commands[0].id, "COMPLETED");
  }
}
```

**Kế hoạch future:** Thêm command timeout (auto-cancel sau 5-10 phút nếu không response).

---

### Câu 16: Có thể control nhiều device cùng lúc không?

**Câu hỏi đầy đủ:**
*Admin muốn bật/tắt van trên 10 device cùng lúc. Có API batch không?*

**Trả lời:**
**Hiện tại: Không.** Mỗi lệnh dành cho 1 device duy nhất.

```
POST /api/controls/devices/1/valve { "open": true }
POST /api/controls/devices/2/valve { "open": true }
... (phải call 10 lần)
```

**Workaround:** Admin UI có thể tạo loop, gọi 10 API call liên tiếp. Backend sẽ tạo 10 command record riêng biệt.

**Kế hoạch future:** Sẽ thêm batch control API:
```
POST /api/controls/batch
{
  "deviceIds": [1, 2, 3, ...],
  "command": { "type": "VALVE_CONTROL", "payload": {"open": true} }
}
```

---

### Câu 17: Dữ liệu được lưu như thế nào?

**Câu hỏi đầy đủ:**
*Dữ liệu có nén không? Chỉ lưu JSON hay có index/aggregation?*

**Trả lời:**
**Lưu raw data (không nén):**

Database table `sensor_data`:
```sql
CREATE TABLE sensor_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT,
  factory_id BIGINT,
  ph FLOAT,
  temperature FLOAT,
  turbidity FLOAT,
  conductivity FLOAT,
  timestamp DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_timestamp (device_id, timestamp)
);
```

**Mỗi record:** ~50 bytes

**Cấu trúc lưu:**
- Raw floating-point values
- Không aggregate/summarize
- Index: device_id + timestamp (query nhanh)

**Nén:** Có thể compress cũ (archive) để tiết kiệm disk, chưa implement.

---

### Câu 18: Có retention policy không?

**Câu hỏi đầy đủ:**
*Dữ liệu cũ bị xoá tự động không? Giữ bao lâu?*

**Trả lời:**
**Hiện tại: Không có auto-delete.** Dữ liệu sẽ lưu vô thời hạn.

**Khuyến nghị:**
- Giữ 1-2 năm dữ liệu online (hot)
- Archive dữ liệu cũ hơn (cold storage)
- Xoá sau 5 năm (tuỳ chính sách công ty)

**Kế hoạch implement:**
```sql
-- Auto-delete dữ liệu > 2 năm
DELETE FROM sensor_data 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

Admin sẽ config retention policy từ UI.

---

### Câu 19: Database chứa được bao nhiêu record?

**Câu hỏi đầy đủ:**
*Nếu có 100 device, mỗi ngày 288,000 record (mỗi 30 giây), database có đủ không?*

**Trả lời:**
**Tính toán:**
- 1 device, 30 giây/record: 2,880 record/ngày
- 10 device: 28,800 record/ngày = 10.5M/năm
- 100 device: 100M/năm
- MariaDB 10.6 với proper indexing: xử lý được đến **500-1000M records**.

**Performance characteristics:**
- < 10M records: Rất nhanh (< 100ms query)
- 10M-100M: Nhanh (100-500ms)
- 100M-500M: Chấp nhận (0.5-2s)
- > 500M: Cần partition/sharding

**Khuyến nghị:**
- Monitor DB size
- Implement archival sau 1 năm
- Partition table theo tháng nếu > 500M

---

### Câu 20: Frontend realtime hay batch?

**Câu hỏi đầy đủ:**
*Web dashboard cập nhật realtime hay fetch dữ liệu batch?*

**Trả lời:**
**Polling-based (quasi-realtime), không true realtime:**

```
Frontend polling mỗi 5 giây:
GET /api/sensor-data/latest?deviceId=1
```

**Latency chain:**
```
Device sensor → (30s) → Server → (polling 5s) → Frontend
Total latency: 30s + 5s = ~35 giây
```

**Cách hiển thị:**
- Chart.js biểu đồ real-time (update mỗi 5 giây)
- Metrics card (pH, Temp, v.v) cập nhật mỗi 5 giây
- Lưu vào localStorage cache (offline-capable)

**Không phải WebSocket/MQTT** vì:
- Giảm complexity
- REST API đơn giản, dễ scale
- Đủ delay cho monitoring nhà máy (5-10 giây chấp nhận)

**Kế hoạch future (Phase 2):**
- Thêm WebSocket cho true realtime
- MQTT broker integration

---

### Câu 21: Có dự tính WebSocket/MQTT không?

**Câu hỏi đầy đủ:**
*Tương lai có plan upgrade sang WebSocket hay MQTT cho realtime không?*

**Trả lời:**
**Roadmap Phase 2 (Q2 2024):**

```
Phase 1 (Current): REST Polling ✅
  - Simple, stateless
  - HTTP, easy firewall rules

Phase