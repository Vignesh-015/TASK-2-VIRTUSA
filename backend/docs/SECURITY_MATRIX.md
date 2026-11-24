# Security Matrix & Access Control Specification

**Package:** `com.sec.team2.ems`  
**Base Context Path:** `/api`  
**Security Framework:** Spring Security 6 (`@EnableMethodSecurity`) + Stateless JWT (HMAC-SHA256)

---

## 1. Architecture Overview

The Employee Management System enforces defense-in-depth security:
1. **Transport & Entry Point:** Spring Security filter chain (`SecurityConfig`) defines public paths (`/api/auth/**`, `/api/health`) and requires authentication for all other endpoints.
2. **Stateless JWT Authentication:** `JwtAuthenticationFilter` intercepts incoming HTTP requests, parses the `Authorization: Bearer <token>` header, verifies the HMAC-SHA256 signature, validates expiration, checks user active status, and establishes a `UsernamePasswordAuthenticationToken` with authority `ROLE_<role>`.
3. **Method-Level Authorization:** Domain controllers apply `@PreAuthorize("hasRole(...)")` or `@PreAuthorize("hasAnyRole(...)")` to enforce role-based access control (RBAC).
4. **Standardized Error Handling:** Any unauthorized or forbidden access triggers an `ApiError` JSON response with HTTP status 401 Unauthorized or HTTP status 403 Forbidden.

---

## 2. API Endpoint Security Matrix

The table below specifies the access control rules for every REST endpoint exposed by the backend:

