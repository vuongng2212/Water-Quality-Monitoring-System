# Kế hoạch Ngày 6: Hoàn thiện API & Phân quyền Employee

**Mục tiêu:** Hoàn thiện các luồng nghiệp vụ còn lại, đặc biệt là việc phân quyền chi tiết cho vai trò `EMPLOYEE`. Kết thúc ngày, hệ thống sẽ phân biệt rõ ràng quyền hạn giữa `ADMIN` và `EMPLOYEE`, đảm bảo `EMPLOYEE` chỉ có thể truy cập các tài nguyên được phép.

---

### Nhiệm vụ chính:

1.  **Tạo API Phân quyền Thiết bị cho `EMPLOYEE`:**
    *   Trong `DeviceController`, tạo một endpoint mới: `POST /{deviceId}/assign`.
    *   **Bảo mật:** Endpoint này chỉ dành cho `ADMIN` (`@PreAuthorize("hasRole('ADMIN')")`).
    *   **Request Body:** Nhận một đối tượng chứa `userId` của `EMPLOYEE` cần gán quyền.
    *   **Logic:**
        *   Kiểm tra xem cả `Device` (với `deviceId`) và `User` (với `userId`) có tồn tại và cùng thuộc `factory_id` của `ADMIN` đang thực hiện hay không.
        *   Kiểm tra xem `User` được gán có vai trò là `EMPLOYEE` không.
        *   Tạo một bản ghi mới trong bảng `employee_device_access` để lưu lại mối quan hệ này.
    *   Tương tự, tạo endpoint `POST /{deviceId}/unassign` để thu hồi quyền.

2.  **Tạo `PermissionService`:**
    *   Tạo một service mới có tên `PermissionService.java`.
    *   Service này sẽ chứa các logic kiểm tra quyền hạn phức tạp để các controller khác có thể tái sử dụng.
    *   **Tạo phương thức `canAccessDevice(UserDetails userDetails, Long deviceId)`:**
        *   **Logic:**
            *   Lấy thông tin `User` từ `userDetails`.
            *   Nếu `user.getRole()` là `ADMIN`, truy vấn `DeviceRepository` để kiểm tra xem `Device` có cùng `factory_id` với `ADMIN` không. Nếu có, trả về `true`.
            *   Nếu `user.getRole()` là `EMPLOYEE`, truy vấn bảng `employee_device_access` để kiểm tra xem có bản ghi nào khớp `userId` và `deviceId` không. Nếu có, trả về `true`.
            *   Trong mọi trường hợp khác, trả về `false`.

3.  **Áp dụng `PermissionService` vào các API:**
    *   **`SensorDataController`:**
        *   Trong endpoint `GET /history/{deviceId}`:
            *   Trước khi thực hiện truy vấn, gọi `permissionService.canAccessDevice(currentUser, deviceId)`.
            *   Nếu trả về `false`, ném ra một ngoại lệ `AccessDeniedException` (sẽ trả về lỗi 403 Forbidden).
    *   **`DeviceController`:**
        *   Trong endpoint `GET /{id}`:
            *   Mặc dù đã có Hibernate Filter, việc thêm một lớp kiểm tra tường minh ở đây (sử dụng `PermissionService`) sẽ giúp logic rõ ràng hơn và bảo vệ sâu hơn. Đây là một ví dụ về "Defense in Depth".

4.  **Hoàn thiện API lấy danh sách thiết bị cho `EMPLOYEE`:**
    *   Trong `DeviceController`, sửa đổi endpoint `GET /`:
    *   **Logic:**
        *   Lấy thông tin người dùng hiện tại từ `SecurityContextHolder`.
        *   Nếu là `ADMIN`, trả về tất cả thiết bị trong nhà máy (logic cũ vẫn đúng nhờ Hibernate Filter).
        *   Nếu là `EMPLOYEE`, truy vấn bảng `employee_device_access` để lấy danh sách các `deviceId` mà `EMPLOYEE` này được gán quyền, sau đó truy vấn `DeviceRepository` để lấy thông tin chi tiết của các thiết bị đó.

5.  **Kiểm tra và Rà soát:**
    *   Thực hiện kiểm tra thủ công với hai tài khoản: một `ADMIN` và một `EMPLOYEE`.
    *   **Kịch bản kiểm tra:**
        *   `ADMIN` tạo user `employee_1` và 2 thiết bị `device_A`, `device_B`.
        *   `ADMIN` gán quyền `device_A` cho `employee_1`.
        *   Đăng nhập bằng tài khoản `employee_1`.
        *   `employee_1` gọi API lấy danh sách thiết bị, phải chỉ nhận được `device_A`.
        *   `employee_1` cố gắng lấy lịch sử dữ liệu của `device_B`, phải nhận lỗi 403 Forbidden.
        *   `employee_1` lấy lịch sử của `device_A`, phải thành công.

### Kết quả cần đạt:
*   `ADMIN` có thể gán và thu hồi quyền truy cập thiết bị cho `EMPLOYEE`.
*   `EMPLOYEE` chỉ có thể xem thông tin và dữ liệu của các thiết bị mà họ được phân công.
*   Logic phân quyền được đóng gói gọn gàng trong `PermissionService` để dễ dàng bảo trì và tái sử dụng.
*   Hệ thống phân biệt rõ ràng và bảo vệ an toàn quyền hạn của hai vai trò người dùng.