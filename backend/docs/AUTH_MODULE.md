# Authentication & Security Module (Backend)

**Package:** `com.sec.team2.ems.auth`  
**Base URL:** `/api/auth`  
**Owner:** Viknesh S R (SEC – Team 2)  

---

## 1. Overview & What JWT Is

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information is digitally signed using a secret key (HMAC-SHA256).

In our Employee Management System:
- **Stateless Authentication:** The backend does not maintain server-side sessions. Each request carries a signed token in the `Authorization: Bearer <token>` header.
- **Self-Contained Claims:** The token payload carries identity and authority claims (`sub`, `name`, `role`, `iat`, `exp`), enabling client-side expiration checks and immediate server-side role verification.
- **Tamper-Proof:** Any modification to the header or payload invalidates the cryptographic signature, causing immediate rejection.

---

## 2. Step-by-Step Login & Request Flow

```
[ Angular Browser ]
      │  
      │  1. POST /api/auth/login { email, password }
      ▼
[ SecurityConfig ]  ── (Permits /auth/** without token)
      │
      ▼
[ AuthController ]  ── Validates @Valid LoginRequest
      │
      ▼
[ AuthService ]     ── Queries UserRepository.findByEmailIgnoreCase()
      │             ── Compares password with PasswordEncoder.matches() (BCrypt)
      │             ── Checks status != INACTIVE
      │             ── Calls JwtService.generateToken()
      ▼
[ Angular Browser ] ◄─ Returns 200 OK { token, user: { id, name, role, ... } }
      │
      │  Stores token in localStorage ('employeehub_token')
      │  2. Subsequent Request: GET /api/users
      │     Header: Authorization: Bearer <token>
      ▼
[ JwtAuthenticationFilter ]
      │  Reads Bearer token
      │  JwtService.isTokenValid() verifies HMAC signature & expiration
      │  Extracts email, verifies status != INACTIVE
      │  Builds UsernamePasswordAuthenticationToken with authority "ROLE_" + role
      │  Populates SecurityContextHolder
      ▼
[ Method Security (@PreAuthorize) ]
      │  Checks user's role against endpoint requirements
      ▼
[ UserController ]  ── Executes business logic and returns response
```

---

## 3. Token Payload & Claims

The JWT token contains three parts: `Header.Payload.Signature`.

### Decoded Payload Example:
```json
{
  "sub": "admin@ems.com",
  "name": "System Admin",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700007200
}
```

- `sub`: User email address (principal subject).
- `name`: User's full display name.
- `role`: Role string (`ADMIN`, `HR`, or `EMPLOYEE` — without `ROLE_` prefix, exactly as expected by the Angular frontend).
- `iat`: Issued-at Unix timestamp (in seconds).
- `exp`: Expiration Unix timestamp (in seconds, 120 minutes by default).

---

## 4. Security Rules & Endpoint Matrix

| Method | Endpoint | Allowed Roles / Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | **Permit All** (Public) | User authentication returning JWT and user profile |
| `POST` | `/api/auth/register` | **Permit All** (Public) | Self-registration (creates `EMPLOYEE` role with `ACTIVE` status) |
| `GET` | `/api/health` | **Permit All** (Public) | Health check ping |
| `OPTIONS` | `/**` | **Permit All** (Public) | Preflight CORS checks |
| `GET` | `/api/users` | Any Authenticated (`ADMIN`, `HR`, `EMPLOYEE`) | List employee directory |
| `GET` | `/api/users/{id}` | Any Authenticated (`ADMIN`, `HR`, `EMPLOYEE`) | View employee profile |
| `POST` | `/api/users` | `ADMIN`, `HR` | Add new employee |
| `PUT` | `/api/users/{id}` | `ADMIN`, `HR` | Update employee profile details |
| `PATCH` | `/api/users/{id}/role` | `ADMIN` only | Modify system access role |
| `PATCH` | `/api/users/{id}/status`| `ADMIN` only | Modify account status |
| `DELETE` | `/api/users/{id}` | `ADMIN` only | Deactivate employee (soft delete) |

---

## 5. Error Responses

All authentication and authorization errors return standard JSON in the `ApiError` format.

### 401 Unauthorized (Missing or Invalid Token)
```json
{
  "timestamp": "2026-11-19T10:15:30.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 401 Unauthorized (Invalid Login Credentials)
```json
{
  "timestamp": "2026-11-19T10:15:30.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

### 401 Unauthorized (Inactive User Account)
```json
{
  "timestamp": "2026-11-19T10:15:30.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "This account is inactive. Please contact your administrator."
}
```

### 403 Forbidden (Insufficient Role Permissions)
```json
{
  "timestamp": "2026-11-19T10:15:30.123Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```

---

## 6. Frontend Interceptor & Route Guards Integration

1. **`AuthInterceptor` (`core/interceptors/auth.interceptor.ts`):**
   - Automatically intercepts outgoing HTTP requests to `http://localhost:8080/api`.
   - Attaches `Authorization: Bearer <token>` for all protected endpoints.
   - On `401 Unauthorized`: Calls `authService.logout()` and redirects to `/login?sessionExpired=true`.
   - On `403 Forbidden`: Redirects user directly to `/forbidden`.
2. **`authGuard` (`core/guards/auth.guard.ts`):**
   - Verifies token existence and calls `isTokenExpired(token)`.
   - Redirects unauthenticated users to `/login`.
3. **`scheduleAutoLogout` (`core/services/auth.service.ts`):**
   - Reads the token's `exp` claim and sets a background timer to log the user out seamlessly when the token expires.

---

## 7. Pre-Configured Demo Accounts (`DemoAccountsRunner`)

When `app.seed-demo-accounts=true` in `application.properties`, the application automatically provisions three development accounts on startup (passwords are BCrypt-hashed):

| Role | Email | Password (Dev Only) | Name | Department | Designation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ADMIN` | `admin@employeehub.com` | `admin123` | Alexander Hayes | Engineering | VP of Engineering |
| `HR` | `hr@employeehub.com` | `hr123` | Sarah Jenkins | HR | HR Manager |
| `EMPLOYEE` | `employee@employeehub.com` | `emp123` | Liam O'Connor | Engineering | Software Engineer |

In addition, the database includes `admin@ems.com` with password `Welcome@123`.

---

## 8. How to Change the JWT Secret

The signing secret is configured in `application.properties`:
```properties
app.jwt.secret=${JWT_SECRET:ems-dev-only-secret-change-me-0123456789-abcdefghij}
app.jwt.expiration-minutes=120
```

To override the secret for production or testing environments without modifying code:
1. **Environment Variable:** Set `JWT_SECRET=your-secure-production-secret-at-least-32-characters` in your system or container environment.
2. **Local Properties:** Add `JWT_SECRET=...` inside `application-local.properties` (which is excluded from Git).

