# 1. RESTful API chi tiết

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

# 2. Xác thực và Bảo mật API

- **Luồng người dùng (User Flow):** Người dùng đăng nhập qua `/api/auth/login` để nhận về một JWT. Mọi request sau đó đến các API cần bảo vệ phải đính kèm token này trong Header (Authorization: Bearer <token>).
- **Luồng thiết bị (Device Flow):** Mỗi thiết bị ESP sẽ được cấu hình một API Key cố định. Khi gửi dữ liệu đến `/api/sensor-data`, nó phải đính kèm key này trong Header (ví dụ: `X-API-Key: <your_secret_key>`) để backend xác thực.
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

-   **timestamp**: Thời gian xảy ra lỗi.
-   **status**: Mã trạng thái HTTP.
-   **error**: Mô tả ngắn gọn của mã trạng thái (ví dụ: "Bad Request", "Unauthorized").
-   **message**: Một câu thông báo lỗi rõ ràng, có thể hiển thị trực tiếp cho người dùng.
-   **path**: Đường dẫn API đã gây ra lỗi.

# 4. Xác thực Dữ liệu Đầu vào (Data Validation)

Để đảm bảo tính toàn vẹn của dữ liệu, tất cả dữ liệu được gửi từ client (cả Frontend và ESP) đến API đều phải được xác thực ở phía backend.

-   **Công nghệ:** Sử dụng `spring-boot-starter-validation` với các annotation như `@Valid`, `@NotNull`, `@Size`, `@Email`, `@Min`, `@Max`.
-   **Nguyên tắc:**
    -   Không bao giờ tin tưởng dữ liệu từ client.
    -   Tất cả các trường trong DTO (Data Transfer Object) nhận từ request body phải được xác thực.
    -   Nếu dữ liệu không hợp lệ, API sẽ trả về lỗi `400 Bad Request` với cấu trúc như đã định nghĩa ở trên, kèm theo thông báo chi tiết về các trường bị lỗi.

**Ví dụ:** Khi tạo người dùng mới, DTO sẽ có dạng:
```java
public class CreateUserDto {
    @NotNull
    @Size(min = 3, max = 50)
    private String username;

    @NotNull
    @Email
    private String email;

    // ... getters and setters
}
```