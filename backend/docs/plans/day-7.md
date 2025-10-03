# Kế hoạch Ngày 7: API Điều khiển & Tổng kết

**Mục tiêu:** Hoàn thiện các tính năng cốt lõi cuối cùng, thêm tài liệu cho API và chuẩn bị mọi thứ sẵn sàng cho buổi báo cáo.

---

### Nhiệm vụ chính:

1.  **Tạo `DeviceControlController`:**
    *   Tạo một controller mới `DeviceControlController.java` với tiền tố `/api/controls`.
    *   **Logic chung:** Mọi endpoint trong controller này đều phải kiểm tra quyền truy cập thiết bị của người dùng trước khi thực hiện hành động.

2.  **Triển khai các Endpoint Điều khiển:**
    *   **`POST /devices/{deviceId}/valve` - Điều khiển van nước:**
        *   **Request Body:** Nhận một đối tượng đơn giản, ví dụ: `{"open": true}`.
        *   **Bảo mật:**
            *   Sử dụng `@PreAuthorize("isAuthenticated()")` để đảm bảo người dùng đã đăng nhập.
            *   Bên trong phương thức, gọi `permissionService.canAccessDevice(currentUser, deviceId)`. Nếu không có quyền, ném `AccessDeniedException`.
        *   **Logic:**
            *   Tìm `DeviceSettings` liên quan đến `deviceId`.
            *   Cập nhật trạng thái `isValveOpen`.
            *   Lưu lại thay đổi.
            *   Trả về trạng thái mới.
    *   **`POST /devices/{deviceId}/interval` - Thay đổi khoảng thời gian gửi dữ liệu:**
        *   **Request Body:** Nhận `{"interval": 30}`.
        *   **Bảo mật:** Tương tự như API điều khiển van.
        *   **Logic:** Cập nhật `dataIntervalSeconds` trong `DeviceSettings`.

3.  **Tích hợp Swagger/OpenAPI để tạo tài liệu API:**
    *   Thêm dependency `springdoc-openapi-starter-webmvc-ui` vào `build.gradle`.
    *   **Cấu hình:**
        *   Tạo một lớp `OpenApiConfig.java`.
        *   Định nghĩa một `OpenAPI` bean để cung cấp các thông tin chung về API (tiêu đề, phiên bản, mô tả).
        *   Cấu hình security scheme cho JWT để có thể gửi token trực tiếp từ giao diện Swagger UI.
    *   **Thêm Annotations vào Controllers:**
        *   Sử dụng `@Operation(summary = "...")` và `@ApiResponse(...)` để mô tả rõ hơn về các endpoint và các phản hồi có thể có.
        *   Sau khi cấu hình, tài liệu API sẽ có sẵn tại `/swagger-ui.html`.

4.  **Tổng kết và Chuẩn bị Báo cáo:**
    *   **Dọn dẹp code:** Rà soát lại code, xóa các comment không cần thiết, định dạng lại code cho thống nhất.
    *   **Kiểm tra lại tất cả các luồng:**
        *   Luồng đăng ký, đăng nhập.
        *   Luồng CRUD người dùng của `ADMIN`.
        *   Luồng CRUD thiết bị của `ADMIN`.
        *   Luồng phân quyền của `ADMIN`.
        *   Luồng xem dữ liệu của `EMPLOYEE`.
        *   Luồng điều khiển thiết bị của cả `ADMIN` và `EMPLOYEE`.
    *   **Chuẩn bị dữ liệu mẫu (seeding):** Tạo một script SQL hoặc một `CommandLineRunner` bean để chèn một vài dữ liệu mẫu (1 factory, 1 admin, 1 employee, 2 devices) để quá trình demo/báo cáo diễn ra suôn sẻ.

### Kết quả cần đạt:
*   Các API điều khiển thiết bị hoạt động và được bảo vệ đúng cách.
*   Tài liệu API tự động được tạo và có thể truy cập qua giao diện Swagger UI, giúp việc kiểm thử và tích hợp dễ dàng hơn.
*   Codebase sạch sẽ, sẵn sàng cho việc báo cáo.
*   Hệ thống có sẵn dữ liệu mẫu để demo các tính năng chính.
*   Toàn bộ các mục tiêu cốt lõi của kế hoạch 7 ngày đã được hoàn thành.