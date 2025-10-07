# Hệ thống Giám sát Chất lượng Nước - Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Đây là mã nguồn backend cho dự án "Hệ thống Giám sát Chất lượng Nước", một nền tảng SaaS đa người dùng (multi-tenant) được xây dựng bằng Spring Boot.

## 1. Tổng quan

Dự án cung cấp một giải pháp tập trung cho các nhà máy để giám sát chất lượng nước theo thời gian thực. Hệ thống được thiết kế theo mô hình client-server, với backend này đóng vai trò cung cấp các RESTful API cho frontend (Next.js) và các thiết bị IoT (ESP8266/ESP32).

Kiến trúc đa người dùng đảm bảo rằng dữ liệu của mỗi nhà máy (tenant) được phân tách và bảo mật hoàn toàn.

## 2. Các tính năng chính

- **Kiến trúc Đa người dùng (Multi-tenancy):** Hỗ trợ nhiều nhà máy hoạt động độc lập trên cùng một nền tảng, với dữ liệu được cách ly hoàn toàn thông qua `factory_id`.
- **Phân quyền theo Vai trò (RBAC):**
    - **`ADMIN`**: Quản lý người dùng và thiết bị trong phạm vi nhà máy của mình.
    - **`EMPLOYEE`**: (Sẽ triển khai) Chỉ có quyền truy cập vào các thiết bị được chỉ định.
- **Xác thực kép:**
    - **Người dùng:** Xác thực bằng email và mật khẩu, trả về JWT (JSON Web Token) để truy cập các API bảo mật.
    - **Thiết bị IoT:** Mỗi thiết bị được cấp một `API Key` duy nhất để xác thực và gửi dữ liệu.
- **Quản lý Thiết bị:** `ADMIN` có thể thực hiện các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) trên các thiết bị thuộc nhà máy của mình.
- **Thu thập Dữ liệu Cảm biến:** Tiếp nhận và lưu trữ dữ liệu (pH, nhiệt độ, độ đục, v.v.) được gửi từ các thiết bị IoT.

## 3. Kiến trúc & Công nghệ

- **Ngôn ngữ & Framework:** Java 17, Spring Boot 3.x
- **Bảo mật:** Spring Security 6.x
- **Cơ sở dữ liệu:** MariaDB (Quản lý qua Spring Data JPA/Hibernate)
- **Build & Quản lý Dependency:** Gradle
- **Containerization:** Docker & Docker Compose (cho môi trường phát triển)
- **Mô hình xác thực:**
    - `JwtAuthenticationFilter` để xử lý JWT từ người dùng.
    - `ApiKeyAuthFilter` để xử lý `X-API-KEY` từ thiết bị IoT.

## 4. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu
- JDK 17 hoặc mới hơn
- Docker và Docker Compose

### Các bước cài đặt

1.  **Clone repository:**
    ```bash
    git clone <your-repository-url>
    cd Water-Quality-Monitoring-System/backend
    ```

2.  **Cấu hình Môi trường:**
    Tạo một tệp `application.properties` trong thư mục `src/main/resources/`. Đây là cấu hình tối thiểu cần thiết:
    ```properties
    # Database Connection
    spring.datasource.url=jdbc:mariadb://localhost:3306/water_quality_db
    spring.datasource.username=root
    spring.datasource.password=1111
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true

    # JWT Secret Key
    jwt.secret=your-super-secret-key-that-is-long-and-secure-and-does-not-contain-hyphens

    # Mail Sender (for future use)
    # spring.mail.host=smtp.example.com
    # spring.mail.port=587
    # spring.mail.username=your-email
    # spring.mail.password=your-password
    # spring.mail.properties.mail.smtp.auth=true
    # spring.mail.properties.mail.smtp.starttls.enable=true
    ```
    *Lưu ý: Thay đổi `jwt.secret` thành một chuỗi bí mật của riêng bạn.*

3.  **Khởi chạy Cơ sở dữ liệu:**
    Dự án đã có sẵn tệp `docker-compose.yml` để khởi tạo một container MariaDB. Chạy lệnh sau từ thư mục gốc của backend:
    ```bash
    docker-compose up -d
    ```
    Lệnh này sẽ khởi tạo một database tên là `water_quality_db` với mật khẩu của `root` là `1111`.

4.  **Khởi chạy ứng dụng Spring Boot:**
    Bạn có thể chạy ứng dụng bằng Gradle wrapper:
    ```bash
    ./gradlew bootRun
    ```
    Ứng dụng sẽ khởi động và chạy tại `http://localhost:8080`. Dữ liệu mẫu (1 factory, 1 admin, 1 employee) sẽ được tự động thêm vào CSDL nhờ `DataSeeder`.

### Kiểm tra API
Dự án đi kèm một script `test_apis.sh` để kiểm tra các luồng chính. Sau khi khởi động ứng dụng, mở một terminal khác và chạy:
```bash
./test_apis.sh
```

## 5. Tổng quan về API

### Authentication (`/api/auth`)
- `POST /login`: Đăng nhập với `username` và `password`, trả về JWT.

### User Management (`/api/users`) - Yêu cầu quyền ADMIN
- `POST /`: Tạo một người dùng mới (`EMPLOYEE`) trong nhà máy của admin.
- `GET /`: Lấy danh sách tất cả người dùng trong nhà máy.
- `PUT /{id}`: Cập nhật thông tin người dùng.
- `DELETE /{id}`: Xóa người dùng.

### Device Management (`/api/devices`) - Yêu cầu quyền ADMIN
- `POST /`: Tạo một thiết bị mới, hệ thống sẽ tự động sinh `apiKey`.
- `GET /`: Lấy danh sách tất cả thiết bị trong nhà máy.
- `GET /{id}`: Lấy thông tin chi tiết một thiết bị.
- `PUT /{id}`: Cập nhật tên thiết bị.
- `DELETE /{id}`: Xóa một thiết bị.

### Sensor Data (`/api/sensor-data`)
- `POST /`: Endpoint dành cho thiết bị IoT. Gửi dữ liệu cảm biến lên hệ thống. Yêu cầu xác thực bằng header `X-API-KEY`.
- `GET /history/{deviceId}`: (Yêu cầu JWT) Lấy lịch sử dữ liệu của một thiết bị cụ thể.