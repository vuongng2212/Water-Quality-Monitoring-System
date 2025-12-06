# Kiến trúc hệ thống cho nhóm IoT

## 1. Tổng quan hệ thống

Hệ thống giám sát chất lượng nước là một nền tảng SaaS đa người dùng (multi-tenant) được thiết kế để thu thập dữ liệu cảm biến từ các thiết bị IoT (ESP), hiển thị dữ liệu này và cho phép điều khiển từ xa các thiết bị tại các nhà máy khác nhau.

## 2. Các thành phần liên quan đến IoT

### a. Thiết bị IoT (ESP)

*   **Chức năng:** Các thiết bị ESP được triển khai tại nhà máy để đo lường các thông số chất lượng nước (pH, nhiệt độ, độ đục, độ dẫn điện) và gửi dữ liệu này về backend.
*   **Xác thực:** Mỗi thiết bị được cấp một `API Key` duy nhất. `API Key` này được sử dụng để xác thực khi thiết bị gửi dữ liệu lên hệ thống.
*   **Định danh:** Mỗi thiết bị có một `device_id` duy nhất trong hệ thống, liên kết với một `factory_id` cụ thể.

### b. Backend (Spring Boot)

*   **API tiếp nhận dữ liệu:** Backend cung cấp các endpoint RESTful để nhận dữ liệu từ các thiết bị IoT.
*   **Xác thực API Key:** [`ApiKeyAuthFilter`](src/main/java/iuh/backend/config/ApiKeyAuthFilter.java:1) trong Spring Security chịu trách nhiệm xác thực `API Key` từ các thiết bị. Nếu `API Key` hợp lệ, hệ thống sẽ tải thông tin thiết bị vào ngữ cảnh bảo mật.
*   **Cách ly dữ liệu:** Dữ liệu cảm biến được lưu trữ trong bảng `sensor_data` và được liên kết với `device_id`. Cơ chế đa người dùng đảm bảo rằng dữ liệu này chỉ hiển thị cho người dùng thuộc cùng `factory_id` với thiết bị.
*   **Điều khiển thiết bị:** Các API cho phép người dùng có quyền (ADMIN/EMPLOYEE) gửi lệnh điều khiển đến thiết bị (ví dụ: bật/tắt van, thay đổi cài đặt).

## 3. Luồng dữ liệu và tương tác

### a. Thiết bị gửi dữ liệu cảm biến

1.  Thiết bị ESP thu thập dữ liệu (pH, nhiệt độ, độ đục, độ dẫn điện).
2.  Thiết bị tạo một yêu cầu HTTP POST đến endpoint `/api/sensor-data` của backend.
3.  Yêu cầu bao gồm:
    *   **Header:** `X-API-KEY: [API_KEY_CỦA_THIẾT_BỊ]`
    *   **Body (JSON):**
        ```json
        {
            "ph": 7.5,
            "temperature": 26.1,
            "turbidity": 1.2,
            "tds": 1.2
        }
        ```
4.  Backend nhận yêu cầu, xác thực `API Key`.
5.  Nếu xác thực thành công, dữ liệu được lưu vào cơ sở dữ liệu, liên kết với `device_id` tương ứng với `API Key`.

### b. Người dùng xem dữ liệu cảm biến

1.  Người dùng (ADMIN hoặc EMPLOYEE) đăng nhập vào hệ thống thông qua frontend.
2.  Frontend gửi yêu cầu HTTP GET đến backend (ví dụ: `/api/sensor-data/history/{deviceId}`) để lấy dữ liệu cảm biến.
3.  Yêu cầu bao gồm:
    *   **Header:** `Authorization: Bearer [JWT_TOKEN_CỦA_NGƯỜI_DÙNG]`
4.  Backend nhận yêu cầu, xác thực `JWT Token`.
5.  Hệ thống kiểm tra `factory_id` từ `JWT Token` và quyền truy cập của người dùng đối với `deviceId` được yêu cầu (thông qua [`PermissionService`](src/main/java/iuh/backend/service/PermissionService.java:1)).
6.  Nếu người dùng có quyền và thuộc cùng `factory_id`, dữ liệu lịch sử cảm biến sẽ được trả về.

### c. Người dùng điều khiển thiết bị (Tương lai)

1.  Người dùng (ADMIN hoặc EMPLOYEE) gửi yêu cầu điều khiển từ frontend (ví dụ: bật van).
2.  Frontend gửi yêu cầu HTTP POST/PUT đến backend (ví dụ: `/api/devices/{deviceId}/control`).
3.  Yêu cầu bao gồm:
    *   **Header:** `Authorization: Bearer [JWT_TOKEN_CỦA_NGƯỜI_DÙNG]`
    *   **Body (JSON):** Chứa các lệnh điều khiển (ví dụ: `{"valveStatus": "OPEN"}`).
4.  Backend nhận yêu cầu, xác thực `JWT Token`.
5.  Hệ thống kiểm tra `factory_id` và quyền của người dùng đối với `deviceId`.
6.  Nếu có quyền, backend sẽ xử lý lệnh điều khiển và có thể gửi tín hiệu đến thiết bị (qua cơ chế polling hoặc WebSocket trong tương lai).

## 4. Bảo mật

*   **Xác thực mạnh mẽ:** Sử dụng JWT cho người dùng và API Key cho thiết bị.
*   **Cách ly dữ liệu:** Đảm bảo mỗi nhà máy chỉ có thể truy cập dữ liệu của riêng mình.
*   **Phân quyền chi tiết:** Kiểm soát chặt chẽ quyền truy cập của `EMPLOYEE` đến từng thiết bị cụ thể.

Tài liệu này cung cấp cái nhìn tổng quan về cách các thiết bị IoT tương tác với hệ thống backend, cách dữ liệu được xử lý và bảo mật.