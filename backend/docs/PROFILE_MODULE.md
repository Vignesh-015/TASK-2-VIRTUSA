# Profile Module (Backend)

**Package:** `com.sec.team2.ems.profile`  
**Base URL:** `/api/profile`  
**Owner:** Sivasakthi A (SEC – Team 2)  

---

## 1. Overview & Architectural Design

The Profile module provides self-service identity, contact management, and password modification for all authenticated employees (`ADMIN`, `HR`, `EMPLOYEE`).

### Core Design Decisions:
1. **Context-Driven Identity (No ID in URL):**  
   Endpoints operate strictly on `/api/profile/me` and `/api/profile/change-password`. The active employee identity is never passed as a path variable or request parameter; instead, it is securely resolved from the email claim embedded within the validated JWT stored in the Spring Security context (`SecurityContextHolder`).
2. **Access Control:**  
   Every method is guarded with `@PreAuthorize("isAuthenticated()")`. Any authenticated employee can view and update their own details and change their password.
3. **Strict Separation of Concerns:**  
   Employees are permitted to edit only personal contact, bio, skills, and emergency contact details. Administrative and organizational fields (`email`, `role`, `department`, `designation`, `employeeCode`, `joinedOn`, `managerName`, `employmentType`, `status`) remain strictly read-only through this endpoint to safeguard enterprise governance.
4. **Targeted HTTP Error Semantics:**  
   Password verification failures and input validation errors return **HTTP 400 Bad Request** (rather than HTTP 401), ensuring that the frontend HTTP interceptor does not misinterpret a mistyped password as an expired token or trigger an unwanted session logout.

---

## 2. Field Permissions: Editable vs. Read-Only

| Field | Modifiable via `/profile/me`? | Justification |
| :--- | :---: | :--- |
| `firstName` | **Yes** | Personal name update (recomputes `fullName`) |
| `lastName` | **Yes** | Personal name update (recomputes `fullName`) |
| `phone` | **Yes** | Direct phone number updates |
| `workLocation` | **Yes** | Remote / hybrid / office base location preferences |
| `skills` | **Yes** | Professional competency inventory |
| `bio` | **Yes** | Personal professional summary |
| `emergencyContactName` | **Yes** | Workplace health and safety emergency contact |
| `emergencyContactRelation` | **Yes** | Workplace health and safety emergency relation |
| `emergencyContactPhone` | **Yes** | Workplace health and safety emergency phone |
| `email` | **No (Read-Only)** | Primary authentication principal; changing email requires admin audit |
| `role` | **No (Read-Only)** | Managed exclusively by Admins in the Users module |
| `status` | **No (Read-Only)** | Managed exclusively by Admins in the Users module |
| `department` | **No (Read-Only)** | Managed by HR/Admin in organizational structure |
| `designation` | **No (Read-Only)** | Official job title assigned by HR |
| `employeeCode` | **No (Read-Only)** | Unique corporate identifier generated at onboarding |
| `joinedOn` | **No (Read-Only)** | Historical audit record of hiring date |
| `employmentType` | **No (Read-Only)** | Contractual categorization (Full Time, Contract, Intern) |
| `managerName` | **No (Read-Only)** | Corporate reporting line managed by HR |

---

## 3. Endpoints Specification

### 3.1 GET `/api/profile/me`
Retrieves the full profile of the currently logged-in user.

- **Headers:** `Authorization: Bearer <token>`
- **Response: 200 OK**
```json
{
  "id": 1,
  "employeeCode": "EMP-1007",
  "firstName": "Liam",
  "lastName": "O'Connor",
  "fullName": "Liam O'Connor",
  "email": "employee@employeehub.com",
  "phone": "9876543210",
  "department": "Engineering",
  "designation": "Staff Frontend Architect",
  "joinedOn": "2023-04-11",
  "status": "ACTIVE",
  "employmentType": "FULL_TIME",
  "workLocation": "Boston, MA (Hybrid)",
  "managerName": "Executive Leadership",
  "skills": "Angular, TypeScript, SCSS, RxJS",
  "bio": "Staff Frontend Architect focusing on scalable UI architectures.",
  "role": "EMPLOYEE",
  "emergencyContactName": "Sarah Connor",
  "emergencyContactRelation": "Spouse",
  "emergencyContactPhone": "9876543211"
}
```

