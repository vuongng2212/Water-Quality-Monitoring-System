# Sprint 3: Tích hợp quản lý thiết bị

## Mục tiêu

Tích hợp các chức năng liên quan đến thiết bị (liệt kê, tạo, cập nhật, xóa, gán/hủy gán cho nhân viên) vào frontend bằng cách sử dụng các API backend tương ứng.

## Công việc cần thực hiện

1.  **Cập nhật `DashboardPage.jsx` (hoặc một trang/components khác nếu có):**
    *   Gọi API để lấy danh sách thiết bị (ví dụ: `GET /api/devices`).
    *   Hiển thị danh sách thiết bị, đảm bảo rằng người dùng EMPLOYEE chỉ thấy các thiết bị mà họ được phép truy cập.
    *   Triển khai chức năng chọn thiết bị để hiển thị dữ liệu cụ thể (ví dụ: dữ liệu cho `MetricCard` và `RealtimeChart`).

2.  **Cập nhật `DeviceControl.jsx`:**
    *   Gọi API để gửi lệnh điều khiển đến thiết bị (ví dụ: `PUT /api/devices/{deviceId}/control` - endpoint này có thể cần được tạo ở backend nếu chưa có).
    *   Hiển thị trạng thái hiện tại của thiết bị (ví dụ: van mở/đóng).

3.  **Cập nhật `UserManagementPage.jsx` (nếu cần):**
    *   Triển khai giao diện cho ADMIN để gán hoặc hủy gán thiết bị cho nhân viên.
    *   Gọi các API tương ứng (ví dụ: `POST /api/devices/{deviceId}/assign`, `POST /api/devices/{deviceId}/unassign`).

## Ghi chú

*   Endpoint API thiết bị: `GET /api/devices`, `POST /api/devices`, `PUT /api/devices/{id}`, `DELETE /api/devices/{id}`, `POST /api/devices/{deviceId}/assign`, `POST /api/devices/{deviceId}/unassign`
*   Endpoint API điều khiển thiết bị: `PUT /api/devices/{deviceId}/control` (cần xác minh hoặc tạo nếu chưa có).
*   Cần đảm bảo các quyền hạn của ADMIN và EMPLOYEE được tuân thủ trên frontend dựa trên vai trò của người dùng.