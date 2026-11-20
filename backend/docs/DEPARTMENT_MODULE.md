# Department Management Module (Backend)

**Package:** `com.sec.team2.ems.department`  
**Base URL:** `/api/departments`  
**Owner:** SEC – Team 2  

---

## 1. Overview

The Department Management module manages the functional business units of the company. It serves as the single source of truth for all department configurations and names in the Employee Management System.

Key responsibilities:
- Central registry for department metadata (name, code, description, head of department, budget, location, color accent).
- Live calculation of department employee headcount directly from the `users` table.
- Automatic synchronization across the database when a department is renamed.
- Integrity enforcement to prevent deleting departments that currently have assigned employees.
- Enforcement that users cannot be created or updated with non-existent departments.

---

## 2. Security & Role Permissions

Endpoints in the Department module are secured via Spring Security method authorization (`@EnableMethodSecurity`):

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Authenticated (`ADMIN`, `HR`, `EMPLOYEE`) | List all departments with computed live employee count |
| `GET` | `/api/departments/{id}` | Authenticated (`ADMIN`, `HR`, `EMPLOYEE`) | Get a single department by its ID |
| `POST` | `/api/departments` | `ADMIN`, `HR` | Create a new organizational department |
| `PUT` | `/api/departments/{id}` | `ADMIN`, `HR` | Update an existing department (triggers cascade rename if name changes) |
| `DELETE` | `/api/departments/{id}` | `ADMIN` only | Delete a department (blocked if `employeeCount > 0`) |

---

## 3. Business Rules & Integrity Constraints

1. **Unique Department Name:**
   - Department names must be unique (case-insensitive).
   - Attempting to create or rename to an existing department name returns HTTP `409 CONFLICT` with message `"A department with this name already exists"`.
2. **Cascade Rename to Users:**
   - When a department name is updated via `PUT /api/departments/{id}`, the backend performs a bulk `@Modifying` update on the `users` table in the same database transaction.
   - All employees who were assigned the old department name are immediately updated to the new name.
3. **Protected Deletion:**
   - A department cannot be deleted if any employee is assigned to it (`employeeCount > 0`), regardless of whether those employees are active, on-boarding, or inactive.
   - Throws `BusinessRuleException` returning HTTP `409 CONFLICT` with message `"Cannot delete a department that still has employees. Move them first."`.
   - Once all employees have been reassigned to other departments, the department can be deleted (HTTP `204 NO CONTENT`).
4. **User Creation & Update Validation:**
   - When creating or updating a user record in `UserService` (`createUser`, `updateUser`), the provided `department` string is validated against existing departments in the `departments` table (case-insensitive).
   - If no matching department is found, it throws `BadRequestException` returning HTTP `400 BAD REQUEST` with message `"Department does not exist"`.
   - On match, the user record stores the department's exact canonical spelling.
   - Self-registration (`AuthService.register`) allows the default `"Not assigned"` placeholder without throwing an error.

---

## 4. API Endpoints & Contracts

### 4.1 List All Departments
- **Path:** `GET /api/departments`
- **Security:** Authenticated (Bearer JWT)
- **Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Engineering",
    "code": "ENG",
    "description": "Core platform engineering, cloud infrastructure, security architectures, and microservices.",
    "headName": "Alexander Hayes",
    "headEmail": "alexander.hayes@employeehub.com",
    "headAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "budget": "$2.4M",
    "location": "Building A, Floor 4",
    "color": "#2563EB",
    "employeeCount": 2,
    "createdAt": "2026-11-20T10:00:00Z",
    "updatedAt": "2026-11-20T10:00:00Z"
  }
]
```

### 4.2 Get Department by ID
- **Path:** `GET /api/departments/{id}`
- **Security:** Authenticated (Bearer JWT)
- **Response:** `200 OK`

### 4.3 Create Department
- **Path:** `POST /api/departments`
- **Security:** `ADMIN` or `HR`
- **Request Body:**
```json
{
  "name": "Quality Assurance",
  "code": "QA",
  "description": "Software testing, automated verification, and performance engineering.",
  "headName": "Vikram Singh",
  "headEmail": "vikram.singh@employeehub.com",
  "headAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "budget": "$600K",
  "location": "Building A, Floor 1",
  "color": "#10B981"
}
```
- **Response:** `201 CREATED`

### 4.4 Update Department
- **Path:** `PUT /api/departments/{id}`
- **Security:** `ADMIN` or `HR`
- **Request Body:** Same schema as Create.
- **Response:** `200 OK`

### 4.5 Delete Department
- **Path:** `DELETE /api/departments/{id}`
- **Security:** `ADMIN` only
- **Response:**
  - `204 NO CONTENT` (if department has 0 employees)
  - `409 CONFLICT` (if department has >= 1 employees: `"Cannot delete a department that still has employees. Move them first."`)

---

## 5. Startup Seeder & One-Time Migration

The module includes two idempotent runners:

1. **`DepartmentSeeder` (`@Order(1)`):**
   - Runs on startup. If the `departments` table is empty, seeds the 7 standard company departments:
     - `Engineering` (code `ENG`)
     - `Product & Design` (code `PRD`)
     - `Marketing` (code `MKT`)
     - `Human Resources` (code `HRD`)
     - `Finance & Operations` (code `FIN`)
     - `Sales & Partnerships` (code `SLS`)
     - `Support` (code `SUP`)

2. **`DepartmentMigrationRunner` (`@Order(2)`):**
   - Normalizes existing user rows with legacy department names to canonical department names:
     - `"HR"` &rarr; `"Human Resources"`
     - `"Finance"` &rarr; `"Finance & Operations"`
     - `"Operations"` &rarr; `"Finance & Operations"`
     - `"Sales"` &rarr; `"Sales & Partnerships"`
     - `"Engineering"` and `"Support"` remain as they are.
   - Idempotent: once migrated, subsequent restarts perform 0 updates.
   - Logs warning if any user record has an unrecognized department name.

---

## 6. Cross-Module Usage

- **`UserService` (`com.sec.team2.ems.user`):**
  - Uses `DepartmentRepository.findByNameIgnoreCase()` to validate department existence and normalize casing upon creating or updating employee accounts.
- **`UserRepository` (`com.sec.team2.ems.user`):**
  - Exposes `countByDepartmentIgnoreCase(department)` and `@Modifying updateDepartmentName(oldName, newName)` used by `DepartmentService`.
- **Frontend (`team2-dashboard`):**
  - Can map directly from `/api/departments` to the `Department` model in `department.model.ts` with matching property names (`name`, `code`, `description`, `headName`, `headEmail`, `headAvatar`, `budget`, `location`, `color`, `employeeCount`).

