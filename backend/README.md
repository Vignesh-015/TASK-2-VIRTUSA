# EMS Backend (`ems-backend`)

Spring Boot 3 backend for the Employee Management System (SEC - Team 2).

## Prerequisites
- **JDK 17+** (`java -version` should report 17 or higher)
- **MySQL 8+** with an empty database named `ems_db`:
  ```sql
  CREATE DATABASE IF NOT EXISTS ems_db;
  ```
  *(Optional)* If you do not have MySQL installed locally, you can run with the in-memory `h2` profile instead.

## Credentials Setup (MySQL)
Real database credentials must never be committed to Git.

1. Copy the template file:
   - Windows (PowerShell):
     ```powershell
     Copy-Item src\main\resources\application-local.properties.example src\main\resources\application-local.properties
     ```
   - Linux / macOS:
     ```bash
     cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
     ```
2. Open `src/main/resources/application-local.properties` and set your MySQL username and password.
   *(Alternatively, set `DB_USERNAME` and `DB_PASSWORD` environment variables.)*

## Running the Backend

- **API Base URL:** `http://localhost:8080/api`
- **Health Check:** `GET http://localhost:8080/api/health`

### With MySQL (default profile)
- Windows:
  ```powershell
  mvnw.cmd spring-boot:run
  ```
- Linux / macOS:
  ```bash
  ./mvnw spring-boot:run
  ```

### Without MySQL (`h2` in-memory profile)
- Windows:
  ```powershell
  mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
  ```
- Linux / macOS:
  ```bash
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
  ```
H2 Console (when running with `h2` profile): `http://localhost:8080/api/h2-console` (JDBC URL: `jdbc:h2:mem:ems_db`, username: `sa`, password: empty).

### Building the JAR
- Windows: `mvnw.cmd -q -DskipTests package`
- Linux / macOS: `./mvnw -q -DskipTests package`

## Authentication & Security Module (`com.sec.team2.ems.auth`)

The Authentication and Security module manages JWT authentication, token issuance and verification, credentials validation, password hashing via BCrypt, and method-level authorization.

- **Stateless JWT:** Issues HMAC-SHA256 tokens valid for 120 minutes with claims `sub`, `name`, `role`, `iat`, `exp`.
- **Protected Endpoints:** Enforces role-based permissions (`@PreAuthorize`) and returns 401/403 JSON in standard `ApiError` format.
- **Demo Accounts:** Automatically provisions demo accounts on startup when `app.seed-demo-accounts=true`.

Detailed architecture and design documentation is available at [docs/AUTH_MODULE.md](docs/AUTH_MODULE.md).

### Auth REST Endpoints

Base path: `http://localhost:8080/api/auth`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user credentials and issue JWT token | `LoginRequest` (`email`, `password`) | `200 OK` (`401` invalid/inactive) |
| `POST` | `/auth/register` | Self-register employee account (role defaults to `EMPLOYEE`) | `RegisterRequest` (`name`, `email`, `password`, `department`) | `201 Created` (`409` duplicate email) |

## User Module (`com.sec.team2.ems.user`)

The User Management module serves as the single source of truth for both the Employees tab (HR view) and Users tab (access view). It manages employee profile details (employee code, designation, employment type, location, manager, skills, bio) alongside security roles and statuses (`ACTIVE`, `ONBOARDING`, `ON_LEAVE`, `INACTIVE`).

- **Soft Delete:** `DELETE` deactivates the record (`INACTIVE`) without deleting rows.
- **Admin Guard:** Protects the last active administrator from being deactivated or changed to a non-admin role.
- **Data Backfill:** `UserDataBackfill` automatically populates employee codes and missing fields on existing rows on startup.
- **Data Seeder:** `UserDataSeeder` automatically populates 12 initial employee records if the database is empty.

Detailed architecture and design documentation is available at [docs/USER_MODULE.md](docs/USER_MODULE.md).

### REST Endpoints

Base path: `http://localhost:8080/api/users`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | List all employee accounts ordered by ID | None | `200 OK` |
| `GET` | `/users/{id}` | Get employee details by ID | None | `200 OK` (`404` if not found) |
| `POST` | `/users` | Create a new employee (role defaults to `EMPLOYEE`, generates `EMP-XXXX`) | `UserRequest` | `201 Created` (`400` validation, `409` duplicate) |
| `PUT` | `/users/{id}` | Update existing employee details | `UserRequest` | `200 OK` (`404` if not found, `409` duplicate) |
| `PATCH` | `/users/{id}/role` | Update user access role | `RoleUpdateRequest` | `200 OK` (`409` if last admin) |
| `PATCH` | `/users/{id}/status` | Update employee status | `StatusUpdateRequest` | `200 OK` (`409` if last active admin) |
| `DELETE` | `/users/{id}` | Soft delete / deactivate employee account | None | `204 No Content` (`409` if last active admin) |