---

### 3.2 PUT `/api/profile/me`
Updates editable personal details. Recomputes `fullName` automatically by trimming `firstName + " " + lastName`.

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Sample Request:**
```json
{
  "firstName": "Liam",
  "lastName": "O'Connor",
  "phone": "+91 9876543210",
  "workLocation": "Chennai (Hybrid)",
  "skills": "Angular 17, Java 17, Spring Boot 3, RxJS",
  "bio": "Senior frontend specialist and full stack enthusiast.",
  "emergencyContactName": "Mary O'Connor",
  "emergencyContactRelation": "Sister",
  "emergencyContactPhone": "9876543212"
}
```
- **Validation Rules:**
  - `firstName`: `@NotBlank`, 2 to 50 characters.
  - `lastName`: `@NotBlank`, 1 to 50 characters.
  - `phone`: `@NotBlank`, `@Pattern("^(\\+91[ -]?)?[0-9]{10}$")`.
  - `workLocation`: Optional, max 100 characters.
  - `skills`: Optional, max 500 characters.
  - `bio`: Optional, max 1000 characters.
  - `emergencyContactName`: Optional, max 100 characters.
  - `emergencyContactRelation`: Optional, max 50 characters.
  - `emergencyContactPhone`: Optional, empty or `@Pattern("^(\\+91[ -]?)?[0-9]{10}$")`.
- **Response: 200 OK** (returns updated `ProfileResponse`).

---

### 3.3 POST `/api/profile/change-password`
Changes the user's password after validating business constraints.

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Sample Request:**
```json
{
  "currentPassword": "emp123",
  "newPassword": "Emp@12345",
  "confirmPassword": "Emp@12345"
}
```
- **Password Rules:**
  1. `newPassword` and `confirmPassword` must match exactly; otherwise **400 "New password and confirmation do not match"**.
  2. `currentPassword` must match the stored BCrypt hash; otherwise **400 "Current password is incorrect"**.
  3. `newPassword` must differ from the current password; otherwise **400 "New password must be different from the current password"**.
  4. `newPassword` format: minimum 8 characters, maximum 64 characters, must include at least one letter and one number (`^(?=.*[a-zA-Z])(?=.*\\d).+$`).
- **Response: 200 OK**
```json
{
  "message": "Password changed successfully"
}
```

---

## 4. Error Responses

### 4.1 Missing or Expired Token (401 Unauthorized)
When an endpoint is accessed without a valid Bearer token:
```json
{
  "timestamp": "2026-11-19T18:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 4.2 Current Password Incorrect (400 Bad Request)
```json
{
  "timestamp": "2026-11-19T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Current password is incorrect"
}
```

### 4.3 Confirmation Mismatch (400 Bad Request)
```json
{
  "timestamp": "2026-11-19T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "New password and confirmation do not match"
}
```

### 4.4 Same as Current Password (400 Bad Request)
```json
{
  "timestamp": "2026-11-19T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "New password must be different from the current password"
}
```

### 4.5 Validation Failure: Weak Password (400 Bad Request)
```json
{
  "timestamp": "2026-11-19T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "newPassword: Password must be at least 8 characters and include a letter and a number",
  "fieldErrors": {
    "newPassword": "Password must be at least 8 characters and include a letter and a number"
  }
}
```

---

## 5. Known Limitation & Future Improvement

### Known Limitation: Stateless Token Invalidation
Because JWTs are completely stateless and self-contained, a JWT issued prior to a password change remains cryptographically valid until its scheduled expiration (24 hours). If an unauthorized actor captures an active token before the legitimate owner changes their password, that token continues to be accepted until it expires naturally.

### Recommended Future Improvement:
Add a `passwordChangedAt` timestamp column to the `users` table. Whenever `changePassword()` succeeds, update this column with `Instant.now()`. In `JwtAuthenticationFilter`, compare the token's issued-at timestamp (`iat`) against `user.getPasswordChangedAt()`; if the token was issued before the password change, reject the request with HTTP 401.

