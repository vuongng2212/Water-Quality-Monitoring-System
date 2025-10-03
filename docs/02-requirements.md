# 1. Yêu Cầu Chức Năng

### 1.1. Dữ liệu cảm biến ESP

Hệ thống sẽ nhận dữ liệu từ cảm biến ESP với cấu trúc JSON sau. Mỗi bộ thiết bị sẽ được gán một `deviceId` duy nhất để xác định nó thuộc về nhà máy nào.

```json
{
    "deviceId": "string",
    "ph": "float",
    "temperature": "float",
    "doDuc": "float",
    "doDanDien": "float"
}
```

**Phạm vi tiêu chuẩn (cho mục đích dự án tốt nghiệp):**

- pH: [6.0, 9.0] (an toàn)
- Nhiệt độ: [20.0, 30.0] °C
- Độ đục: NTU
- Độ dẫn điện: μS/cm

### 1.2. Các tính năng chính

1.  **Quản lý Tổ chức và Phân quyền (Multi-tenancy)**

    Hệ thống được xây dựng theo mô hình đa người dùng (multi-tenant), trong đó mỗi **Nhà máy (Factory)** là một "khách hàng" (tenant) riêng biệt.

    - **Định danh thiết bị:** Mỗi bộ thiết bị IoT (ESP) sẽ có một `deviceId` duy nhất. Khi thiết bị được lắp đặt cho một Nhà máy, `deviceId` này sẽ được đăng ký và liên kết với Nhà máy đó trên hệ thống.
    - **Phân quyền theo vai trò:** Hệ thống sẽ có các vai trò người dùng sau:
        - **`ADMIN` (Quản lý Nhà máy):**
            - Là tài khoản quản trị cao nhất của một Nhà máy.
            - Có toàn quyền trên tất cả dữ liệu và thiết bị thuộc Nhà máy của mình.
            - Quản lý vòng đời tài khoản nhân viên (CRUD cho `EMPLOYEE`).
            - Phân công cho `EMPLOYEE` quyền quản lý trên một hoặc nhiều thiết bị IoT cụ thể.
        - **`EMPLOYEE` (Nhân viên Vận hành):**
            - Do `ADMIN` của Nhà máy tạo ra và quản lý.
            - Chỉ có quyền truy cập, xem dữ liệu, và điều khiển các thiết bị mà họ được phân công.

2.  **Hệ thống cảnh báo hai cấp độ**

    - **Cảnh báo thông thường:** Tự động phát hiện khi các thông số vượt ngưỡng an toàn và hiển thị cảnh báo dạng _notification_ trên giao diện. Cảnh báo chỉ hiển thị cho người dùng thuộc Nhà máy sở hữu thiết bị đó.
    - **Cảnh báo khẩn cấp (SOS):** Hệ thống sẽ gửi cảnh báo khẩn cấp qua **email** đến tài khoản `ADMIN` của Nhà máy khi một chỉ số từ thiết bị của họ vượt ngưỡng nghiêm trọng trong một khoảng thời gian liên tục.
        - **Thuật toán:** Backend sẽ chạy một tác vụ kiểm tra định kỳ (ví dụ: mỗi phút một lần).
            1.  **Định nghĩa Ngưỡng Nghiêm Trọng:** Các ngưỡng này có thể được cấu hình cho từng Nhà máy hoặc áp dụng chung.
            2.  **Quét dữ liệu:** Tác vụ sẽ lấy dữ liệu cảm biến trong **5 phút** gần nhất, phân nhóm theo từng thiết bị.
            3.  **Kiểm tra điều kiện:** Nếu **tất cả** các giá trị của một chỉ số (từ một thiết bị) trong khoảng thời gian trên đều nằm ngoài ngưỡng nghiêm trọng, hệ thống sẽ coi đây là một sự kiện SOS.
            4.  **Gửi cảnh báo & Áp dụng thời gian nghỉ:** Nếu một sự kiện SOS xảy ra, hệ thống sẽ gửi email đến các `ADMIN` của Nhà máy tương ứng và áp dụng "thời gian nghỉ" (ví dụ: 30 phút) để tránh spam.

3.  **Điều khiển thiết bị từ xa**

    - Cho phép người dùng (`ADMIN` hoặc `EMPLOYEE` đã được phân quyền) đóng/mở van cấp nước hoặc bật/tắt chế độ thu thập dữ liệu của một thiết bị cụ thể.
    - `ADMIN` có thể điều khiển mọi thiết bị của nhà máy.
    - `EMPLOYEE` chỉ có thể điều khiển các thiết bị được phân công.

4.  **Cấu hình thiết bị**

    - Cho phép `ADMIN` thiết lập khoảng thời gian (tính bằng giây) mà cảm biến sẽ gửi dữ liệu về máy chủ cho từng thiết bị.

5.  **Trực quan hóa dữ liệu**

    - Hiển thị dữ liệu dưới dạng biểu đồ đường (line chart) và bảng biểu trực quan.
    - **Phạm vi dữ liệu:** Dữ liệu hiển thị cho người dùng sẽ được lọc tự động dựa trên quyền hạn và Nhà máy của họ.
        - `ADMIN` thấy tất cả dữ liệu của Nhà máy.
        - `EMPLOYEE` chỉ thấy dữ liệu từ các thiết bị được phân công.
    - Hỗ trợ lọc dữ liệu lịch sử theo khoảng thời gian tùy chọn (ngày, tuần, tháng).

# 2. Yêu Cầu Phi Chức Năng

### 2.1. Yêu cầu giao diện (Frontend)

- Giao diện trực quan, dễ sử dụng, tập trung vào các chức năng chính.
- Thiết kế chuyên nghiệp, hiện đại, thân thiện với người dùng.
- Tương thích tốt trên các trình duyệt web phổ biến.

### 2.2. Yêu cầu hệ thống

- **Hiệu năng (Performance):**
  - Hệ thống có khả năng xử lý ít nhất 10 bản tin/phút từ mỗi cụm cảm biến.
  - Thời gian phản hồi của các API endpoint chính (lấy dữ liệu, điều khiển) phải dưới 500ms.
  - Giao diện biểu đồ phải tải và hiển thị dữ liệu lịch sử trong vòng 3 giây.
- **Độ tin cậy (Reliability):**
  - Backend đảm bảo hoạt động ổn định 24/7.
  - Cần có cơ chế xử lý khi mất kết nối với cảm biến (ví dụ: hiển thị trạng thái "offline" trên giao diện).
- **Bảo mật (Security):**
  - **Cách ly dữ liệu (Data Isolation):** Dữ liệu của mỗi Nhà máy (tenant) phải được cách ly hoàn toàn và an toàn với các Nhà máy khác. Một người dùng từ nhà máy A không bao giờ được phép thấy dữ liệu của nhà máy B.
  - Toàn bộ giao tiếp giữa client và server phải được mã hóa qua **HTTPS**.
  - API phải được bảo vệ. Người dùng phải đăng nhập để truy cập các tính năng (sử dụng **JWT**).
  - Giao tiếp giữa ESP và backend phải dùng một **API Key** (liên kết với `deviceId`) để xác thực.
  - Mật khẩu người dùng trong cơ sở dữ liệu phải được **băm (hashing)** an toàn.