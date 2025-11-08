# Sprint 2: Tích hợp dữ liệu Dashboard

## Mục tiêu

Thay thế dữ liệu giả lập trên trang Dashboard bằng dữ liệu thực tế được lấy từ backend thông qua các API endpoint tương ứng.

## Công việc cần thực hiện

1.  **Cập nhật `DashboardPage.jsx` và `MetricCard.jsx`:**
    *   Gọi API để lấy dữ liệu cảm biến mới nhất (ví dụ: `GET /api/sensor-data/latest` hoặc `GET /api/devices/{deviceId}/latest-data`).
    *   Truyền dữ liệu này đến `MetricCard` để hiển thị các chỉ số như pH, nhiệt độ, v.v.

2.  **Cập nhật `RealtimeChart.jsx`:**
    *   Gọi API để lấy dữ liệu cảm biến lịch sử (ví dụ: `GET /api/sensor-data/history/{deviceId}`).
    *   Sử dụng dữ liệu này để cập nhật biểu đồ thời gian thực.
    *   Triển khai cơ chế HTTP polling để cập nhật dữ liệu và biểu đồ theo định kỳ (ví dụ: mỗi 15 giây như trong `tech.md`).

3.  **Xử lý trạng thái tải dữ liệu và lỗi:**
    *   Hiển thị trạng thái "đang tải" khi chờ dữ liệu từ API.
    *   Xử lý và hiển thị lỗi nếu API gọi không thành công.

## Ghi chú

*   Endpoint API dữ liệu cảm biến: `GET /api/sensor-data/latest`, `GET /api/sensor-data/history/{deviceId}`
*   Cần đảm bảo dữ liệu được lọc theo `factory_id` và quyền truy cập của người dùng (đối với EMPLOYEE).
*   Cơ chế polling nên được quản lý cẩn thận để tránh quá tải API.