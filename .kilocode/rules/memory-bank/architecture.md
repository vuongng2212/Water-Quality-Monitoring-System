# System Architecture

## 1. Architectural Model

-   **Client-Server:** The system follows a classic client-server model.
-   **Multi-Tenant SaaS:** The core architecture is designed as a multi-tenant Software as a Service (SaaS) platform. Each "Factory" is a tenant with isolated data and user management.
-   **Separated Frontend/Backend:** The frontend (Next.js) is a separate application from the backend (Spring Boot), communicating via RESTful APIs.
-   **Deployment:** The intended deployment is on a cloud platform (e.g., AWS, Vercel) to ensure scalability and high availability.

## 2. Key Technical Decisions & Patterns

-   **Backend Architecture:** The backend is designed following a variation of the **MVC (Model-View-Controller)** pattern, where the "View" is handled by the separate Next.js frontend. This promotes a clean separation of concerns.
-   **Data Isolation:** Multi-tenancy is achieved at the database level. Every table containing tenant-specific data (like `users`, `devices`, `sensor_data`) includes a `factory_id` column. All data access logic in the backend MUST filter by this `factory_id` to ensure a tenant can only access their own data.
-   **Authentication:**
    -   **Users:** JSON Web Tokens (JWT) are used for user authentication. The JWT payload includes the `user_id`, `role`, and `factory_id`, which are crucial for enforcing access control and data isolation.
    -   **Devices:** IoT devices (ESP) are authenticated using a unique API Key associated with each registered device.
-   **Real-time Updates:** The system uses **HTTP Polling** as the initial mechanism for near real-time updates on the frontend. This was chosen for its simplicity and ease of implementation with a standard REST API.

## 3. Database Schema Overview

The MariaDB database schema is designed to support the multi-tenant model:

1.  **`factories`**: The central table representing each tenant (customer).
2.  **`devices`**: Stores information about each IoT device and links it to a `factory`. Contains the `api_key` for device authentication.
3.  **`users`**: Stores user accounts, linking each to a `factory`. The `role` column (`ADMIN` or `EMPLOYEE`) defines their permissions within that factory.
4.  **`employee_device_access`**: A mapping table that grants `EMPLOYEE` users access to specific `devices`.
5.  **`sensor_data`**: Stores the time-series data from sensors, linked to a specific `device`.
6.  **`device_settings`**: Holds configuration for each individual device, such as valve status or data collection interval.

This structure ensures that all data is traceable back to a specific factory, which is the cornerstone of the multi-tenant design.