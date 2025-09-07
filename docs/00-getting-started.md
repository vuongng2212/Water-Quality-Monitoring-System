# Hướng dẫn Cài đặt & Chạy dự án

Tài liệu này hướng dẫn cách cài đặt và chạy dự án "Hệ Thống Giám Sát Chất Lượng Nước" trên máy tính cá nhân để phục vụ mục đích phát triển.

## Yêu cầu môi trường

- **Java Development Kit (JDK)**: phiên bản 17 hoặc mới hơn.
- **Node.js**: phiên bản 18.x hoặc mới hơn.
- **MariaDB**: Cài đặt và khởi chạy dịch vụ MariaDB server.
- **Git**: Để clone mã nguồn.
- **ngrok**: Để public backend API ra internet.

## Các bước cài đặt

### 1. Backend (Spring Boot)

1.  **Clone mã nguồn:**
    ```bash
    git clone <URL_CUA_REPOSITORY>
    cd <TEN_THU_MUC_DU_AN>/backend
    ```

2.  **Cấu hình Database:**
    - Mở MariaDB client và tạo một database mới cho dự án.
      ```sql
      CREATE DATABASE water_quality_monitoring;
      ```

3.  **Cấu hình Biến môi trường:**
    - Tạo một file `application-local.properties` trong thư mục `src/main/resources`.
    - Thêm các cấu hình sau và thay đổi cho phù hợp với môi trường của bạn:
      ```properties
      # Database
      spring.datasource.url=jdbc:mariadb://localhost:3306/water_quality_monitoring
      spring.datasource.username=root
      spring.datasource.password=your_db_password

      # JWT Secret Key (thay bằng một chuỗi ngẫu nhiên, đủ dài và an toàn)
      jwt.secret=DayLaMotChuoiBiMatRatDaiVaAnToanDungDeMaHoaJWT

      # API Key for ESP (thay bằng một chuỗi ngẫu nhiên)
      esp.api-key=ESP_SECRET_API_KEY_12345

      # Email (cho tính năng SOS)
      spring.mail.host=smtp.gmail.com
      spring.mail.port=587
      spring.mail.username=your-email@gmail.com
      spring.mail.password=your_gmail_app_password
      ```

4.  **Chạy ứng dụng:**
    - Sử dụng Gradle wrapper để build và chạy dự án:
      ```bash
      ./gradlew bootRun
      ```
    - Backend sẽ chạy tại địa chỉ `http://localhost:8080`.

5.  **Public API với ngrok:**
    - Mở một terminal khác và chạy lệnh:
      ```bash
      ngrok http 8080
      ```
    - `ngrok` sẽ cung cấp một URL dạng `https://<random-string>.ngrok.io`. Đây là địa chỉ public API của bạn.

### 2. Frontend (Next.js)

1.  **Cài đặt dependencies:**
    - Di chuyển vào thư mục frontend và cài đặt các gói cần thiết:
      ```bash
      cd ../frontend
      npm install
      ```

2.  **Cấu hình Biến môi trường:**
    - Tạo một file `.env.local` ở thư mục gốc của frontend.
    - Thêm cấu hình sau, trỏ đến URL public của backend đã tạo bởi `ngrok`:
      ```
      NEXT_PUBLIC_API_BASE_URL=https://<random-string>.ngrok.io
      ```

3.  **Chạy ứng dụng:**
    ```bash
    npm run dev
    ```
    - Frontend sẽ chạy tại địa chỉ `http://localhost:3000`.

Bây giờ bạn có thể mở trình duyệt và truy cập `http://localhost:3000` để sử dụng ứng dụng.