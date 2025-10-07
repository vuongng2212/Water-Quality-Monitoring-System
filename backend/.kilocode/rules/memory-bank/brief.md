# Project Brief

**Project Name:** Water Quality Monitoring System

**Core Idea:** A multi-tenant SaaS platform to provide real-time water quality monitoring for multiple factories.

**Key Goals:**
1.  **Multi-tenancy:** Support multiple, isolated "Factory" tenants on a single platform.
2.  **Role-Based Access Control:** Implement two main roles: `ADMIN` (factory manager) and `EMPLOYEE` (operator) with scoped permissions.
3.  **Core Functionality:**
    -   Real-time data collection from IoT devices (ESP).
    -   Data visualization through charts.
    -   A two-tier alert system (web notifications and SOS emails).
    -   Remote control of connected hardware (e.g., valves).
4.  **Tech Stack:** Spring Boot (Backend), Next.js (Frontend), MariaDB (Database).