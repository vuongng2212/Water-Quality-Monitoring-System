# Sprint 1: Tích hợp xác thực

## Mục tiêu

Thay thế cơ chế đăng nhập và đăng xuất giả lập hiện tại bằng các cuộc gọi API thực tế đến backend để xác thực người dùng và quản lý phiên làm việc.

## Công việc cần thực hiện

1.  **Cập nhật `AuthContext.jsx`:**
    *   Thêm logic để gọi API `/auth/login` khi hàm `login()` được gọi.
    *   Xử lý phản hồi từ API (JWT token, thông tin người dùng).
    *   Lưu trữ token JWT một cách an toàn vào `localStorage` hoặc `sessionStorage`.
    *   Cập nhật hàm `logout()` để xóa token khỏi bộ nhớ và bộ nhớ cục bộ.
    *   Thêm logic để kiểm tra token khi ứng dụng tải để duy trì phiên đăng nhập (tùy chọn).

2.  **Cập nhật `LoginPage.jsx`:**
    *   Thay thế `mockUserData` và logic đăng nhập giả lập bằng việc gọi hàm `login()` từ `AuthContext`.
    *   Truyền thông tin đăng nhập (username, password) từ form đến hàm `login()`.
    *   Xử lý lỗi đăng nhập (ví dụ: sai tên đăng nhập/mật khẩu).

3.  **Triển khai bộ chặn (Interceptor) HTTP:**
    *   Tạo một bộ chặn HTTP (sử dụng `axios` hoặc `fetch`) để tự động thêm header `Authorization: Bearer <token>` vào tất cả các yêu cầu API sau khi người dùng đăng nhập.

## Ghi chú

*   Endpoint API đăng nhập: `POST /api/auth/login`
*   Đảm bảo xử lý lỗi và trạng thái người dùng không xác thực một cách phù hợp trên các trang yêu cầu xác thực.