# Kế hoạch Ngày 2: Bảo mật Cơ bản & JWT

**Mục tiêu:** Xây dựng lớp bảo mật đầu tiên cho ứng dụng. Kết thúc ngày, hệ thống sẽ có một API đăng nhập an toàn, trả về JSON Web Token (JWT) chứa các thông tin cần thiết để xác thực và phân quyền.

---

### Nhiệm vụ chính:

1.  **Cấu hình Spring Security:**
    *   Tạo một lớp `SecurityConfig.java`.
    *   Sử dụng annotation `@Configuration` và `@EnableWebSecurity`.
    *   Tạo một `SecurityFilterChain` bean để định nghĩa các quy tắc bảo mật:
        *   Vô hiệu hóa CSRF (vì chúng ta dùng JWT).
        *   Cấu hình session management là `STATELESS`.
        *   Cho phép tất cả các request đến `/api/auth/**` (đăng nhập, đăng ký).
        *   Yêu cầu tất cả các request khác phải được xác thực (`.anyRequest().authenticated()`).
    *   Tạo một `PasswordEncoder` bean (sử dụng `BCryptPasswordEncoder`) để mã hóa mật khẩu.

2.  **Tạo `JwtService`:**
    *   Tạo một service mới có tên `JwtService.java`.
    *   **Nhiệm vụ:**
        *   Tạo hàm `generateToken(UserDetails userDetails, Long factoryId, String role)`: Nhận thông tin người dùng, `factoryId` và `role` để tạo JWT. Thêm các thông tin này vào "claims" của token.
        *   Tạo hàm `extractUsername(String token)`: Giải mã token để lấy username.
        *   Tạo hàm `isTokenValid(String token, UserDetails userDetails)`: Kiểm tra xem token có hợp lệ và khớp với người dùng không.
        *   Tạo các hàm private để xử lý việc ký và giải mã token từ `jwt.secret`.

3.  **Triển khai `UserDetailsService`:**
    *   Tạo một service `UserDetailsServiceImpl.java` implement `UserDetailsService`.
    *   Ghi đè phương thức `loadUserByUsername(String username)`. Trong phương thức này:
        *   Truy vấn `UserRepository` để tìm người dùng theo `username`.
        *   Nếu không tìm thấy, ném ra `UsernameNotFoundException`.
        *   Nếu tìm thấy, chuyển đổi đối tượng `User` (từ model) thành đối tượng `UserDetails` của Spring Security.

4.  **Tạo `AuthController`:**
    *   Tạo một controller mới có tên `AuthController.java` với tiền tố `/api/auth`.
    *   Tạo một endpoint `POST /login`:
        *   Nhận `LoginRequest` (gồm `username` và `password`) từ body.
        *   Sử dụng `AuthenticationManager` của Spring Security để xác thực thông tin đăng nhập.
        *   Nếu xác thực thành công, truy vấn lại `User` để lấy `factoryId` và `role`.
        *   Gọi `jwtService.generateToken(...)` để tạo token.
        *   Trả về `LoginResponse` (chứa JWT) cho client.

### Kết quả cần đạt:
*   Endpoint `/api/auth/login` hoạt động.
*   Khi gửi `username` và `password` hợp lệ, API trả về một JWT.
*   Khi truy cập các endpoint khác (ví dụ `/api/test`) mà không có JWT hợp lệ, hệ thống trả về lỗi 403 (Forbidden) hoặc 401 (Unauthorized).
*   Mật khẩu người dùng được lưu trong CSDL dưới dạng đã mã hóa.