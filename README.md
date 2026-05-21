# 🌊 Hệ thống Giám sát Chất lượng Nước (Water Quality Monitoring System)

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Một nền tảng SaaS đa người dùng (Multi-tenant) toàn diện để giám sát chất lượng nước theo thời gian thực, được xây dựng với kiến trúc hiện đại và khả năng mở rộng cao.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tính năng chính](#-tính-năng-chính)
- [Stack công nghệ](#-stack-công-nghệ)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Khởi động](#-cài-đặt--khởi-động)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🎯 Tổng quan

**Water Quality Monitoring System** là một giải pháp IoT tích hợp hoàn chỉnh cho phép các nhà máy xử lý nước giám sát và kiểm soát chất lượng nước theo thời gian thực. Hệ thống hỗ trợ kiến trúc đa người dùng (multi-tenant), cho phép nhiều nhà máy hoạt động độc lập trên cùng một nền tảng với dữ liệu được bảo mật và phân tách hoàn toàn.

### 🎨 Ảnh chụp màn hình

```
Dashboard với biểu đồ thời gian thực
├── Giám sát pH, nhiệt độ, độ đục, độ dẫn điện
├── Cảnh báo tự động khi vượt ngưỡng
├── Điều khiển thiết bị (van nước, thu thập dữ liệu)
└── Lịch sử dữ liệu với bộ lọc thời gian
```

### 🌟 Điểm nổi bật

- ✅ **Real-time Monitoring**: Giám sát chất lượng nước theo thời gian thực
- ✅ **Multi-tenant Architecture**: Hỗ trợ nhiều nhà máy độc lập
- ✅ **IoT Integration**: Tích hợp với thiết bị ESP8266/ESP32
- ✅ **Smart Alerts**: Cảnh báo email tự động khi vượt ngưỡng
- ✅ **Device Control**: Điều khiển thiết bị từ xa (van nước, cài đặt)
- ✅ **Role-based Access**: Phân quyền chi tiết (Admin, Employee)
- ✅ **Responsive UI**: Giao diện thân thiện trên mọi thiết bị

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)                                           │
│  ├── Dashboard: Biểu đồ real-time, metrics                       │
│  ├── Device Management: Quản lý thiết bị                         │
│  ├── User Management: Quản lý người dùng                         │
│  └── History: Xem lịch sử dữ liệu                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot Backend (Java 17)                                   │
│  ├── Security Layer                                              │
│  │   ├── JWT Authentication (Users)                             │
│  │   └── API Key Authentication (IoT Devices)                   │
│  ├── Business Logic                                              │
│  │   ├── Multi-tenant Context                                   │
│  │   ├── Alert Service (Email)                                  │
│  │   ├── Device Control Service                                 │
│  │   └── Permission Service                                     │
│  └── REST Controllers                                            │
│      ├── /api/auth - Authentication                             │
│      ├── /api/users - User Management                           │
│      ├── /api/devices - Device Management                       │
│      ├── /api/sensor-data - Sensor Data                         │
│      └── /api/controls - Device Control                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ JPA/Hibernate
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                             │
│  ├── factories: Thông tin nhà máy                               │
│  ├── users: Người dùng (Admin, Employee)                        │
│  ├── devices: Thiết bị IoT                                      │
│  ├── sensor_data: Dữ liệu cảm biến                             │
│  ├── device_settings: Cài đặt thiết bị                         │
│  └── employee_device_access: Quyền truy cập                     │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ HTTP/API Key
┌─────────────────────────────────────────────────────────────────┐
│                         IoT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ESP8266/ESP32 Devices                                           │
│  ├── pH Sensor                                                   │
│  ├── Temperature Sensor                                          │
│  ├── Turbidity Sensor                                           │
│  └── Water Valve Control                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 🔐 Security Architecture

```
┌──────────────────┐         ┌──────────────────┐
│   Web Users      │         │   IoT Devices    │
│  (Admin/Emp)     │         │  (ESP32/8266)    │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ Email/Password             │ API Key
         ↓                            ↓
┌────────────────────────────────────────────────┐
│         Spring Security Filter Chain           │
├────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │ JWT Auth Filter  │  │ API Key Filter   │   │
│  │ (Bearer Token)   │  │ (X-API-KEY)      │   │
│  └──────────────────┘  └──────────────────┘   │
└────────────────────────────────────────────────┘
         │                            │
         ↓                            ↓
┌────────────────────────────────────────────────┐
│         Multi-Tenant Context                   │
│  (Automatic data isolation by factory_id)      │
└────────────────────────────────────────────────┘
```

---

## ✨ Tính năng chính

### 🏭 Multi-Tenancy (Đa người dùng)

- Hỗ trợ nhiều nhà máy hoạt động độc lập
- Dữ liệu được phân tách hoàn toàn theo `factory_id`
- Mỗi nhà máy có người dùng và thiết bị riêng
- Bảo mật cấp độ database với Hibernate Filters

### 👥 Quản lý người dùng & Phân quyền

- **ADMIN**: Toàn quyền quản lý nhà máy
  - Tạo/sửa/xóa người dùng
  - Quản lý tất cả thiết bị
  - Cấp quyền truy cập cho Employee
  - Xem tất cả dữ liệu
- **EMPLOYEE**: Quyền hạn chế
  - Chỉ xem thiết bị được cấp quyền
  - Điều khiển thiết bị được phép
  - Nhận cảnh báo email

### 🔧 Quản lý thiết bị IoT

- Thêm/sửa/xóa thiết bị
- Tự động sinh API Key cho mỗi thiết bị
- Quản lý cài đặt thiết bị:
  - Khoảng thời gian gửi dữ liệu
  - Bật/tắt thu thập dữ liệu
  - Cài đặt ngưỡng cảnh báo
- Gán thiết bị cho Employee

### 📊 Giám sát Real-time

- Dashboard hiển thị dữ liệu trực tiếp
- Biểu đồ thời gian thực (Chart.js)
- 4 chỉ số chính:
  - **pH**: 6.5-8.5 (tiêu chuẩn)
  - **Nhiệt độ**: ≤30°C
  - **Độ đục**: ≤5 NTU
  - **Độ dẫn điện**: ≤1000 µS/cm

### 🎛️ Điều khiển từ xa

- Bật/tắt van nước
- Điều chỉnh tần suất gửi dữ liệu
- Bật/tắt chế độ thu thập dữ liệu
- Cập nhật cài đặt thiết bị

### 📧 Hệ thống cảnh báo

- Email tự động khi vượt ngưỡng
- Gửi đến Admin và Employee được phân quyền
- Cảnh báo theo thời gian thực
- Lịch sử cảnh báo

### 📈 Lịch sử & Báo cáo

- Xem lịch sử dữ liệu theo thiết bị
- Bộ lọc theo khoảng thời gian
- Biểu đồ xu hướng
- Xuất dữ liệu (planned)

---

## 🛠️ Stack công nghệ

### Backend

| Công nghệ         | Phiên bản | Mục đích               |
| ----------------- | --------- | ---------------------- |
| Java              | 17        | Ngôn ngữ lập trình     |
| Spring Boot       | 3.5.6     | Framework backend      |
| Spring Security   | 6.x       | Bảo mật, xác thực      |
| Spring Data JPA   | 3.x       | ORM, truy vấn database |
| Hibernate         | 6.x       | ORM implementation     |
| PostgreSQL        | 16        | Database quan hệ       |
| JWT (jjwt)        | 0.11.5    | Token-based auth       |
| Lombok            | Latest    | Giảm boilerplate code  |
| SpringDoc OpenAPI | 2.6.0     | API documentation      |
| Gradle            | 8.x       | Build tool             |
| Docker            | Latest    | Containerization       |

### Frontend

| Công nghệ    | Phiên bản | Mục đích                |
| ------------ | --------- | ----------------------- |
| React        | 19.1.1    | UI framework            |
| Vite         | 7.1.7     | Build tool & dev server |
| React Router | 7.9.4     | Client-side routing     |
| Axios        | 1.12.2    | HTTP client             |
| Chart.js     | 4.5.1     | Biểu đồ real-time       |
| TailwindCSS  | 3.4.18    | Utility-first CSS       |
| JWT Decode   | 4.0.0     | Decode JWT tokens       |

### DevOps & Tools

- **Docker Compose**: Orchestration
- **Postman**: API testing
- **Git**: Version control
- **Node.js**: Frontend build & IoT simulator

---

## 📦 Yêu cầu hệ thống

### Development

- **JDK**: 17 hoặc cao hơn
- **Node.js**: 18+ và npm
- **Docker**: 20.10+ và Docker Compose
- **Git**: Để clone repository
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Disk**: 2GB trống

### Production

- **Server**: Linux/Windows Server
- **JRE**: 17+
- **PostgreSQL**: 16+
- **Reverse Proxy**: Nginx/Apache (khuyến nghị)
- **SSL Certificate**: Cho HTTPS

---

## 🚀 Cài đặt & Khởi động

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd Water-Quality-Monitoring-System
```

### 2️⃣ Setup Backend

#### Bước 1: Khởi động Database

```bash
cd backend
docker-compose up -d
```

Database PostgreSQL sẽ chạy tại `localhost:5432` với:

- Database: `water_quality_db`
- User: `root`
- Password: `1111`

#### Bước 2: Cấu hình Environment

Tạo file `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/water_quality_db
spring.datasource.username=postgres
spring.datasource.password=1111
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your-super-secret-key-change-this-in-production-minimum-256-bits

# Email Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Server Configuration
server.port=8080
```

**⚠️ Lưu ý:**

- Thay đổi `jwt.secret` thành chuỗi bí mật của bạn (tối thiểu 256 bits)
- Với Gmail, cần tạo [App Password](https://myaccount.google.com/apppasswords) thay vì mật khẩu thông thường
- Không commit file `application.properties` lên Git (đã có trong `.gitignore`)

#### Bước 3: Build và Run Backend

**Sử dụng Gradle (Linux/Mac):**

```bash
./gradlew bootRun
```

**Sử dụng Gradle (Windows):**

```bash
gradlew.bat bootRun
```

Backend sẽ chạy tại: `http://localhost:8080`

#### Bước 4: Kiểm tra Backend

Truy cập Swagger UI để xem API documentation:

```
http://localhost:8080/swagger-ui/index.html
```

### 3️⃣ Setup Frontend

#### Bước 1: Cài đặt dependencies

```bash
cd frontend
npm install
```

#### Bước 2: Cấu hình Environment

Tạo file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

#### Bước 3: Khởi động Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4️⃣ Dữ liệu mẫu (Seeded Data)

Backend tự động tạo dữ liệu mẫu khi khởi động lần đầu:

| Loại     | Username  | Password | Email                 | Role     |
| -------- | --------- | -------- | --------------------- | -------- |
| Factory  | Factory A | -        | -                     | -        |
| Admin    | adminA    | admin    | admin@factoryA.com    | ADMIN    |
| Employee | employeeA | employee | employee@factoryA.com | EMPLOYEE |

**Device mẫu:**

- Device 1 (Factory A)
- API Key: Xem trong logs hoặc GET `/api/devices`

### 5️⃣ Test với IoT Simulator (Optional)

Mô phỏng thiết bị IoT gửi dữ liệu:

```bash
cd fake-data
node send-sensor.js
```

**Lưu ý:** Cập nhật `API_KEY` trong file `send-sensor.js` với API key thực tế từ database.

---

## 📁 Cấu trúc dự án

```
Water-Quality-Monitoring-System/
│
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/iuh/backend/
│   │   │   │   ├── config/           # Security, CORS, Filters
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── model/            # JPA Entities
│   │   │   │   ├── repository/       # Spring Data Repositories
│   │   │   │   ├── service/          # Business Logic
│   │   │   │   └── payload/          # DTOs, Requests, Responses
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                     # Unit & Integration Tests
│   ├── build.gradle                  # Gradle dependencies
│   ├── docker-compose.yml            # PostgreSQL container
│   └── README.md                     # Backend docs
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   └── layout/               # Layout components
│   │   ├── contexts/                 # React Contexts (Auth)
│   │   ├── pages/                    # Page components
│   │   ├── utils/                    # API clients, helpers
│   │   ├── App.jsx                   # Main App component
│   │   └── main.jsx                  # Entry point
│   ├── package.json                  # npm dependencies
│   ├── vite.config.js                # Vite configuration
│   └── tailwind.config.js            # Tailwind CSS config
│
├── fake-data/                        # IoT Simulator
│   └── send-sensor.js                # Node.js simulator script
│
└── README.md                         # This file
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8080/api
```

### 🔓 Authentication Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "adminA",
  "password": "admin"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "adminA",
  "role": "ADMIN",
  "factoryName": "Factory A"
}
```

### 👥 User Management (Admin only)

#### Get All Users

```http
GET /api/users
Authorization: Bearer {token}
```

#### Create User

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "EMPLOYEE"
}
```

