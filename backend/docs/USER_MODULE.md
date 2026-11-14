# User Management Module (Backend)

**Package:** `com.sec.team2.ems.user`  
**Base URL:** `/api/users`  
**Owner:** Vigneshwaran R (SEC – Team 2)

---

## 1. Overview & Architecture

The User Management module provides full CRUD (Create, Read, Update, Delete) capability for internal employee accounts. It serves as the core user directory for the Employee Management System, managing employee profiles, department assignments, and security roles (`ADMIN`, `HR`, `EMPLOYEE`).

The module strictly adheres to Spring Boot's layered architecture:

```
[ Angular Client (User Form / List) ]
                 |  HTTP JSON (/api/users)
                 v
        [ UserController ]           <-- HTTP handling & input validation (@Valid)
                 |
                 v
        [ UserService ]              <-- Business logic, duplicate checks, rules
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
| **Controller** | `UserController` | Exposes REST endpoints, binds HTTP request bodies to DTOs, triggers Jakarta Bean Validation, and returns standard HTTP response codes (`200`, `201`, `204`). |
| **Service** | `UserService` | Implements business logic: enforces email uniqueness, hashes default temporary passwords, guards against deleting the system's last admin, and manages database transactions (`@Transactional`). |
| **Repository** | `UserRepository` | Extends `JpaRepository<User, Long>` to execute SQL queries on the `users` table without writing raw SQL. |
| **Entity** | `User` | JPA entity mapping to the MySQL `users` table. Contains database columns, primary key generation, and stores the BCrypt password hash. |
| **DTOs & Mapper** | `UserRequest`, `UserResponse`, `UserMapper` | Decouples public API payloads from private database entities. |

---

## 3. Why We Use DTOs (Data Transfer Objects)

1. **Security & Data Privacy:** The `User` entity contains sensitive fields such as the hashed password. `UserResponse` explicitly omits the password field so it can never leak in JSON responses.
2. **Input Validation Isolation:** Jakarta validation annotations (`@NotBlank`, `@Email`, `@Pattern`) belong on `UserRequest`, separating client input validation from database table definitions.
3. **Decoupled Evolution:** Internal database tables can change (e.g., adding internal audit columns or indexing) without breaking the Angular frontend's API contract.

---

## 4. End-to-End Request Flow (Angular to Database)

Here is what happens when an administrator creates a new employee from the Angular form:

1. **User Submits Form:** The admin enters details in `/users/new` and clicks "Save".
2. **Angular Service:** `UserService.addUser(payload)` sends an HTTP `POST` request to `http://localhost:8080/api/users`.
3. **CORS Check:** `CorsConfig` verifies that the origin is `http://localhost:4200` and allows the request.
4. **Validation:** `UserController` receives `@Valid UserRequest`. If any field fails validation (e.g., invalid phone or empty name), `GlobalExceptionHandler` immediately returns HTTP `400 Bad Request` with field-by-field error messages.
5. **Duplicate Check:** `UserService.createUser()` calls `userRepository.existsByEmailIgnoreCase(request.getEmail())`. If taken, it throws `DuplicateResourceException`, returned as HTTP `409 Conflict`.
6. **Password Hashing:** `UserService` encodes the default temporary password (`Welcome@123`) using the `BCryptPasswordEncoder` bean.
7. **Mapping & Persistence:** `UserMapper.toEntity()` creates a `User` entity, and `userRepository.save()` persists it to the MySQL `users` table.
8. **Response:** `UserMapper.toResponse()` maps the saved entity to a `UserResponse` DTO, and `UserController` returns HTTP `201 Created`.
9. **UI Feedback:** Angular receives the new user object, triggers a green notification alert, and redirects to `/users`.

---

## 5. REST API Endpoints & Contracts

Base path: `http://localhost:8080/api/users`

| Method | Endpoint | Description | Request Body | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get all employees (ordered by ID) | None | `200 OK` |
| `GET` | `/users/{id}` | Get employee by ID | None | `200 OK` |
| `POST` | `/users` | Create new employee | `UserRequest` | `201 Created` |
| `PUT` | `/users/{id}` | Update existing employee details | `UserRequest` | `200 OK` |
| `DELETE` | `/users/{id}` | Delete employee account | None | `204 No Content` |

