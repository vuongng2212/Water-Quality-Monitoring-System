# Kế hoạch Ngày 1: Nền tảng Dự án & Cơ sở dữ liệu

**Mục tiêu:** Đặt nền móng vững chắc cho toàn bộ backend. Kết thúc ngày, chúng ta sẽ có một dự án Spring Boot hoàn chỉnh với cấu trúc cơ sở dữ liệu đã được định nghĩa trong mã nguồn.

---

### Nhiệm vụ chính:

1.  **Khởi tạo Dự án Spring Boot:**
    *   Sử dụng Spring Initializr (start.spring.io) hoặc IDE để tạo một dự án Gradle mới.
    *   **Ngôn ngữ:** Java
    *   **Phiên bản Spring Boot:** 3.x
    *   **Thông tin dự án:**
        *   Group: `com.example.waterquality`
        *   Artifact: `backend`
        *   Name: `backend`
        *   Package name: `com.example.waterquality.backend`
    *   **Dependencies (quan trọng):**
        *   Spring Web
        *   Spring Data JPA
        *   MariaDB Driver
        *   Spring Security
        *   Lombok (để giảm code boilerplate)
        *   Validation
        *   `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (để xử lý JWT)

2.  **Cấu hình `application.properties`:**
    *   Thiết lập kết nối đến cơ sở dữ liệu MariaDB (URL, username, password).
    *   Cấu hình JPA để tự động tạo/cập nhật schema (`spring.jpa.hibernate.ddl-auto=update`). *Lưu ý: Chỉ dùng cho môi trường phát triển.*
    *   Thêm một secret key để ký JWT (`jwt.secret=your-secret-key`).

3.  **Tạo các Lớp Entity:**
    *   Dựa trên `architecture.md`, tạo các file Java trong package `com.example.waterquality.backend.model`.
    *   **Tạo `Factory.java`**: `id`, `name`, `address`.
    *   **Tạo `User.java`**: `id`, `username`, `password`, `email`, `role` (Enum: `ADMIN`, `EMPLOYEE`). Mối quan hệ `@ManyToOne` với `Factory`.
    *   **Tạo `Device.java`**: `id`, `name`, `apiKey` (duy nhất). Mối quan hệ `@ManyToOne` với `Factory`.
    *   **Tạo `SensorData.java`**: `id`, `ph`, `temperature`, `turbidity`, `conductivity`, `timestamp`. Mối quan hệ `@ManyToOne` với `Device`.
    *   **Tạo `DeviceSettings.java`**: `id`, `isValveOpen`, `isCollectingData`, `dataIntervalSeconds`. Mối quan hệ `@OneToOne` với `Device`.
    *   **Tạo `EmployeeDeviceAccess.java`**: Sử dụng `@EmbeddedId` cho khóa chính phức hợp gồm `userId` và `deviceId`. Mối quan hệ `@ManyToOne` với `User` và `Device`.

### Kết quả cần đạt:
*   Một dự án Spring Boot có thể khởi chạy mà không có lỗi.
*   Tất cả các lớp Entity đã được tạo với đầy đủ các thuộc tính và mối quan hệ (annotations `@Entity`, `@Id`, `@ManyToOne`, v.v.).
*   Khi chạy dự án, các bảng tương ứng được tự động tạo trong cơ sở dữ liệu MariaDB.