#### Update User

```http
PUT /api/users/{userId}
Authorization: Bearer {token}
```

#### Delete User

```http
DELETE /api/users/{userId}
Authorization: Bearer {token}
```

### 🔧 Device Management (Admin only)

#### Get All Devices

```http
GET /api/devices
Authorization: Bearer {token}
```

#### Create Device

```http
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Water Monitor 1",
  "location": "Tank A - Building 1"
}

Response:
{
  "id": 1,
  "name": "Water Monitor 1",
  "apiKey": "generated-uuid-key",
  "factoryId": 1
}
```

#### Update Device

```http
PUT /api/devices/{deviceId}
Authorization: Bearer {token}
```

#### Delete Device

```http
DELETE /api/devices/{deviceId}
Authorization: Bearer {token}
```

### 📊 Sensor Data

#### Submit Sensor Data (IoT Device)

```http
POST /api/sensor-data
X-API-KEY: {device-api-key}
Content-Type: application/json

{
  "ph": 7.2,
  "temperature": 25.5,
  "turbidity": 1.5,
  "tds": 2.3
}
```

#### Get Latest Data

```http
GET /api/sensor-data/latest?deviceId={deviceId}
Authorization: Bearer {token}
```

#### Get History

```http
GET /api/sensor-data/history/{deviceId}?startDate={ISO8601}&endDate={ISO8601}&limit=100
Authorization: Bearer {token}
```

