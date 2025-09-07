# 1. Kế Hoạch Triển Khai

### 1.1. Giai đoạn 1: Phát triển Backend và Kết nối IoT
*   **Setup:** Khởi tạo dự án Spring Boot với **Gradle**, cấu hình file `build.gradle` với các dependency cần thiết (Web, JPA, MariaDB, Security).
*   **Entities:** Tạo các lớp Entity `User`, `SensorData`, `SystemSettings` và các Repository tương ứng.
*   **Bảo mật:**
    *   Cấu hình Spring Security, triển khai `UserDetailsService`.
    *   Triển khai logic tạo và xác thực JWT.
    *   Triển khai bộ lọc (Filter) để xác thực API Key cho ESP.
*   **API Core:**
    *   `AuthController`: Xây dựng API đăng nhập `/api/auth/login`.
    *   `SensorDataController`: Xây dựng API nhận dữ liệu `/api/sensor-data` (cho ESP) và API lấy dữ liệu lịch sử (cho Frontend).
*   **Kiểm thử ban đầu:** Viết một script giả lập ESP (bằng Python/Node.js) để gửi dữ liệu và kiểm tra xem dữ liệu có được lưu thành công vào MariaDB không.

### 1.2. Giai đoạn 2: Phát triển Giao diện và Chức năng cơ bản
*   **Setup:** Khởi tạo dự án Next.js với TypeScript.
*   **Kết nối API:** Tạo một service/module (ví dụ: `apiClient.ts` dùng Axios) để quản lý việc gọi API và đính kèm JWT.
*   **Xác thực:**
    *   Xây dựng trang đăng nhập.
    *   Sử dụng React Context hoặc một thư viện state management để quản lý trạng thái đăng nhập của người dùng.
    *   Tạo "Private Route" để bảo vệ các trang yêu cầu đăng nhập.
*   **Dashboard:**
    *   Dựng layout chính cho trang Dashboard.
    *   Tích hợp thư viện biểu đồ (ví dụ: Recharts, Chart.js) để vẽ biểu đồ đường.
    *   Triển khai cơ chế Polling để tự động cập nhật biểu đồ và các chỉ số.
    *   Hiển thị các cảnh báo thông thường (notification).

### 1.3. Giai đoạn 3: Hoàn thiện và Tích hợp
*   **Backend Hoàn thiện:**
    *   Triển khai tác vụ định kỳ (`@Scheduled`) cho logic cảnh báo SOS.
    *   Tích hợp dịch vụ gửi email (ví dụ: `JavaMailSender` của Spring) để gửi cảnh báo SOS.
*   **Frontend Hoàn thiện:**
    *   Xây dựng giao diện CRUD cho trang Quản lý người dùng.
    *   Xây dựng giao diện cho các chức năng điều khiển (bật/tắt van, bật/tắt thu thập dữ liệu, thay đổi chu kỳ).
*   **Kiểm thử và Triển khai:**
    *   Thực hiện kiểm thử E2E (End-to-End) các luồng quan trọng.
    *   Triển khai Frontend lên Vercel/Netlify.
    *   Chuẩn bị tài liệu hướng dẫn chạy Backend local và sử dụng `ngrok` để demo.