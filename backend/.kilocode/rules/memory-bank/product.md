# Product Overview

## 1. Why This Project Exists

Dự án "Hệ Thống Giám Sát Chất Lượng Nước" được xây dựng để cung cấp một giải pháp phần mềm dưới dạng dịch vụ (SaaS) cho các nhà máy, giúp họ giám sát chất lượng nước một cách hiệu quả, tập trung và có khả năng mở rộng. Thay vì mỗi nhà máy phải tự xây dựng hệ thống riêng lẻ, dự án này cung cấp một nền tảng trung tâm mà nhiều khách hàng có thể đăng ký và sử dụng.

## 2. Problems It Solves

- **Thiếu giải pháp tập trung:** Các nhà máy thường gặp khó khăn trong việc quản lý nhiều cụm thiết bị giám sát nước ở các địa điểm khác nhau.
- **Quản lý phân quyền phức tạp:** Việc phân quyền cho các nhân viên vận hành để họ chỉ có thể xem và điều khiển các thiết bị được giao phó là một thách thức.
- **Thiếu khả năng giám sát từ xa và cảnh báo tức thì:** Nhu cầu nhận cảnh báo ngay lập tức khi có sự cố và khả năng điều khiển thiết bị từ xa là rất lớn nhưng không phải lúc nào cũng có sẵn.
- **Chi phí tự phát triển cao:** Việc mỗi nhà máy tự xây dựng và bảo trì một hệ thống giám sát là tốn kém và không hiệu quả.

## 3. How It Should Work

Hệ thống hoạt động như một nền tảng **đa người dùng (multi-tenant)**:

1.  **Onboarding Khách hàng:** Một khách hàng mới (một **Nhà máy**) đăng ký sử dụng dịch vụ.
2.  **Lắp đặt Thiết bị:** Đội ngũ IoT lắp đặt các bộ cảm biến ESP tại cơ sở của nhà máy. Mỗi thiết bị có một `deviceId` duy nhất và được đăng ký vào hệ thống dưới quyền sở hữu của nhà máy đó.
3.  **Cấp tài khoản Quản trị:** Hệ thống cung cấp một tài khoản `ADMIN` cho người quản lý của nhà máy.
4.  **Quản lý & Phân quyền:**
    - `ADMIN` đăng nhập vào giao diện web để xem dữ liệu từ tất cả các thiết bị của nhà máy.
    - `ADMIN` có thể tạo các tài khoản `EMPLOYEE` cho nhân viên cấp dưới.
    - `ADMIN` phân công cho mỗi `EMPLOYEE` quyền quản lý trên một hoặc nhiều thiết bị cụ thể.
5.  **Vận hành & Giám sát:**
    - `EMPLOYEE` đăng nhập và chỉ thấy dữ liệu/chức năng điều khiển của các thiết bị họ được phép truy cập.
    - Hệ thống thu thập dữ liệu (pH, nhiệt độ, v.v.), hiển thị trên biểu đồ, và gửi cảnh báo (thông báo trên web, email SOS) khi các chỉ số vượt ngưỡng.
    - Người dùng có thẩm quyền có thể điều khiển van nước hoặc các thiết bị khác từ xa.

## 4. User Experience Goals

- **Đối với `ADMIN`:** Cung cấp một giao diện quản trị tổng thể, mạnh mẽ nhưng dễ sử dụng, cho phép quản lý toàn bộ nhân viên, thiết bị và xem dữ liệu của nhà máy một cách trực quan.
- **Đối với `EMPLOYEE`:** Cung cấp một trải nghiệm tập trung, đơn giản, chỉ hiển thị những thông tin và chức năng cần thiết cho công việc hàng ngày của họ, tránh gây xao nhãng.
- **Chung:** Đảm bảo hệ thống cảnh báo đáng tin cậy, chính xác và kịp thời. Giao diện biểu đồ phải rõ ràng, dễ đọc và phản hồi nhanh.