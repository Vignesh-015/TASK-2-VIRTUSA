# User & Employee Management Module (Backend)

**Package:** `com.sec.team2.ems.user`  
**Base URL:** `/api/users`  
**Owner:** Vigneshwaran R (SEC – Team 2)

---

## 1. Overview & Unified Source of Truth

The User Management module provides the core data persistence and business logic for both:
1. **The Employees Tab (HR View):** Full employee profile management including employee code, personal names, designation, employment type, location, manager, skills, and bio.
2. **The Users Tab (Access & Security View):** System user management including access roles (`ADMIN`, `HR`, `EMPLOYEE`), account activation/deactivation, and credentials.

A single underlying table (`users`) acts as the unified source of truth for both views. When a new person is created from the frontend, they automatically receive the default security role `EMPLOYEE`. Roles are updated exclusively through a dedicated administrative endpoint (`PATCH /api/users/{id}/role`).

The module strictly follows Spring Boot's layered architecture:

```
[ Angular Client (Employees & Users tabs) ]
                 |  HTTP JSON (/api/users)
                 v
        [ UserController ]           <-- HTTP handling & input validation (@Valid)
                 |
                 v
        [ UserService ]              <-- Business logic, code generation, admin guard
            /         \
           v           v
    [ UserMapper ]   [ UserRepository ]  <-- Spring Data JPA (SQL abstraction)
           |                   |
    [ DTO Objects ]     [ User Entity ]  <-- Database table ("users")
```

---

## 2. The 5 Architectural Layers Explained

| Layer | Class | Responsibility |
| :--- | :--- | :--- |
| **Controller** | `UserController` | Exposes REST endpoints (`GET`, `POST`, `PUT`, `DELETE`, `PATCH /role`, `PATCH /status`), validates incoming DTOs, and returns standard HTTP responses (`200`, `201`, `204`). |
| **Service** | `UserService` | Implements business logic: enforces email uniqueness, generates sequential `EMP-XXXX` codes, sets temporary password hashes, enforces the last active admin protection rule, and executes soft deletion. |
| **Repository** | `UserRepository` | Extends `JpaRepository<User, Long>` with custom queries for email existence, role/status counting, and employee code scanning. |
| **Entity** | `User` | JPA entity mapped to the `users` table. Contains both HR employee columns and security access columns. |
| **DTOs & Mapper** | `UserRequest`, `UserResponse`, `RoleUpdateRequest`, `StatusUpdateRequest`, `UserMapper` | Shields sensitive entity attributes (passwords) and separates client contracts from the database schema. |

---

## 3. Why We Use DTOs (Data Transfer Objects)

1. **Security & Privacy:** The `User` entity holds sensitive attributes like BCrypt password hashes. `UserResponse` never exposes passwords.
2. **Input Validation Isolation:** Jakarta validation annotations (`@NotBlank`, `@Email`, `@Pattern`, `@Size`) reside on `UserRequest`, isolating user validation from the entity layer.
3. **Decoupled Roles & Codes:** `UserRequest` excludes `role` and `employeeCode` so clients cannot tamper with system-generated IDs or elevate their own roles upon creation.

---

## 4. End-to-End Request Flow (Angular to Database)

Here is what happens when a new employee is created:

1. **User Submits Form:** Details entered in the form (first name, last name, email, phone, department, designation, etc.) are submitted via `POST /api/users`.
2. **CORS Validation:** `CorsConfig` confirms the request is from allowed origin `http://localhost:4200`.
3. **Input Validation:** `UserController` inspects `@Valid UserRequest`. Invalid fields trigger HTTP `400 Bad Request` with field-specific errors.
4. **Duplicate Email Check:** `UserService.createUser()` verifies that the email is not already taken; otherwise throws `DuplicateResourceException` (HTTP `409 Conflict`).
5. **Auto Role Assignment:** The role is automatically assigned as `Role.EMPLOYEE`.
6. **Employee Code Generation:** The service identifies the highest existing `EMP-` numeric code and assigns `EMP-(max + 1)` (starts at `EMP-1001` if no codes exist).
7. **Password Hashing:** Hashes the initial default temporary password (`Welcome@123`) using BCrypt.
8. **Entity Mapping & Persistence:** `UserMapper.toEntity()` creates the entity, and `userRepository.save()` persists it to the database.
9. **Response:** `UserMapper.toResponse()` maps the saved user to `UserResponse` and returns HTTP `201 Created`.

---

## 5. REST API Endpoints & Contracts

Base URL: `http://localhost:8080/api/users`