| HTTP Method | Endpoint URI | Description | Allowed Roles | No Token | `EMPLOYEE` | `HR` | `ADMIN` |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Authentication & Health** | | | | | | | |
| `POST` | `/api/auth/login` | Authenticate user credentials & issue JWT | Public | 200 | 200 | 200 | 200 |
| `POST` | `/api/auth/register` | Self-service employee account registration | Public | 201 | 201 | 201 | 201 |
| `GET` | `/api/health` | Service health status check | Public | 200 | 200 | 200 | 200 |
| **User Management** | | | | | | | |
| `GET` | `/api/users` | List all employee records | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/users/{id}` | Get employee profile by ID | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `POST` | `/api/users` | Create new employee profile | `ADMIN`, `HR` | 401 | 403 | 201 | 201 |
| `PUT` | `/api/users/{id}` | Update employee profile details | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `PATCH` | `/api/users/{id}/role` | Update user access role | `ADMIN` | 401 | 403 | 403 | 200 |
| `PATCH` | `/api/users/{id}/status` | Update user status (`ACTIVE`, `ONBOARDING`, etc.) | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `DELETE` | `/api/users/{id}` | Soft delete / deactivate user account | `ADMIN` | 401 | 403 | 403 | 204 |
| **Department Management** | | | | | | | |
| `GET` | `/api/departments` | List all active departments | Authenticated | 401 | 200 | 200 | 200 |
| `GET` | `/api/departments/{id}` | Get department details by ID | Authenticated | 401 | 200 | 200 | 200 |
| `POST` | `/api/departments` | Create new department | `ADMIN` | 401 | 403 | 403 | 201 |
| `PUT` | `/api/departments/{id}` | Update department details | `ADMIN` | 401 | 403 | 403 | 200 |
| `DELETE` | `/api/departments/{id}` | Delete department (if headcount = 0) | `ADMIN` | 401 | 403 | 403 | 204 |
| **Dashboard** | | | | | | | |
| `GET` | `/api/dashboard/stats` | Executive workforce summary statistics | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/dashboard/departments` | Department distribution & allocation breakdown | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/dashboard/recent` | Recent employee joiners list | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| **Reports & Analytics** | | | | | | | |
| `GET` | `/api/reports/departments` | Filtered department headcount analytics | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/reports/status-distribution` | Workforce status distribution counts | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/reports/monthly-joins` | Chronological monthly hiring trends | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| `GET` | `/api/reports/summary` | Executive KPI analytics summary | `ADMIN`, `HR` | 401 | 403 | 200 | 200 |
| **Profile (Self-Service)** | | | | | | | |
| `GET` | `/api/profile/me` | Fetch authenticated user's own profile | Authenticated | 401 | 200 | 200 | 200 |
| `GET` | `/api/profile/colleagues` | Privacy-safe department colleagues for workspace | Authenticated | 401 | 200 | 200 | 200 |
| `PUT` | `/api/profile/me` | Update authenticated user's own details | Authenticated | 401 | 200 | 200 | 200 |
| `PUT` | `/api/profile/change-password` | Update authenticated user's own password | Authenticated | 401 | 200 | 200 | 200 |

---

## 3. Role Responsibilities & Permissions

### `ADMIN` (System Administrator)
- Full administrative control across the platform.
- Create, read, update, and soft-delete user accounts.
- Exclusively authorized to change user access roles (`PATCH /api/users/{id}/role`).
- Exclusively authorized to perform department CRUD operations (`POST`, `PUT`, `DELETE /api/departments/**`).
- Access executive dashboard metrics and organization-wide reports.
- Protected by business rules: The last active administrator cannot be deactivated or demoted.

### `HR` (Human Resources Officer)
- Manage employee lifecycle and profile information.
- View full employee directory and profile details.
- Create new employee accounts and update employee records.
- Update employee account statuses (`PATCH /api/users/{id}/status`).
- Access workforce dashboard KPIs and analytics reports.
- Restricted from deleting users, changing system roles, or altering departmental definitions.

### `EMPLOYEE` (Standard Staff Member)
- Self-service portal access restricted strictly to personal information.
- View personal profile, update self contact info, and change own password (`/api/profile/**`).
- View department definitions (`GET /api/departments`) for internal organizational awareness.
- View role-specific personal workspace on dashboard (upcoming events, personal profile summary, teammates).
- Strictly barred from directory listing (`GET /api/users`), user management, administrative dashboard KPIs, and reports.

---

## 4. Frontend Route Guards & Sidebar Alignment

To provide a consistent user experience, the Angular frontend mirrors the backend security matrix:
- **`roleMatchGuard`:** Applied in `app-routing.module.ts` on routes `/employees`, `/departments`, `/reports`, and `/users` with `data: { roles: ['ADMIN', 'HR'] }`.
- **Sidebar Visibility:** Navigation items for Employees, Departments, Reports, and Users are dynamically hidden from `EMPLOYEE` users using `*ngIf="authService.hasRole(['ADMIN', 'HR'])"`.
- **Service-Level Defense:** Services such as `EmployeeService` verify the user's role before issuing network requests to endpoints restricted to `ADMIN` and `HR`, preventing unintentional 403 errors and unauthorized data exposure.

---

## 5. Known Limitations

1. **Stateless Token Validity Window:**  
   JWTs are stateless; once issued, a token remains cryptographically valid until its expiration time (`exp = 120m`). If an administrator changes a user's role, the user's current token retains the previous role until re-authentication. (Note: Account deactivation is validated per request in `JwtAuthenticationFilter`, so deactivated users are immediately blocked).
2. **Development Seed Passwords:**  
   The demo accounts seeded during development (`admin123`, `hr123`, `emp123`) are hardcoded for evaluation.
3. **Static JWT Secret in Config:**  
   The fallback JWT signing secret in `application.properties` is a default key intended for development convenience. A startup warning is logged when this fallback key is in use.

---

## 6. Production Hardening Checklist

When preparing this backend for production deployment, activate the dedicated `prod` profile (`application-prod.properties`):
- [ ] **Enforce Production Profile:** Run with `-Dspring-boot.run.profiles=prod`. This sets `app.seed-demo-accounts=false`, disables SQL echo, and lowers token expiration to 60 minutes.
- [ ] **Mandatory Secure JWT Secret:** The `prod` profile requires `JWT_SECRET` environment variable with no default; the application refuses to start if it is missing.
- [ ] **Token Expiry & Refresh Strategy:** Reduce access token lifespan to 15–30 minutes and implement a secure refresh token mechanism stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- [ ] **Token Revocation Blacklist:** Introduce a distributed cache (e.g. Redis) to invalidate tokens on explicit logout or administrative revocation before expiration.
- [ ] **Enforce TLS/HTTPS:** Terminate TLS at the reverse proxy (Nginx, Cloudflare) and enforce HTTPS to secure JWT bearer tokens in transit.
- [ ] **Rate Limiting:** Implement brute-force protection and rate limiting on `/api/auth/login` to prevent credential stuffing attacks.
- [ ] **Audit Logging:** Enable structured security audit logging for sensitive actions (role modifications, account deletions, password updates).

