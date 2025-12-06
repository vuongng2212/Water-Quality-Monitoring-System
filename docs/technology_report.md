# Báo cáo Công nghệ Hệ thống Giám sát Chất lượng Nước

## Giới thiệu

Hệ thống Giám sát Chất lượng Nước (Water Quality Monitoring System) là một nền tảng SaaS đa người dùng (multi-tenant) toàn diện, được thiết kế để phục vụ các nhà máy xử lý nước trong việc giám sát và kiểm soát chất lượng nước theo thời gian thực. Hệ thống tích hợp với các thiết bị IoT như ESP8266/ESP32 để thu thập dữ liệu cảm biến (pH, nhiệt độ, độ đục, độ dẫn điện) và cho phép điều khiển thiết bị từ xa. Với kiến trúc multi-tenant, hệ thống hỗ trợ nhiều nhà máy hoạt động độc lập trên cùng một nền tảng, đảm bảo dữ liệu được bảo mật và phân tách hoàn toàn.

## Công nghệ Backend

### Ngôn ngữ Sử dụng
- **Java 17**: Được chọn vì tính ổn định, hiệu năng cao và hỗ trợ lâu dài từ Oracle. Java 17 cung cấp các tính năng hiện đại như records, sealed classes và pattern matching, giúp code dễ bảo trì và mở rộng. Trong bối cảnh IoT, Java đảm bảo xử lý đồng thời hiệu quả cho nhiều thiết bị kết nối.

### Framework Spring Boot
- **Spring Boot 3.5.6**: Framework chính cho backend, cung cấp cấu trúc ứng dụng web nhanh chóng với auto-configuration. Spring Boot giúp giảm thời gian phát triển bằng cách loại bỏ boilerplate code, đồng thời hỗ trợ tích hợp dễ dàng với các công nghệ khác. Phiên bản 3.x đảm bảo tương thích với Java 17 và cung cấp hiệu năng tối ưu cho ứng dụng real-time.

### Kiến trúc Bảo mật
- **JWT (JSON Web Tokens) + API Key**: 
  - JWT được sử dụng cho xác thực người dùng (admin, employee) thông qua email/password.
  - API Key được sử dụng cho thiết bị IoT (ESP32/8266) để gửi dữ liệu cảm biến.
  - Spring Security quản lý filter chain, đảm bảo mỗi request được kiểm tra trước khi xử lý. Điều này đảm bảo bảo mật cao trong môi trường multi-tenant và IoT.

### Cách Backend Xử lý Multi-Tenant
- Sử dụng `factory_id` để phân tách dữ liệu giữa các nhà máy. Mỗi request được gắn với context tenant tự động thông qua JWT hoặc API Key. Điều này đảm bảo dữ liệu của nhà máy A không thể truy cập bởi nhà máy B, hỗ trợ kiến trúc SaaS linh hoạt và bảo mật.

### Database Sử dụng và Lý do Chọn
- **MariaDB 10.6**: Database quan hệ được chọn vì:
  - Tương thích cao với MySQL, dễ di chuyển.
  - Hiệu năng tốt cho dữ liệu thời gian thực từ IoT.
  - Hỗ trợ ACID transactions, đảm bảo tính toàn vẹn dữ liệu.
  - Dễ tích hợp với Spring Data JPA cho ORM.

### Các Thư viện Chính và Vai trò
- **Spring Data JPA + Hibernate**: Quản lý truy vấn database, mapping object-relational.
- **Spring Security**: Xác thực và phân quyền.
- **JJWT**: Tạo và xác thực JWT tokens.
- **Lombok**: Giảm boilerplate code (getters, setters).
- **SpringDoc OpenAPI**: Tự động tạo API documentation.
- **Spring Boot Starter Mail**: Gửi email cảnh báo tự động.

## Công nghệ Frontend

### Framework React + Vite
- **React 19.1.1**: Framework UI component-based, cho phép xây dựng giao diện động và responsive. React giúp quản lý state hiệu quả cho dashboard real-time.
- **Vite 7.1.7**: Build tool và dev server nhanh, hỗ trợ Hot Module Replacement (HMR) cho phát triển hiệu quả. Vite được chọn vì tốc độ build nhanh hơn webpack, phù hợp cho ứng dụng frontend phức tạp.

### Công cụ UI TailwindCSS
- **TailwindCSS 3.4.18**: Utility-first CSS framework, cung cấp classes sẵn có để styling nhanh. Tailwind giúp giao diện responsive trên mọi thiết bị, dễ bảo trì và nhất quán. Trong hệ thống IoT, điều này đảm bảo dashboard hiển thị tốt trên mobile và desktop.

### Biểu đồ Real-time bằng Chart.js
- **Chart.js 4.5.1 + React-ChartJS-2**: Thư viện biểu đồ JavaScript mạnh mẽ, hỗ trợ real-time updates. Được tích hợp với React để hiển thị dữ liệu cảm biến (pH, nhiệt độ, etc.) theo thời gian thực. Chart.js nhẹ, hiệu năng cao và dễ tùy chỉnh cho dashboard IoT.

### Cấu trúc Giao diện và Routing
- **React Router 7.9.4**: Quản lý client-side routing cho các trang: Dashboard, Device Management, User Management, History.
- Giao diện được tổ chức theo components: App.jsx làm root, với các pages và components con. Axios xử lý HTTP requests đến backend.

## Lý do Lựa chọn Công nghệ

### Tính Ổn định và Hiệu năng
- Java/Spring Boot: Proven technology với cộng đồng lớn, hỗ trợ lâu dài. Spring Boot tối ưu cho microservices và real-time processing.
- React/Vite: React stable với virtual DOM hiệu quả; Vite cung cấp build nhanh, phù hợp cho ứng dụng IoT với nhiều updates real-time.
- MariaDB: Reliable cho dữ liệu quan hệ, ACID compliance đảm bảo không mất dữ liệu IoT.

### Dễ Tích hợp IoT
- Spring Boot dễ tích hợp REST APIs cho thiết bị IoT.
- JWT + API Key đơn giản cho authentication devices.
- Chart.js native support cho real-time charts từ WebSocket hoặc polling.

### Khả năng Bảo trì Lâu dài
- Java 17 LTS: Support dài hạn đến 2029+.
- Spring Boot: Auto-configuration giảm maintenance.
- React component-based: Dễ refactor và scale.
- TailwindCSS: Consistent styling, ít CSS custom.

## Kiến trúc Tổng thể

```
IoT Layer (ESP8266/ESP32) -> Backend Layer (Spring Boot) -> Database Layer (MariaDB) -> Frontend Layer (React)
```

- **IoT Layer**: Thu thập dữ liệu cảm biến, gửi qua HTTP/API Key.
- **Backend Layer**: Xử lý business logic, multi-tenant, security, REST APIs.
- **Database Layer**: Lưu trữ dữ liệu phân tách theo tenant.
- **Frontend Layer**: Hiển thị dashboard real-time, quản lý devices/users.

Kiến trúc này đảm bảo scalability, security và ease of maintenance cho hệ thống IoT multi-tenant.