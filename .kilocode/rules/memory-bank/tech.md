# Technology Stack & Setup

This document outlines the technologies, development setup, and technical constraints for the Water Quality Monitoring System project.

## 1. Core Technologies

-   **Backend:**
    -   **Language/Framework:** Java 17, Spring Boot
    -   **Rationale:** A robust, widely-used framework for building secure and high-performance RESTful APIs. It provides a solid structure for features like security, data access, and scheduled tasks.
-   **Frontend:**
    -   **Language/Framework:** TypeScript, Next.js (React)
    -   **Rationale:** A modern React framework that enables server-side rendering (SSR) for better performance and a rich user experience. TypeScript adds static typing for improved code quality and maintainability.
-   **Database:**
    -   **System:** MariaDB
    -   **Rationale:** An open-source, relational database management system (RDBMS) that is highly compatible with MySQL. It ensures data integrity and consistency, which is crucial for a multi-tenant application.

## 2. Development Setup

The development environment requires the following tools to be installed:

-   **JDK (Java Development Kit):** Version 17 or newer.
-   **Node.js:** Version 18.x or newer.
-   **MariaDB:** A running instance of the MariaDB server.
-   **Git:** For source code management.
-   **ngrok (Optional):** Used during local development to expose the backend API to the internet for testing with the deployed frontend or physical ESP devices.

## 3. Build and Dependency Management

-   **Backend (Spring Boot):**
    -   **Tool:** Gradle
    -   **Configuration:** All dependencies are defined in the `build.gradle` file located in the backend's root directory.
-   **Frontend (Next.js):**
    -   **Tool:** NPM (Node Package Manager)
    -   **Configuration:** Dependencies are managed via the `package.json` file.

## 4. Environment Variables

To maintain security and configuration flexibility, sensitive information is not hard-coded.

-   **Backend (`application-local.properties`):**
    -   `spring.datasource.*`: Database connection details.
    -   `jwt.secret`: Secret key for signing and verifying JWTs.
    -   `spring.mail.*`: Configuration for the email sending service (for SOS alerts).
-   **Frontend (`.env.local`):**
    -   `NEXT_PUBLIC_API_BASE_URL`: The public URL of the backend API (e.g., the ngrok URL during development).

## 5. Technical Constraints & Patterns

-   **Real-time Communication:** The system currently uses **HTTP Polling** (frontend calls the API every 15 seconds) for near real-time data updates. This is a deliberate choice for simplicity in the initial phase. A future upgrade to WebSockets may be considered if stricter real-time requirements arise.
-   **Multi-tenancy:** The application logic and database schema are designed to support multiple tenants (factories), ensuring strict data isolation between them.