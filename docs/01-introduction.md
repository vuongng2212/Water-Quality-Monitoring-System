# 1. Giới Thiệu Dự Án

Dự án "Hệ thống giám sát chất lượng nước" là một **nền tảng dịch vụ đám mây (Cloud-based SaaS)**, cung cấp giải pháp giám sát chất lượng nước toàn diện cho nhiều nhà máy. Mỗi nhà máy (khách hàng) sẽ được cấp một tài khoản quản trị để giám sát các cụm thiết bị IoT (cảm biến ESP) được lắp đặt tại cơ sở của họ.

# 2. Mục Tiêu Dự Án

Xây dựng một nền tảng **đa người dùng (multi-tenant)** có khả năng mở rộng, với các mục tiêu chính:

- **Hỗ trợ nhiều khách hàng (nhà máy):** Cung cấp một nền tảng trung tâm để nhiều tổ chức có thể đăng ký và sử dụng dịch vụ.
- **Phân quyền linh hoạt:** Cho phép quản trị viên của nhà máy (Admin) tạo và phân quyền cho các tài khoản nhân viên (Employee) để quản lý các thiết bị cụ thể.
- **Thu thập dữ liệu tập trung:** Thu thập và quản lý dữ liệu từ các thiết bị IoT của tất cả khách hàng một cách an toàn và riêng biệt.
- **Cung cấp giao diện quản lý chuyên biệt:** Mỗi khách hàng sẽ có một giao diện web riêng để xem dữ liệu, điều khiển thiết bị và quản lý người dùng thuộc tổ chức của mình.
- **Duy trì các tính năng cốt lõi:**
    - Phân tích và cảnh báo khi dữ liệu vượt ngưỡng an toàn.
    - Điều khiển thiết bị (van cấp nước) từ xa.
    - Trực quan hóa dữ liệu qua biểu đồ và bảng biểu.