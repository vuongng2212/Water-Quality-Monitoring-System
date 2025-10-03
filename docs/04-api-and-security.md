# 1. RESTful API chi tiết

Hệ thống sử dụng RESTful API với định dạng JSON. Tất cả các API yêu cầu xác thực JWT sẽ tự động lọc dữ liệu dựa trên `factory_id` được đính kèm trong token của người dùng, đảm bảo người dùng chỉ có thể truy cập dữ liệu thuộc nhà máy của họ.

### 1.1. API Xác thực (Authentication)

| Phương thức | Đường dẫn          | Mô tả                | Yêu cầu xác thực |
| :---------- | :----------------- | :------------------- | :--------------- |
| **POST**    | `/api/auth/login`  | Đăng nhập người dùng | Không            |

### 1.2. API Dữ liệu Cảm biến (Sensor Data)

| Phương thức | Đường dẫn              | Mô tả                                                                   | Yêu cầu xác thực         |
| :---------- | :--------------------- | :---------------------------------------------------------------------- | :----------------------- |
| **POST**    | `/api/sensor-data`     | **[ESP sử dụng]** Gửi dữ liệu từ cảm biến                               | API Key (của thiết bị)   |
| **GET**     | `/api/sensor-data`     | Lấy dữ liệu cảm biến lịch sử (hỗ trợ lọc theo thời gian và `deviceId`)   | JWT (`ADMIN`, `EMPLOYEE`)|

### 1.3. API Quản lý Người dùng (User Management)

| Phương thức | Đường dẫn              | Mô tả                                                                   | Yêu cầu xác thực         |
| :---------- | :--------------------- | :---------------------------------------------------------------------- | :----------------------- |
| **GET**     | `/api/users`           | Lấy danh sách người dùng trong nhà máy của mình.                         | JWT (`ADMIN`)            |
| **POST**    | `/api/users`           | Tạo người dùng `EMPLOYEE` mới trong nhà máy.                             | JWT (`ADMIN`)            |
| **PUT**     | `/api/users/{id}`      | Cập nhật thông tin người dùng `EMPLOYEE`.                               | JWT (`ADMIN`)            |
| **DELETE**  | `/api/users/{id}`      | Xóa người dùng `EMPLOYEE`.                                              | JWT (`ADMIN`)            |

### 1.4. API Quản lý Thiết bị (Device Management)

| Phương thức | Đường dẫn              | Mô tả                                                                   | Yêu cầu xác thực         |
| :---------- | :--------------------- | :---------------------------------------------------------------------- | :----------------------- |
| **GET**     | `/api/devices`         | Lấy danh sách thiết bị thuộc nhà máy.                                   | JWT (`ADMIN`)            |
| **POST**    | `/api/devices`         | Đăng ký một thiết bị mới cho nhà máy (hệ thống tự tạo API Key).          | JWT (`ADMIN`)            |
| **DELETE**  | `/api/devices/{id}`    | Xóa một thiết bị khỏi nhà máy.                                          | JWT (`ADMIN`)            |
| **PUT**     | `/api/devices/{id}/assign` | Gán quyền truy cập một thiết bị cho một `EMPLOYEE`.                      | JWT (`ADMIN`)            |
| **PUT**     | `/api/devices/{id}/unassign` | Thu hồi quyền truy cập một thiết bị từ một `EMPLOYEE`.                 | JWT (`ADMIN`)            |

### 1.5. API Điều khiển (Controls)

| Phương thức | Đường dẫn                          | Mô tả                                                                   | Yêu cầu xác thực         |
| :---------- | :--------------------------------- | :---------------------------------------------------------------------- | :----------------------- |
| **PUT**     | `/api/controls/devices/{id}/valve`      | Cập nhật trạng thái van (Body: `{ "status": "open" \| "closed" }`)     | JWT (`ADMIN`, `EMPLOYEE`)|
| **PUT**     | `/api/controls/devices/{id}/collection` | Bật/tắt chế độ thu thập (Body: `{ "enabled": true \| false }`)          | JWT (`ADMIN`, `EMPLOYEE`)|
| **PUT**     | `/api/controls/devices/{id}/interval`   | Cập nhật chu kỳ gửi dữ liệu (Body: `{ "seconds": 30 }`)                 | JWT (`ADMIN`)            |

# 2. Xác thực và Bảo mật API

- **Luồng người dùng (User Flow):** Người dùng đăng nhập qua `/api/auth/login` để nhận về một JWT. Token này chứa thông tin `userId`, `role`, và quan trọng nhất là `factory_id`. Mọi request sau đó đến các API cần bảo vệ phải đính kèm token này trong Header (`Authorization: Bearer <token>`). Backend sẽ dựa vào `factory_id` để truy vấn dữ liệu và `role` để kiểm tra quyền hạn.
- **Luồng thiết bị (Device Flow):** Mỗi thiết bị ESP sẽ được cấp một API Key duy nhất khi đăng ký vào hệ thống. Khi gửi dữ liệu đến `/api/sensor-data`, nó phải đính kèm key này trong Header (ví dụ: `X-API-Key: <your_secret_key>`) để backend xác thực và xác định dữ liệu thuộc về nhà máy nào.

# 3. Chiến Lược Xử Lý Lỗi (Error Handling)

Hệ thống sẽ trả về các phản hồi lỗi nhất quán ở định dạng JSON để giúp phía Frontend dễ dàng xử lý và hiển thị thông báo cho người dùng.

Tất cả các lỗi (ví dụ: 400, 401, 403, 404, 500) sẽ tuân theo cấu trúc sau:

```json
{
  "timestamp": "2023-10-27T10:30:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy người dùng với ID: 123",
  "path": "/api/users/123"
}
```

# 4. Xác thực Dữ liệu Đầu vào (Data Validation)

Để đảm bảo tính toàn vẹn của dữ liệu, tất cả dữ liệu được gửi từ client (cả Frontend và ESP) đến API đều phải được xác thực ở phía backend.

- **Công nghệ:** Sử dụng `spring-boot-starter-validation` với các annotation như `@Valid`, `@NotNull`, `@Size`, `@Email`, `@Min`, `@Max`.
- **Nguyên tắc:**
    - Không bao giờ tin tưởng dữ liệu từ client.
    - Tất cả các trường trong DTO (Data Transfer Object) nhận từ request body phải được xác thực.
    - Nếu dữ liệu không hợp lệ, API sẽ trả về lỗi `400 Bad Request` với cấu trúc như đã định nghĩa ở trên, kèm theo thông báo chi tiết về các trường bị lỗi.