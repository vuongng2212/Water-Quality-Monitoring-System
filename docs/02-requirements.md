# 1. Yêu Cầu Chức Năng

### 3.1. Dữ liệu cảm biến ESP

Hệ thống sẽ nhận dữ liệu từ cảm biến ESP với cấu trúc JSON sau:

```json
{
    "ph": float,
    "temperature": float,
    "doDuc": float,
    "doDanDien": float
}
```

**Phạm vi tiêu chuẩn (cho mục đích dự án tốt nghiệp):**

- pH: [6.0, 9.0] (an toàn)
- Nhiệt độ: [20.0, 30.0] °C
- Độ đục: NTU
- Độ dẫn điện: μS/cm

### 3.2. Các tính năng chính

1.  **Hệ thống cảnh báo hai cấp độ**

    - **Cảnh báo thông thường:** Tự động phát hiện khi các thông số vượt ngưỡng an toàn và hiển thị cảnh báo dạng _notification_ trực tiếp trên giao diện website sau khi người dùng đăng nhập.
    - **Cảnh báo khẩn cấp (SOS):** Hệ thống sẽ kích hoạt tính năng SOS và gửi cảnh báo khẩn cấp qua **email** đến tài khoản admin khi phát hiện một chỉ số vượt ngưỡng nghiêm trọng trong một khoảng thời gian liên tục.
        - **Thuật toán:** Backend sẽ chạy một tác vụ kiểm tra định kỳ (ví dụ: mỗi phút một lần).
            1.  **Định nghĩa Ngưỡng Nghiêm Trọng:** Các ngưỡng này được cấu hình riêng (ví dụ: pH < 5.5 hoặc > 9.5).
            2.  **Quét dữ liệu:** Tác vụ sẽ lấy tất cả dữ liệu cảm biến trong **5 phút** gần nhất.
            3.  **Kiểm tra điều kiện:** Nếu **tất cả** các giá trị của một chỉ số trong khoảng thời gian trên đều nằm ngoài ngưỡng nghiêm trọng, hệ thống sẽ coi đây là một sự kiện SOS.
            4.  **Gửi cảnh báo & Áp dụng thời gian nghỉ:** Nếu một sự kiện SOS xảy ra và chưa có cảnh báo nào được gửi trong "thời gian nghỉ" (ví dụ: 30 phút), hệ thống sẽ gửi email và ghi nhận lại thời điểm này để tránh spam.

2.  **Điều khiển van cấp nước**

    - Cho phép người dùng có quyền đóng/mở van cấp nước từ xa qua giao diện.

3.  **Quản lý thu thập dữ liệu**

    - Cung cấp chức năng bật/tắt việc thu thập dữ liệu từ cảm biến.

4.  **Tùy chỉnh thời gian gửi dữ liệu**

    - Cho phép người dùng thiết lập khoảng thời gian (tính bằng giây) mà cảm biến sẽ gửi dữ liệu về máy chủ.

5.  **Trực quan hóa dữ liệu**

    - Hiển thị dữ liệu dưới dạng biểu đồ đường (line chart) và bảng biểu trực quan.
    - Hỗ trợ xem dữ liệu theo thời gian thực và lọc dữ liệu lịch sử theo khoảng thời gian tùy chọn (ngày, tuần, tháng).

6.  **Quản lý người dùng**
    - Trong giai đoạn đầu, hệ thống chỉ yêu cầu một vai trò **Admin (cấp 1)** có toàn quyền truy cập và chỉnh sửa tất cả tính năng.
    - Hỗ trợ CRUD (Create, Read, Update, Delete) cho người dùng.
    - _Lưu ý: Các vai trò khác như Quản lý (Manager) hay Vận hành (Operator) có thể được phát triển trong các phiên bản sau._

# 2. Yêu Cầu Phi Chức Năng

### 4.1. Yêu cầu giao diện (Frontend)

- Giao diện trực quan, dễ sử dụng, tập trung vào các chức năng chính.
- Thiết kế chuyên nghiệp, hiện đại, thân thiện với người dùng.
- Tương thích tốt trên các trình duyệt web phổ biến.

### 4.2. Yêu cầu hệ thống

- **Hiệu năng (Performance):**
  - Hệ thống có khả năng xử lý ít nhất 10 bản tin/phút từ mỗi cụm cảm biến.
  - Thời gian phản hồi của các API endpoint chính (lấy dữ liệu, điều khiển) phải dưới 500ms.
  - Giao diện biểu đồ phải tải và hiển thị dữ liệu lịch sử trong vòng 3 giây.
- **Độ tin cậy (Reliability):**
  - Backend đảm bảo hoạt động ổn định 24/7.
  - Cần có cơ chế xử lý khi mất kết nối với cảm biến (ví dụ: hiển thị trạng thái "offline" trên giao diện). Dữ liệu trong thời gian mất kết nối sẽ không được ghi nhận.
- **Bảo mật (Security):**
  - Toàn bộ giao tiếp giữa client và server phải được mã hóa qua **HTTPS**.
  - API phải được bảo vệ. Người dùng phải đăng nhập để truy cập các tính năng (sử dụng **JWT - JSON Web Token**).
  - Giao tiếp giữa ESP và backend phải dùng một **API Key** bí mật để xác thực.
  - Mật khẩu người dùng trong cơ sở dữ liệu phải được **băm (hashing)** an toàn (sử dụng bcrypt hoặc argon2).