### Sample JSON Request (`POST /api/users` & `PUT /api/users/{id}`)
```json
{
  "fullName": "Aarav Sharma",
  "email": "aarav.sharma@ems.com",
  "phone": "9820145678",
  "department": "Engineering",
  "role": "ADMIN",
  "status": "ACTIVE",
  "joinedOn": "2023-02-14"
}
```

### Sample JSON Response (`200 OK` / `201 Created`)
```json
{
  "id": 1,
  "fullName": "Aarav Sharma",
  "email": "aarav.sharma@ems.com",
  "phone": "9820145678",
  "department": "Engineering",
  "role": "ADMIN",
  "status": "ACTIVE",
  "joinedOn": "2023-02-14"
}
```

---

## 6. Field Validation Rules

| Field | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | String | `@NotBlank`, `@Size(min=3, max=100)` | Employee display name |
| `email` | String | `@NotBlank`, `@Email`, unique | Official work email |
| `phone` | String | `@NotBlank`, `@Pattern("^[0-9]{10}$")` | 10-digit Indian mobile number |
| `department` | String | `@NotBlank` | One of: Engineering, HR, Finance, Sales, Operations, Support |
| `role` | Role | `@NotNull` | `ADMIN`, `HR`, `EMPLOYEE` |
| `status` | UserStatus | `@NotNull` | `ACTIVE`, `INACTIVE` |
| `joinedOn` | LocalDate | `@NotNull`, format `yyyy-MM-dd` | Date joined organization |

---

## 7. Standard Error Response Format (`ApiError`)

All error responses from the backend return a uniform JSON structure produced by `GlobalExceptionHandler`:

```json
{
  "timestamp": "2026-11-14T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "phone: Phone must be 10 digits; fullName: Full name must be between 3 and 100 characters",
  "fieldErrors": {
    "phone": "Phone must be 10 digits",
    "fullName": "Full name must be between 3 and 100 characters"
  }
}
```

### Common Error Statuses
- **`400 Bad Request`**: Validation failure on `@Valid UserRequest`. Field-specific errors are supplied in `fieldErrors`.
- **`404 Not Found`**: Thrown by `ResourceNotFoundException` when a user ID does not exist in the database:
  ```json
  {
    "timestamp": "2026-11-14T12:00:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "User not found with id 999"
  }
  ```
- **`409 Conflict`**: Thrown by `DuplicateResourceException` when an email already exists:
  ```json
  {
    "timestamp": "2026-11-14T12:00:00Z",
    "status": 409,
    "error": "Conflict",
    "message": "A user with this email already exists"
  }
  ```
- **`409 Conflict (Business Rule)`**: Thrown by `BusinessRuleException` when attempting to delete the last admin:
  ```json
  {
    "timestamp": "2026-11-14T12:00:00Z",
    "status": 409,
    "error": "Conflict",
    "message": "The last admin user cannot be deleted"
  }
  ```

---

## 8. Default Temporary Password Note

When creating an employee via `POST /api/users`, the password is not part of the incoming request body.
The service automatically sets a default password:
```java
// TEMPORARY until the auth module adds proper password setup
public static final String DEFAULT_TEMP_PASSWORD = "Welcome@123";
```
This is encoded using `BCryptPasswordEncoder` before saving. When Viknesh's authentication module lands, it will allow users to log in with this initial password and update their credentials.

---

## 9. How Teammates Can Reuse This Pattern

Teammates building their assigned modules (`dashboard`, `report`, `profile`, `auth`) can follow this identical recipe:

1. **Create Entity in your package:** e.g., `com.sec.team2.ems.report.Report`.
2. **Create Repository:** `interface ReportRepository extends JpaRepository<Report, Long>`.
3. **Define DTOs:** Separate incoming requests (`ReportRequest`) from responses (`ReportResponse`).
4. **Use Shared Exceptions:** Throw `ResourceNotFoundException("Report not found with id " + id)` or `BusinessRuleException` from `com.sec.team2.ems.common` — `GlobalExceptionHandler` will automatically format the HTTP response.
5. **Build Service & Controller:** Expose your `@RestController` with `@RequestMapping("/your-module")`. The servlet context path `/api` is applied automatically!

