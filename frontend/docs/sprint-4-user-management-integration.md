# Sprint 4: Tích hợp quản lý người dùng

## Mục tiêu

Tích hợp các chức năng quản lý người dùng (liệt kê, tạo, cập nhật, xóa) vào frontend bằng cách sử dụng các API backend tương ứng, dành riêng cho người dùng có vai trò ADMIN.

## Công việc cần thực hiện

1.  **Cập nhật `UserManagementPage.jsx`:**
    *   Gọi API để lấy danh sách người dùng (ví dụ: `GET /api/users`).
    *   Hiển thị danh sách người dùng trong một bảng.
    *   Triển khai form để tạo người dùng mới (ví dụ: `POST /api/users`).
    *   Triển khai form để cập nhật thông tin người dùng (ví dụ: `PUT /api/users/{id}`).
    *   Triển khai chức năng xóa người dùng (ví dụ: `DELETE /api/users/{id}`).
    *   Đảm bảo rằng chỉ người dùng có vai trò `ADMIN` mới có quyền truy cập và thực hiện các hành động này.

2.  **Xử lý trạng thái tải dữ liệu và lỗi:**
    *   Hiển thị trạng thái "đang tải" khi chờ dữ liệu từ API.
    *   Xử lý và hiển thị lỗi nếu API gọi không thành công (ví dụ: lỗi xác thực, lỗi dữ liệu đầu vào).

## Ghi chú

*   Endpoint API người dùng: `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`
*   Cần kiểm tra vai trò người dùng (role-based access) trên frontend để hiển thị hoặc ẩn các thành phần giao diện liên quan đến quản lý người dùng.