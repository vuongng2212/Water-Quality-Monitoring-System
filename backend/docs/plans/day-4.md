# Kế hoạch Ngày 4: API Thiết bị & Dữ liệu

**Mục tiêu:** Xây dựng các endpoint để quản lý thiết bị và tiếp nhận dữ liệu từ các cảm biến IoT. Ngày hôm nay sẽ tập trung vào hai luồng chính: luồng cho `ADMIN` quản lý thiết bị và luồng cho thiết bị (ESP) gửi dữ liệu.

---

### Nhiệm vụ chính:

1.  **Tạo `DeviceController`:**
    *   Tạo một controller mới `DeviceController.java` với tiền tố `/api/devices`.
    *   Tương tự như `UserController`, áp dụng `@PreAuthorize("hasRole('ADMIN')")` ở cấp độ lớp để chỉ `ADMIN` mới có quyền quản lý.
    *   **Logic chung:** Mọi thao tác trong controller này đều phải lấy `factory_id` từ JWT của `ADMIN` để đảm bảo họ chỉ quản lý thiết bị của nhà máy mình.

2.  **Triển khai các Endpoint CRUD cho Thiết bị:**
    *   **`POST /` - Đăng ký thiết bị mới:**
        *   Nhận thông tin thiết bị từ request body (ví dụ: `name`).
        *   Tự động tạo một `apiKey` duy nhất (sử dụng `UUID.randomUUID().toString()`).
        *   Gán `factory_id` từ JWT của `ADMIN` cho thiết bị mới.
        *   Lưu thiết bị vào `DeviceRepository`.
        *   Trả về thông tin thiết bị, bao gồm cả `apiKey` để admin có thể cấu hình cho ESP.
    *   **`GET /` - Lấy danh sách thiết bị:**
        *   Truy vấn tất cả thiết bị thuộc `factory_id` của `ADMIN`.
    *   **`GET /{id}` - Lấy thông tin một thiết bị:**
        *   Truy vấn thiết bị theo `id` và `factory_id`.
    *   **`PUT /{id}` - Cập nhật thiết bị:**
        *   Đảm bảo chỉ cập nhật thiết bị trong nhà máy của `ADMIN`.
    *   **`DELETE /{id}` - Xóa thiết bị:**
        *   Đảm bảo chỉ xóa thiết bị trong nhà máy của `ADMIN`.

3.  **Tạo `ApiKeyAuthFilter`:**
    *   Tạo một bộ lọc mới `ApiKeyAuthFilter.java`.
    *   **Logic:**
        *   Bộ lọc này chỉ áp dụng cho các request đến `/api/sensor-data`.
        *   Trích xuất API Key từ một header tùy chỉnh (ví dụ: `X-API-KEY`).
        *   Nếu có header, truy vấn `DeviceRepository` để tìm thiết bị tương ứng với API Key.
        *   Nếu tìm thấy, tạo một đối tượng xác thực tùy chỉnh (ví dụ: `ApiKeyAuthenticationToken`) chứa thông tin về `Device` và `Factory` và đặt nó vào `SecurityContextHolder`.
        *   Nếu không tìm thấy, trả về lỗi 401 Unauthorized.
    *   **Tích hợp:** Thêm bộ lọc này vào `SecurityFilterChain`, đặt nó chạy *trước* `JwtAuthenticationFilter`.

4.  **Tạo `SensorDataController`:**
    *   Tạo controller `SensorDataController.java` với tiền tố `/api/sensor-data`.
    *   **`POST /` - Nhận dữ liệu từ cảm biến:**
        *   Endpoint này không cần `@PreAuthorize` vì nó được bảo vệ bởi `ApiKeyAuthFilter`.
        *   Nhận dữ liệu cảm biến (pH, temp, v.v.) từ request body.
        *   Lấy thông tin `Device` từ `SecurityContextHolder` (đã được `ApiKeyAuthFilter` đặt vào).
        *   Tạo một đối tượng `SensorData` mới, gán `Device` cho nó và lưu vào `SensorDataRepository`.
        *   Trả về `201 Created`.
    *   **`GET /history/{deviceId}` - Lấy dữ liệu lịch sử:**
        *   Endpoint này phải được bảo vệ, yêu cầu người dùng (`ADMIN` hoặc `EMPLOYEE`) phải đăng nhập.
        *   Kiểm tra xem người dùng có quyền xem thiết bị này không (sẽ hoàn thiện ở Ngày 6).
        *   Truy vấn `SensorDataRepository` để lấy dữ liệu theo `deviceId`, có thể kèm theo các tham số phân trang hoặc khoảng thời gian.

### Kết quả cần đạt:
*   `ADMIN` có thể thực hiện các thao tác CRUD trên các thiết bị thuộc nhà máy của mình.
*   Một thiết bị ESP có thể gửi dữ liệu lên endpoint `/api/sensor-data` bằng cách cung cấp `X-API-KEY` hợp lệ.
*   Dữ liệu cảm biến được lưu trữ chính xác và liên kết với đúng thiết bị đã gửi nó.
*   Các endpoint quản lý thiết bị được bảo vệ, chỉ `ADMIN` mới truy cập được.