### 🎛️ Device Control

#### Control Valve

```http
POST /api/controls/devices/{deviceId}/valve
Authorization: Bearer {token}
Content-Type: application/json

{
  "open": true
}
```

#### Update Data Interval

```http
PUT /api/controls/devices/{deviceId}/interval
Authorization: Bearer {token}
Content-Type: application/json

{
  "interval": 30
}
```

#### Toggle Data Collection

```http
PUT /api/controls/devices/{deviceId}/collecting
Authorization: Bearer {token}
Content-Type: application/json

{
  "collecting": true
}
```

### 📖 Swagger UI

Truy cập full API documentation tại:

```
http://localhost:8080/swagger-ui/index.html
```

---

## 📖 Hướng dẫn sử dụng

### Đăng nhập

1. Truy cập `http://localhost:5173/login`
2. Nhập username và password (xem [Dữ liệu mẫu](#4%EF%B8%8F⃣-dữ-liệu-mẫu-seeded-data))
3. Click "Đăng nhập"

### Dashboard (Admin & Employee)

- Xem các chỉ số real-time (pH, nhiệt độ, độ đục, độ dẫn điện)
- Theo dõi biểu đồ xu hướng
- Nhận cảnh báo khi vượt ngưỡng
- Điều khiển thiết bị (van nước, cài đặt)

### Quản lý thiết bị (Admin only)

1. Vào menu "Thiết bị"
2. Click "Thêm thiết bị mới"
3. Nhập tên và vị trí
4. Hệ thống tự động tạo API Key
5. Copy API Key cho thiết bị IoT

### Quản lý người dùng (Admin only)

1. Vào menu "Người dùng"
2. Click "Thêm người dùng"
3. Nhập thông tin và chọn vai trò
4. Gán thiết bị cho Employee (nếu cần)

### Xem lịch sử

1. Vào menu "Lịch sử"
2. Chọn thiết bị
3. Chọn khoảng thời gian
4. Xem biểu đồ và bảng dữ liệu

### Cấu hình thiết bị IoT (ESP32/ESP8266)

```cpp
const char* apiUrl = "http://your-server:8080/api/sensor-data";
const char* apiKey = "your-device-api-key";

// Gửi dữ liệu
HTTPClient http;
http.begin(apiUrl);
http.addHeader("Content-Type", "application/json");
http.addHeader("X-API-KEY", apiKey);

String jsonData = "{\"ph\":7.2,\"temperature\":25.5,\"turbidity\":1.5,\"tds\":2.3}";
int httpCode = http.POST(jsonData);
```

**Lưu ý tương thích ngược:** Backend hỗ trợ cả field `"tds"` và `"turbidity"` trong JSON payload để tương thích với các thiết bị cũ vẫn gửi `"turbidity"`.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests UserServiceTest

# Generate test coverage report
./gradlew jacocoTestReport
```

### Frontend Tests

```bash
cd frontend

# Run linter
npm run lint

# Build for production (test build process)
npm run build
```

### API Testing với Postman

1. Import collection: `backend/postman_collection.json`
2. Set environment variable `baseUrl=http://localhost:8080/api`
3. Run collection để test tất cả endpoints

### Manual API Testing

```bash
cd backend

# Test complete workflow
./test_apis.sh

# Test multi-tenancy
./test_multi_tenancy.sh

# Test employee permissions
./test_employee_permissions.sh

# Test device control
./test_device_control.sh
```

---

## 🚢 Deployment

### Docker Deployment (Recommended)

#### 1. Build Backend

```bash
cd backend
./gradlew bootJar
docker build -t water-monitoring-backend .
```

#### 2. Build Frontend

```bash
cd frontend
npm run build
docker build -t water-monitoring-frontend .
```

#### 3. Deploy với Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: water_quality_db
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: always

  backend:
    image: water-monitoring-backend
    depends_on:
      - db
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/water_quality_db
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "8080:8080"
    restart: always

  frontend:
    image: water-monitoring-frontend
    ports:
      - "80:80"
    restart: always

volumes:
  db_data:
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

#### Backend (JAR)

```bash
# Build
./gradlew bootJar

# Run
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend (Static Files)

```bash
# Build
npm run build

# Serve với Nginx
# Copy dist/* to /var/www/html
```

### Environment Variables

**Backend:**

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/water_quality_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_minimum_256_bits
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
```

**Frontend:**

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## 🗺️ Roadmap

### ✅ Đã hoàn thành

- [x] Multi-tenant architecture
- [x] JWT & API Key authentication
- [x] Real-time dashboard
- [x] Device management
- [x] User management với RBAC
- [x] Email alerts
- [x] Device control (valve, settings)
- [x] Historical data viewing

### 🔄 Đang phát triển

- [ ] WebSocket for real-time updates
- [ ] Advanced data analytics
- [ ] Mobile app (React Native)
- [ ] Export data to Excel/PDF
- [ ] Scheduled reports

### 📅 Kế hoạch tương lai

- [ ] AI/ML predictions
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Advanced charts (heatmaps, etc.)
- [ ] Audit logs
- [ ] Two-factor authentication (2FA)
- [ ] REST API rate limiting
- [ ] GraphQL API
- [ ] Grafana integration
- [ ] Kubernetes deployment

---

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards

- **Java**: Follow Google Java Style Guide
- **JavaScript/React**: Follow Airbnb Style Guide
- **Commit messages**: Follow Conventional Commits

### Development Guidelines

- Viết unit tests cho features mới
- Update documentation khi thay đổi API
- Ensure code passes linting
- Follow existing architecture patterns

---

## 📞 Liên hệ & Hỗ trợ

- **Email**: support@example.com
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Spring Boot team for excellent framework
- React community for modern UI tools
- Chart.js for beautiful charts
- TailwindCSS for utility-first CSS
- All open-source contributors

---

## 📊 Project Stats

![GitHub last commit](https://img.shields.io/github/last-commit/your-repo/water-monitoring)
![GitHub issues](https://img.shields.io/github/issues/your-repo/water-monitoring)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-repo/water-monitoring)
![GitHub stars](https://img.shields.io/github/stars/your-repo/water-monitoring)

---

<div align="center">

### ⭐ Nếu dự án hữu ích, hãy cho chúng tôi một Star!

**Made with ❤️ by Water Quality Monitoring Team**

</div>
