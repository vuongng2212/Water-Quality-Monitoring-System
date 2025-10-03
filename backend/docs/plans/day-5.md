# Kế hoạch Ngày 5: Cốt lõi Multi-Tenancy (Cách ly Dữ liệu)

**Mục tiêu:** Triển khai cơ chế cách ly dữ liệu (Data Isolation) một cách tự động và triệt để. Đây là ngày quan trọng và phức tạp nhất, quyết định sự thành công của toàn bộ kiến trúc multi-tenant. Kết thúc ngày, mọi truy vấn dữ liệu từ các service sẽ tự động được lọc theo `factory_id` của người dùng đang đăng nhập mà không cần can thiệp thủ công ở từng hàm.

---

### Nhiệm vụ chính:

1.  **Trích xuất `factory_id` từ JWT:**
    *   Trong `JwtAuthenticationFilter`, sau khi xác thực token thành công, không chỉ đặt `Authentication` vào `SecurityContextHolder` mà còn phải trích xuất `factory_id` từ claims của JWT.

2.  **Lưu `factory_id` vào một Context riêng:**
    *   Tạo một lớp `TenantContext.java`.
    *   Lớp này sẽ sử dụng `ThreadLocal<Long>` để lưu trữ `factory_id` cho mỗi luồng request.
    *   **Logic:**
        *   `public static void setTenantId(Long tenantId)`
        *   `public static Long getTenantId()`
        *   `public static void clear()`
    *   Cập nhật `JwtAuthenticationFilter`: Sau khi lấy được `factory_id`, gọi `TenantContext.setTenantId(factoryId)`.
    *   **Quan trọng:** Sử dụng một `try-finally` block trong `doFilterInternal` để đảm bảo `TenantContext.clear()` luôn được gọi sau khi request kết thúc, tránh rò rỉ context giữa các request.

3.  **Sử dụng Hibernate Filters để Cách ly Dữ liệu:**
    *   Đây là phương pháp mạnh mẽ và minh bạch nhất.
    *   **Bước 1: Thêm Annotation vào các Entity:**
        *   Thêm annotation `@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))` vào một lớp cấu hình chung hoặc một Entity bất kỳ (ví dụ `BaseEntity`).
        *   Thêm annotation `@Filter(name = "tenantFilter", condition = "factory_id = :tenantId")` vào **TẤT CẢ** các Entity cần cách ly dữ liệu (`User`, `Device`, `SensorData`, v.v.). `factory_id` là tên cột trong CSDL.
    *   **Bước 2: Kích hoạt Filter một cách tự động:**
        *   Tạo một `TenantFilterAspect.java` (sử dụng Spring AOP).
        *   Sử dụng `@Aspect` và `@Component`.
        *   Tạo một advice `@Before("execution(* com.example.waterquality.backend.repository..*(..))")` để thực thi trước bất kỳ phương thức nào trong package repository.
        *   **Logic trong advice:**
            *   Lấy `EntityManager` từ `ApplicationContext`.
            *   Lấy `Session` từ `EntityManager`.
            *   Lấy `tenantId` từ `TenantContext.getTenantId()`.
            *   Nếu `tenantId` tồn tại, kích hoạt Hibernate Filter: `session.enableFilter("tenantFilter").setParameter("tenantId", tenantId)`.

4.  **Kiểm tra và Tái cấu trúc (Refactor):**
    *   Rà soát lại tất cả các phương thức trong `UserController` và `DeviceController` đã tạo ở các ngày trước.
    *   **Loại bỏ** tất cả các logic lọc theo `factory_id` thủ công (ví dụ: `findByDeviceIdAndFactoryId(...)`).
    *   Thay thế chúng bằng các phương thức đơn giản hơn (ví dụ: `findById(...)`). Hibernate Filter sẽ tự động thêm điều kiện `AND factory_id = ?` vào câu lệnh SQL.
    *   Viết các bài test (hoặc kiểm tra thủ công) để xác nhận:
        *   Một `ADMIN` của nhà máy A không thể thấy dữ liệu (user, device) của nhà máy B.
        *   Khi không có `tenantId` trong context, filter không được áp dụng (hoặc ném lỗi, tùy thiết kế).

### Kết quả cần đạt:
*   Cơ chế cách ly dữ liệu hoạt động một cách trong suốt.
*   Lớp service và repository trở nên "sạch" hơn, không còn chứa các logic lặp đi lặp lại về việc lọc theo `factory_id`.
*   Hệ thống được bảo vệ vững chắc khỏi các lỗi truy cập dữ liệu chéo giữa các tenant.
*   `TenantContext` được quản lý an toàn cho mỗi request.