## Profile Module (`com.sec.team2.ems.profile`)

The Profile module provides self-service profile inspection, personal contact/skills updates, and password changes for the currently authenticated employee. The identity is resolved strictly from the JWT SecurityContext (no ID in URL).

Detailed architecture and design documentation is available at [docs/PROFILE_MODULE.md](docs/PROFILE_MODULE.md).

### Profile REST Endpoints

Base path: `http://localhost:8080/api/profile`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/profile/me` | Retrieve profile of the currently authenticated user | None | `200 OK` (`401` unauthenticated) |
| `PUT` | `/profile/me` | Update permitted profile fields (names, phone, location, skills, bio, emergency contact) | `ProfileUpdateRequest` | `200 OK` (`400` validation, `401` unauthenticated) |
| `POST` | `/profile/change-password` | Change authenticated user's password | `ChangePasswordRequest` | `200 OK` (`400` validation/mismatch, `401` unauthenticated) |

## Department Module (`com.sec.team2.ems.department`)

The Department module manages functional business units, organizational headcounts, department heads, and acts as the single source of truth for department configurations.

Detailed architecture and design documentation is available at [docs/DEPARTMENT_MODULE.md](docs/DEPARTMENT_MODULE.md).

### Department REST Endpoints

Base path: `http://localhost:8080/api/departments`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/departments` | List all departments with computed live employee count | None | `200 OK` (`401` unauthenticated) |
| `GET` | `/departments/{id}` | Retrieve department by ID | None | `200 OK` (`404` not found) |
| `POST` | `/departments` | Create a new department (Admin/HR) | `DepartmentRequest` | `201 Created` (`400` validation, `409` duplicate) |
| `PUT` | `/departments/{id}` | Update department and cascade rename to users (Admin/HR) | `DepartmentRequest` | `200 OK` (`400` validation, `409` duplicate) |
| `DELETE` | `/departments/{id}` | Delete empty department (Admin only; blocked if staff assigned) | None | `204 No Content` (`409` if has employees) |

## Dashboard Module (`com.sec.team2.ems.dashboard`)

The Dashboard module provides high-level workforce analytics, department headcount allocations, employment status distributions, and recent employee additions. All numbers are computed from database count queries, ensuring minimal network overhead and strong access security.

Detailed architecture and design documentation is available at [docs/DASHBOARD_MODULE.md](docs/DASHBOARD_MODULE.md).

### Dashboard REST Endpoints

Base path: `http://localhost:8080/api/dashboard`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Workforce statistics, status counts, new joiners, and active percentage | None | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/dashboard/departments` | Headcount and percentage allocation per department (includes 0-staff units) | None | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/dashboard/recent` | Recent employee additions ordered by join date desc, id desc (default limit 5) | None | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |

## Reports & Analytics Module (`com.sec.team2.ems.report`)

The Reports & Analytics module provides workforce distribution charts, status health metrics, chronological monthly hiring volume, and KPI summaries. All calculations are executed via database queries with optional `joinedOn` date range filters (`startDate` and `endDate`).

Detailed architecture and design documentation is available at [docs/REPORT_MODULE.md](docs/REPORT_MODULE.md).

### Reports REST Endpoints

Base path: `http://localhost:8080/api/reports`

| Method | Endpoint | Description | Query Params | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/departments` | Department headcount and allocation percentage (includes 0-staff depts) | `startDate`, `endDate` | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/reports/status-distribution` | Account status counts across all four statuses in fixed order | `startDate`, `endDate` | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/reports/monthly-joins` | Chronological monthly join volume with zero-fill (max 60 months) | `startDate`, `endDate` | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/reports/summary` | Executive KPI summary metrics for the filtered workforce | `startDate`, `endDate` | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |

## Package Structure & Module Owners

Base package: `com.sec.team2.ems`

| Package | Responsibility / Owner |
| :--- | :--- |
| `com.sec.team2.ems.config` | Shared Security and CORS configuration |
| `com.sec.team2.ems.common` | Shared `Role` enum, `ApiError`, exceptions, `GlobalExceptionHandler` |
| `com.sec.team2.ems.health` | `HealthController` (`GET /api/health`) |
| `com.sec.team2.ems.auth` | Authentication & security — **Viknesh S R** |
| `com.sec.team2.ems.user` | User management — **Vigneshwaran R** |
| `com.sec.team2.ems.department` | Department management — **SEC Team 2** |
| `com.sec.team2.ems.dashboard` | Dashboard — **Yuvashree R H** |
| `com.sec.team2.ems.report` | Reports & analytics — **Vetriselvi M** |
| `com.sec.team2.ems.profile` | Profile & role-based access — **Sivasakthi A** |

**Rule:** Each team member adds work only inside their own package.

