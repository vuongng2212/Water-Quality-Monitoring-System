# 1. Kế Hoạch Triển Khai

Kế hoạch được điều chỉnh để phù hợp với kiến trúc đa người dùng (multi-tenant).

### 1.1. Giai đoạn 1: Xây dựng Nền tảng Backend Multi-tenant

*   **Setup:**
    *   Khởi tạo dự án Spring Boot với Gradle.
    *   Cấu hình `build.gradle` với các dependency cần thiết (Web, JPA, MariaDB, Security).
*   **Entities & Database:**
    *   Tạo các lớp Entity mới: `Factory`, `Device`, `EmployeeDeviceAccess`.
    *   Cập nhật Entity `User`, `SensorData`, và tạo `DeviceSettings`.
    *   Sử dụng Flyway hoặc Liquibase để quản lý migration cho schema mới.
*   **Bảo mật & Multi-tenancy:**
    *   Cấu hình Spring Security.
    *   Triển khai `UserDetailsService` để load thông tin người dùng từ CSDL.
    *   Cập nhật logic tạo và xác thực JWT để bao gồm `factory_id` và `role`.
    *   Triển khai bộ lọc (Filter) để xác thực API Key cho ESP, liên kết request với `Device` và `Factory` tương ứng.
    *   **Quan trọng:** Xây dựng cơ chế cách ly dữ liệu (Data Isolation) ở tầng service hoặc repository, đảm bảo mọi truy vấn đều được lọc theo `factory_id` từ JWT.
*   **API Core:**
    *   `AuthController`: Xây dựng API đăng nhập `/api/auth/login`.
    *   `SensorDataController`: Xây dựng API nhận dữ liệu `/api/sensor-data` và API lấy dữ liệu lịch sử.
    *   `DeviceController`: Xây dựng các API cơ bản để đăng ký và lấy danh sách thiết bị.

### 1.2. Giai đoạn 2: Phát triển Giao diện Quản trị cho Admin

*   **Setup:** Khởi tạo dự án Next.js với TypeScript.
*   **Kết nối API:** Tạo một service/module (`apiClient.ts` dùng Axios) để quản lý việc gọi API và đính kèm JWT.
*   **Xác thực & Layout:**
    *   Xây dựng trang đăng nhập.
    *   Quản lý trạng thái đăng nhập (user, role, factory) bằng React Context hoặc state management library.
    *   Tạo "Private Route" và layout quản trị cho `ADMIN`.
*   **Chức năng Quản lý (Admin):**
    *   Xây dựng giao diện CRUD cho **Quản lý Nhân viên** (`/api/users`).
    *   Xây dựng giao diện CRUD cho **Quản lý Thiết bị** (`/api/devices`).
    *   Xây dựng giao diện để **phân quyền thiết bị** cho nhân viên (`/api/devices/{id}/assign`).
*   **Dashboard (Admin View):**
    *   Tích hợp thư viện biểu đồ.
    *   Triển khai Polling để cập nhật dữ liệu từ **tất cả các thiết bị** thuộc nhà máy.
    *   Hiển thị cảnh báo.

### 1.3. Giai đoạn 3: Hoàn thiện Chức năng cho Employee và Tích hợp

*   **Backend Hoàn thiện:**
    *   Triển khai tác vụ định kỳ (`@Scheduled`) cho logic cảnh báo SOS, đảm bảo cảnh báo được gửi đúng `ADMIN` của nhà máy.
    *   Tích hợp dịch vụ gửi email.
    *   Hoàn thiện các API điều khiển thiết bị (`/api/controls/devices/{id}/*`) với logic kiểm tra quyền hạn chi tiết (cả `ADMIN` và `EMPLOYEE`).
*   **Frontend Hoàn thiện (Employee View):**
    *   Tạo layout và các trang dành cho vai trò `EMPLOYEE`.
    *   Dashboard của `EMPLOYEE` chỉ hiển thị dữ liệu từ các thiết bị được phân công.
    *   Giao diện điều khiển thiết bị cho `EMPLOYEE`.
*   **Kiểm thử và Triển khai:**
    *   Thực hiện kiểm thử E2E cho các luồng của cả `ADMIN` và `EMPLOYEE`.
    *   Kiểm thử kỹ lưỡng cơ chế cách ly dữ liệu.
    *   Triển khai Frontend lên Vercel/Netlify.
    *   Triển khai Backend và Database lên một nhà cung cấp cloud.
    *   Chuẩn bị tài liệu hướng dẫn sử dụng và demo.