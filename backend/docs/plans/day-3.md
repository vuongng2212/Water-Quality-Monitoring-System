# Kế hoạch Ngày 3: API Quản lý Người dùng (Admin)

**Mục tiêu:** Xây dựng bộ API đầy đủ để người dùng có vai trò `ADMIN` có thể quản lý các tài khoản người dùng khác trong cùng nhà máy. Đây là bước đầu tiên triển khai logic phân quyền dựa trên vai trò.

---

### Nhiệm vụ chính:

1.  **Tạo `JwtAuthenticationFilter`:**
    *   Tạo một lớp `JwtAuthenticationFilter.java` kế thừa từ `OncePerRequestFilter`.
    *   **Logic:**
        *   Trong `doFilterInternal`, trích xuất `Authorization` header từ request.
        *   Kiểm tra xem header có tồn tại và bắt đầu bằng "Bearer " không.
        *   Nếu có, lấy chuỗi JWT, gọi `jwtService.extractUsername()` và `jwtService.isTokenValid()`.
        *   Nếu token hợp lệ, lấy `UserDetails` từ `userDetailsService`.
        *   Tạo một `UsernamePasswordAuthenticationToken` mới, điền thông tin chi tiết (roles, v.v.) và đặt nó vào `SecurityContextHolder`. Điều này sẽ cho Spring Security biết rằng người dùng đã được xác thực cho request này.
    *   **Tích hợp:** Thêm bộ lọc này vào `SecurityFilterChain` (trong `SecurityConfig`), đặt nó chạy *trước* bộ lọc `UsernamePasswordAuthenticationFilter`.

2.  **Tạo `UserController`:**
    *   Tạo một controller mới `UserController.java` với tiền tố `/api/users`.
    *   Sử dụng annotation `@PreAuthorize("hasRole('ADMIN')")` ở cấp độ lớp (class-level) để đảm bảo chỉ `ADMIN` mới có thể gọi các API này. Để sử dụng được, cần thêm `@EnableMethodSecurity` vào `SecurityConfig`.

3.  **Triển khai các Endpoint CRUD:**
    *   **`POST /` - Tạo người dùng mới:**
        *   Nhận thông tin người dùng mới từ request body.
        *   **Quan trọng:** Lấy `factory_id` từ JWT của người dùng `ADMIN` đang thực hiện request. Gán `factory_id` này cho người dùng mới để đảm bảo họ thuộc cùng một nhà máy.
        *   Mã hóa mật khẩu trước khi lưu vào CSDL.
        *   Lưu người dùng mới vào `UserRepository`.
    *   **`GET /` - Lấy danh sách người dùng:**
        *   Lấy `factory_id` từ JWT của `ADMIN`.
        *   Truy vấn `UserRepository` để tìm tất cả người dùng có cùng `factory_id`.
        *   Trả về danh sách người dùng (nhớ loại bỏ trường mật khẩu).
    *   **`GET /{id}` - Lấy thông tin một người dùng:**
        *   Lấy `factory_id` từ JWT.
        *   Truy vấn người dùng theo `id` VÀ `factory_id` để đảm bảo `ADMIN` không thể xem người dùng của nhà máy khác.
    *   **`PUT /{id}` - Cập nhật người dùng:**
        *   Tương tự, đảm bảo `ADMIN` chỉ có thể cập nhật người dùng trong nhà máy của mình.
    *   **`DELETE /{id}` - Xóa người dùng:**
        *   Tương tự, đảm bảo `ADMIN` chỉ có thể xóa người dùng trong nhà máy của mình.

4.  **Tạo DTOs (Data Transfer Objects):**
    *   Tạo các lớp như `UserDto`, `CreateUserRequest`, `UpdateUserRequest` để truyền dữ liệu giữa client và server, tránh làm lộ các thuộc tính không cần thiết của Entity.

### Kết quả cần đạt:
*   Một `ADMIN` sau khi đăng nhập có thể gọi các API trong `UserController`.
*   Một `EMPLOYEE` hoặc người dùng chưa đăng nhập khi cố gắng gọi các API này sẽ nhận lỗi 403 (Forbidden).
*   `ADMIN` chỉ có thể tạo, xem, sửa, xóa các người dùng thuộc cùng `factory_id` với mình.
*   Logic xác thực JWT hoạt động trên mọi request yêu cầu xác thực.