| Method | Endpoint | Description | Request Body | Success Status | Error Statuses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | List all employees/users (ordered by ID) | None | `200 OK` | `500` |
| `GET` | `/users/{id}` | Get employee details by ID | None | `200 OK` | `404` |
| `POST` | `/users` | Create new employee (role defaults to `EMPLOYEE`) | `UserRequest` | `201 Created` | `400`, `409` |
| `PUT` | `/users/{id}` | Update employee profile details | `UserRequest` | `200 OK` | `400`, `404`, `409` |
| `PATCH` | `/users/{id}/role` | Update user security role | `RoleUpdateRequest` | `200 OK` | `400`, `404`, `409` (last admin) |
| `PATCH` | `/users/{id}/status` | Update employee status | `StatusUpdateRequest` | `200 OK` | `400`, `404`, `409` (last active admin) |
| `DELETE` | `/users/{id}` | Soft delete (deactivate account) | None | `204 No Content` | `404`, `409` (last active admin) |

### Sample JSON Request (`POST /api/users` & `PUT /api/users/{id}`)
```json
{
  "firstName": "Aarav",
  "lastName": "Sharma",
  "email": "aarav.sharma@ems.com",
  "phone": "+91 9820145678",
  "department": "Engineering",
  "designation": "Senior Full Stack Engineer",
  "joinedOn": "2023-02-14",
  "status": "ACTIVE",
  "employmentType": "FULL_TIME",
  "workLocation": "Chennai (Hybrid)",
  "managerName": "System Admin",
  "skills": "Angular, Spring Boot, MySQL",
  "bio": "Senior developer on the core platform team."
}
```

### Sample JSON Request (`PATCH /api/users/{id}/role`)
```json
{
  "role": "ADMIN"
}
```

### Sample JSON Request (`PATCH /api/users/{id}/status`)
```json
{
  "status": "INACTIVE"
}
```

### Sample JSON Response (`200 OK` / `201 Created`)
```json
{
  "id": 2,
  "employeeCode": "EMP-1002",
  "firstName": "Aarav",
  "lastName": "Sharma",
  "fullName": "Aarav Sharma",
  "email": "aarav.sharma@ems.com",
  "phone": "+91 9820145678",
  "department": "Engineering",
  "designation": "Senior Full Stack Engineer",
  "joinedOn": "2023-02-14",
  "status": "ACTIVE",
  "employmentType": "FULL_TIME",
  "workLocation": "Chennai (Hybrid)",
  "managerName": "System Admin",
  "skills": "Angular, Spring Boot, MySQL",
  "bio": "Senior developer on the core platform team.",
  "role": "EMPLOYEE"
}
```

---

## 6. Key Business & Domain Rules

### a. Soft Delete Semantics
Calling `DELETE /api/users/{id}` deactivates the account by updating its status to `INACTIVE`. The database row is **never removed**, ensuring audit trails and historical records remain intact.

### b. Last Active Admin Protection
To prevent accidental administrative lockouts:
1. Attempting to change the role of the last remaining active admin away from `ADMIN` throws `BusinessRuleException("The last admin cannot be changed")` (HTTP 409).
2. Attempting to deactivate (`INACTIVE`) the last remaining active admin via status update or delete throws `BusinessRuleException("The last active admin cannot be deactivated")` (HTTP 409).

### c. Phone Validation Rule
The phone number must be a 10-digit number, optionally prefixed with `+91` (with optional space or dash separator):
`^(\\+91[ -]?)?[0-9]{10}$`  
Examples of valid values: `9876543210`, `+919876543210`, `+91 9876543210`, `+91-9876543210`.

### d. Status & Employment Type Enums
- **UserStatus:** `ACTIVE`, `ONBOARDING`, `ON_LEAVE`, `INACTIVE`.
- **EmploymentType:** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`.

### e. Employee Code Generation
Employee codes follow the format `EMP-XXXX` (e.g. `EMP-1001`, `EMP-1002`). The service queries the highest existing numeric suffix and increments by 1. If a collision occurs, it automatically retries with the next sequence number.

### f. Idempotent Data Backfill (`UserDataBackfill`)
When running on existing databases, the `UserDataBackfill` component automatically inspects rows that were created prior to the schema extension:
- Assigns sequential `employeeCode` values starting after the highest existing code.
- Splits `fullName` into `firstName` and `lastName`.
- Assigns a sensible default `designation` based on the employee's department.
- Defaults `employmentType` to `FULL_TIME` and `workLocation` to `Chennai (Hybrid)`.
- It executes safely on every startup without modifying fully populated rows.
