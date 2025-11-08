# Sprint 5: Tích hợp cảnh báo và thông báo

## Mục tiêu

Tích hợp các cơ chế hiển thị cảnh báo và thông báo từ hệ thống vào frontend, bao gồm cả cảnh báo thời gian thực và thông báo liên quan đến email SOS.

## Công việc cần thực hiện

1.  **Cập nhật `AlertBanner.jsx`:**
    *   Gọi API để lấy danh sách cảnh báo gần đây hoặc trạng thái cảnh báo (ví dụ: `GET /api/alerts/recent` hoặc `GET /api/devices/{deviceId}/alerts`).
    *   Hiển thị các cảnh báo này trong banner.
    *   Nếu hệ thống hỗ trợ WebSocket cho cảnh báo thời gian thực, hãy triển khai logic kết nối và lắng nghe sự kiện cảnh báo. Ngược lại, sử dụng polling định kỳ (cẩn thận với tần suất).

2.  **Hiển thị trạng thái email SOS (nếu cần):**
    *   Nếu frontend có chức năng kích hoạt hoặc theo dõi trạng thái email SOS, hãy gọi API tương ứng (ví dụ: `GET /api/alerts/sos-status`, `POST /api/alerts/sos-trigger`).
    *   Hiển thị trạng thái hoặc nút kích hoạt trên giao diện (nếu phù hợp).

3.  **Xử lý trạng thái tải dữ liệu và lỗi:**
    *   Hiển thị trạng thái "đang tải" khi chờ dữ liệu cảnh báo từ API.
    *   Xử lý và hiển thị lỗi nếu API gọi không thành công.

## Ghi chú

*   Endpoint API cảnh báo: `GET /api/alerts/recent`, `GET /api/devices/{deviceId}/alerts` (các endpoint cụ thể có thể cần được xác định thêm ở backend).
*   Nếu sử dụng WebSocket, cần quản lý kết nối cẩn thận (mở khi cần, đóng khi không còn cần).
*   Cân nhắc giữa việc sử dụng HTTP polling và WebSocket cho cập nhật thời gian thực dựa trên tần suất và hiệu suất.