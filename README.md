# **Tài Liệu Phân Tích Dự Án: Hệ Thống Giám Sát Chất Lượng Nước**

## **1. Giới Thiệu Dự Án**

Dự án "Hệ thống giám sát chất lượng nước" là giải pháp phần mềm dùng để thu thập, phân tích và cảnh báo về các thông số chất lượng nước trong nhà máy. Hệ thống kết nối với các cảm biến ESP để theo dõi các chỉ số quan trọng, giúp quản lý và đảm bảo chất lượng nguồn nước đáp ứng tiêu chuẩn.

## **2. Mục Tiêu Dự Án**

Xây dựng hệ thống giám sát chất lượng nước toàn diện với khả năng:

- Thu thập dữ liệu thời gian thực từ cảm biến.
- Phân tích và cảnh báo khi vượt ngưỡng an toàn.
- Điều khiển thiết bị (van cấp nước) từ xa.
- Cung cấp giao diện trực quan cho người quản lý.

## **3. Yêu Cầu Chức Năng**

### **3.1. Dữ liệu cảm biến ESP**

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

### **3.2. Các tính năng chính**

1.  **Hệ thống cảnh báo hai cấp độ**

    - **Cảnh báo thông thường:** Tự động phát hiện khi các thông số vượt ngưỡng an toàn và hiển thị cảnh báo dạng _notification_ trực tiếp trên giao diện website sau khi người dùng đăng nhập.
    - **Cảnh báo khẩn cấp (SOS):** Khi các chỉ số vượt ngưỡng ở mức độ nghiêm trọng (ví dụ: vượt ngưỡng 20% trong 5 phút liên tục), hệ thống sẽ kích hoạt tính năng SOS, gửi cảnh báo khẩn cấp qua **email** hoặc **SMS** đến tài khoản admin.

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

## **4. Yêu Cầu Phi Chức Năng**

### **4.1. Yêu cầu giao diện (Frontend)**

- Giao diện trực quan, dễ sử dụng, tập trung vào các chức năng chính.
- Thiết kế chuyên nghiệp, hiện đại, thân thiện với người dùng.
- Tương thích tốt trên các trình duyệt web phổ biến.

### **4.2. Yêu cầu hệ thống**

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

## **5. Kiến Trúc Hệ Thống**

### **5.1. Mô hình kiến trúc**

Hệ thống được thiết kế theo kiến trúc client-server.
**Phương án triển khai cho dự án:** **Triển khai tách biệt**

- **Frontend:** Triển khai trên nền tảng miễn phí (Vercel, Netlify) để có URL công khai.
- **Backend:** Chạy local và sử dụng tunnel (ngrok) để tạo URL/IP cho phép frontend và thiết bị IoT truy cập.

### **5.2. RESTful API chi tiết**

Hệ thống sử dụng RESTful API với định dạng dữ liệu là JSON.

| Phương thức | Đường dẫn                  | Mô tả                                                                   | Yêu cầu xác thực |
| :---------- | :------------------------- | :---------------------------------------------------------------------- | :--------------- |
| **POST**    | `/api/auth/login`          | Đăng nhập người dùng                                                    | Không            |
| **POST**    | `/api/sensor-data`         | **[ESP sử dụng]** Gửi dữ liệu từ cảm biến                               | API Key          |
| **GET**     | `/api/sensor-data`         | Lấy dữ liệu cảm biến lịch sử (hỗ trợ lọc: `?startTime=...&endTime=...`) | JWT (Admin)      |
| **GET**     | `/api/users`               | Lấy danh sách người dùng                                                | JWT (Admin)      |
| **POST**    | `/api/users`               | Tạo người dùng mới                                                      | JWT (Admin)      |
| **PUT**     | `/api/users/{id}`          | Cập nhật thông tin người dùng                                           | JWT (Admin)      |
| **DELETE**  | `/api/users/{id}`          | Xóa người dùng                                                          | JWT (Admin)      |
| **PUT**     | `/api/controls/valve`      | Cập nhật trạng thái van nước (Body: `{ "status": "open" or "closed" }`) | JWT (Admin)      |
| **PUT**     | `/api/controls/collection` | Bật/tắt chế độ thu thập dữ liệu (Body: `{ "enabled": true or false }`)  | JWT (Admin)      |
| **PUT**     | `/api/controls/interval`   | Cập nhật thời gian gửi dữ liệu (Body: `{ "seconds": 30 }`)              | JWT (Admin)      |

### **5.3. Xác thực và Bảo mật API**

- **Luồng người dùng (User Flow):** Người dùng đăng nhập qua `/api/auth/login` để nhận về một JWT. Mọi request sau đó đến các API cần bảo vệ phải đính kèm token này trong Header (Authorization: Bearer <token>).
- **Luồng thiết bị (Device Flow):** Mỗi thiết bị ESP sẽ được cấu hình một API Key cố định. Khi gửi dữ liệu đến `/api/sensor-data`, nó phải đính kèm key này trong Header (ví dụ: `X-API-Key: <your_secret_key>`) để backend xác thực.

## **6. Kế Hoạch Triển Khai**

### **6.1. Giai đoạn 1: Phát triển Backend và Kết nối IoT**

- **Công việc:** Xây dựng các API cốt lõi (nhận dữ liệu, xác thực), thiết lập cơ sở dữ liệu, kết nối và nhận dữ liệu thành công từ cảm biến ESP.
- **Sản phẩm đầu ra:** Backend có thể nhận, lưu trữ dữ liệu từ ESP. API `/api/sensor-data` hoạt động ổn định.

### **6.2. Giai đoạn 2: Phát triển Giao diện và Chức năng cơ bản**

- **Công việc:** Thiết kế UI/UX, xây dựng giao diện đăng nhập, trang dashboard chính, tích hợp biểu đồ trực quan hóa dữ liệu, hiển thị cảnh báo trên giao diện.
- **Sản phẩm đầu ra:** Người dùng có thể đăng nhập, xem dữ liệu thời gian thực và lịch sử dưới dạng biểu đồ, nhận cảnh báo trên web.

### **6.3. Giai đoạn 3: Hoàn thiện và Tích hợp**

- **Công việc:** Hoàn thiện các chức năng điều khiển từ xa (van, thu thập dữ liệu), xây dựng trang quản lý người dùng, triển khai hệ thống cảnh báo SOS qua email, tối ưu và kiểm thử toàn bộ hệ thống.
- **Sản phẩm đầu ra:** Hệ thống hoàn chỉnh các tính năng theo yêu cầu, sẵn sàng cho việc demo và báo cáo.

## **7. Phụ Lục**

### **7.1. Thuật ngữ**

- **ESP**: Vi điều khiển có tích hợp Wi-Fi, dùng để thu thập dữ liệu từ cảm biến và gửi về server.
- **NTU**: Đơn vị đo độ đục (Nephelometric Turbidity Unit).
- **μS/cm**: Đơn vị đo độ dẫn điện (microsiemens per centimeter).
- **JWT**: JSON Web Token, một chuẩn mở để truyền tải thông tin an toàn giữa các bên dưới dạng đối tượng JSON.
