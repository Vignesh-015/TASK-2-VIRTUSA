# PROJECT CONTEXT — SEC Team 2

## Project Background
- **Project:** Employee Management System, a college group mini project (SEC - Team 2).
- **Topic:** "Build a Small Dashboard using Router with Security Authentication".
- **Architecture:** Frontend is Angular (NgModule-based, lazy-loaded feature modules). Backend is meant to be Spring Boot with Spring Security and JWT. Frontend and backend live in sibling folders in the same repo (`team2-dashboard/` and `backend/`, if it exists).
- **Team:** Viknesh S R, Yuvashree R H, Vigneshwaran R, Vetriselvi M, Sivasakthi A. Each member owns one module with both a frontend and a backend part: Authentication and security, Dashboard, Layout and user management, Reports and analytics, Profile and role-based access.
- **Locked Project Decisions (do not change):**
  - Roles are `ADMIN`, `HR`, and `EMPLOYEE` everywhere.
  - The user's display name field in the Users module is `fullName` and the join date is `joinedOn`.
  - The API base URL is `http://localhost:8080/api`.
- **Design Rules:** LIGHT theme only, one accent colour, 1px borders, small radius, system fonts, and a plain internal-company-tool look. Never AI-generated: no gradients, glassmorphism, glow, emoji, heavy shadows, big pill shapes, or dark mode.

---

## 1. Folder Structure

- **Backend (`backend/src/main/java/com/sec/team2/ems/`):**
  - `config/`: `CorsConfig.java`, `SecurityConfig.java`
  - `common/`: `Role.java`, `ApiError.java`, `ResourceNotFoundException.java`, `DuplicateResourceException.java`, `BusinessRuleException.java`, `GlobalExceptionHandler.java`
  - `health/`: `HealthController.java` (`GET /api/health`)
  - `user/`: `User.java`, `UserStatus.java`, `UserRepository.java`, `UserRequest.java`, `UserResponse.java`, `UserMapper.java`, `UserService.java`, `UserController.java`, `UserDataSeeder.java`
  - `auth/`, `dashboard/`, `report/`, `profile/`: Package spaces reserved for teammates
  - `resources/`: `application.properties`, `application-h2.properties`, `application-local.properties.example`
- **Frontend (`team2-dashboard/src/app/`, 3 levels deep):**

```text
src/app/
├── core/                       # App-wide singletons, models, guards, HTTP interceptor
│   ├── guards/                 # Functional route guards (auth, guest, role)
│   ├── interceptors/           # HTTP interceptor attaching JWT Bearer header
│   ├── models/                 # Core TypeScript interfaces and role/status types
│   ├── services/               # Root-provided services (auth, employee, department, dashboard, notification)
│   └── utils/                  # Client-side JWT base64url decode & expiry helpers
├── features/                   # Lazy-loaded feature modules
│   ├── auth/                   # Login & registration UI (login/, register/)
│   ├── dashboard/              # Role-aware dashboard (dashboard-home/, components/)
│   ├── departments/            # Department cards & CRUD modal (department-list/)
│   ├── employees/              # Employee directory table/grid & modals (employee-list/)
│   ├── profile/                # Personal profile view & edit form (profile/)
│   ├── reports/                # Reports placeholder page (reports/)
│   └── users/                  # Users CRUD module (models/, services/, user-list/, user-form/)
├── layout/                     # Shell layouts wrapping routed views
│   ├── app-layout/             # Authenticated sidebar + topbar shell
│   └── public-layout/          # Public header/footer shell for auth routes
├── pages/                      # Standalone error/status route pages
│   ├── forbidden/              # 403 Forbidden page
│   └── not-found/              # 404 Not Found page
└── shared/                     # Reusable UI components & pipes exported via SharedModule
    ├── components/             # avatar/, confirm-dialog/, modal/, pagination/, stat-card/, status-badge/, toast-container/
    └── pipes/                  # time-ago.pipe.ts
```

---

## 2. Tech and Versions

- **Angular:** `^17.3.0` (`@angular/core`, `common`, `compiler`, `forms`, `router`, `animations`, `platform-browser`, `platform-browser-dynamic`); `@angular/cli` / `@angular-devkit/build-angular` `^17.3.17` (`team2-dashboard/package.json`).
- **TypeScript:** `~5.4.2` (`package.json`), `target`/`module: ES2022`, `strict: true` (`tsconfig.json`).
- **Node:** `v22.21.0` observed in local environment (`node -v`); not pinned in `package.json` (`README.md` notes `v18+` or `v20+`).
- **Runtime Libraries (`package.json`):** `rxjs` `~7.8.0`, `tslib` `^2.3.0`, `zone.js` `~0.14.3`. No external UI/CSS framework.
- **Test/Dev Libraries (`package.json`):** `jasmine-core` `~5.1.0`, `karma` `~6.4.0`, `karma-chrome-launcher` `~3.2.0`, `karma-coverage` `~2.2.0`, `karma-jasmine` `~5.1.0`, `karma-jasmine-html-reporter` `~2.1.0`, `@types/jasmine` `~5.1.0`.
- **Spring Boot / Java / Database:** Java 17 LTS, Spring Boot 3.5.16 (`backend/pom.xml`), Spring Data JPA, Hibernate, Validation, Spring Security, MySQL Connector/J (default), H2 in-memory (optional `h2` profile), Lombok.

---

## 3. Routing Map

Defined in `team2-dashboard/src/app/app-routing.module.ts` and feature `*-routing.module.ts` files:

| Path | Target / Lazy Module | Layout | Guards | Allowed Roles | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Redirects to `/login` | — | — | Public | `pathMatch: 'full'` |
| `/login`, `/register` | `AuthModule` (`LoginComponent` on `''`, `'login'`, `'register'`) | `PublicLayoutComponent` | `guestGuard` | Unauthenticated | `/auth` redirects to `login` |
| `/dashboard` | `DashboardModule` -> `DashboardHomeComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard`, `roleMatchGuard` | `ADMIN`, `HR`, `EMPLOYEE` | Renders role-specific view |
| `/employees` | `EmployeesModule` -> `EmployeeListComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard`, `roleMatchGuard` | `ADMIN`, `HR` | Table + grid + modals |
| `/departments` | `DepartmentsModule` -> `DepartmentListComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard`, `roleMatchGuard` | `ADMIN`, `HR` | Card grid + modals |
| `/users` | `UsersModule` -> `UserListComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard` | `ADMIN`, `HR` (in component) | Redirects `EMPLOYEE` to `/forbidden` in `ngOnInit` |
| `/users/new`, `/users/:id/edit` | `UsersModule` -> `UserFormComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard` | `ADMIN`, `HR` (in component) | Redirects `EMPLOYEE` to `/forbidden` in `ngOnInit` |
| `/profile` | `ProfileModule` -> `ProfileComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard` | All authenticated | Self-service profile |
| `/forbidden` | `ForbiddenComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard` | All authenticated | 403 page |
| `/not-found`, `**` | `NotFoundComponent` | None | None | Any | 404 page |
| `/reports` | `ReportsModule` -> `ReportsComponent` | `AppLayoutComponent` | `authGuard`, `authChildGuard`, `roleMatchGuard` | `ADMIN`, `HR` | Complete with department, status, & monthly join charts + date filter |

---

## 4. Design System

- **Primary Tokens (`team2-dashboard/src/styles.scss`, `:root`):**
  - Colours: `--color-bg: #F8FAFC`, `--color-surface: #FFFFFF`, `--color-surface-muted: #F1F5F9`, `--color-border: #E2E8F0`, `--color-border-subtle: #F1F5F9`, `--color-primary-navy: #172B4D`, `--color-primary-blue: #2563EB`, `--color-primary-blue-hover: #1D4ED8`, `--color-primary-blue-light: #EFF6FF`, `--color-primary-blue-subtle: #DBEAFE`, `--color-text-main: #0F172A`, `--color-text-heading: #172B4D`, `--color-text-body: #334155`, `--color-text-muted: #64748B`, `--color-text-light: #94A3B8`.
  - Semantic: `--color-success: #059669` (`-bg: #ECFDF5`, `-border: #A7F3D0`, `-text: #065F46`), `--color-warning: #D97706` (`-bg: #FFFBEB`, `-border: #FDE68A`, `-text: #92400E`), `--color-danger: #DC2626` (`-bg: #FEF2F2`, `-border: #FECACA`, `-text: #991B1B`), `--color-info: #0284C7` (`-bg: #F0F9FF`, `-border: #BAE6FD`, `-text: #075985`).
  - Fonts: `--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`, `--font-heading: 'DM Sans', var(--font-family)`.
  - Spacing & Radius: `--space-0-5` (`2px`) to `--space-12` (`48px`); `--radius-xs: 4px`, `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-xl: 16px`, `--radius-full: 9999px`.
- **Legacy SCSS Tokens (`team2-dashboard/src/styles/_variables.scss`):** `$color-bg: #F6F4EF`, `$color-surface: #FFFFFF`, `$color-border: #E3E7EB`, `$color-text: #222831`, `$color-text-muted: #6B7280`, `$color-accent: #2457A6`, `$color-success: #1B7F48`, `$color-danger: #B3412E`, `$space-1`..`$space-7` (`4px`..`48px`), `$radius-sm: 4px`, `$radius-md: 6px`, `$font-body`.
- **Global Classes (`styles.scss`):** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.form-group`, `.form-label` (`.required`), `.form-control`, `.form-select`, `.is-invalid`, `.form-error`, `.form-hint`, `.card` (`.card-header`, `.card-body`, `.card-footer`), `.badge` (`.badge-dot`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-neutral`, `.badge-primary`), `.table-container`, `.table`, `.sr-only`.
- **Shared Components (`src/app/shared/shared.module.ts`):**
  - `AvatarComponent` (`app-avatar`): Inputs `src?`, `name`, `size ('xs'|'sm'|'md'|'lg'|'xl')`, `showStatus`, `status?`.
  - `StatusBadgeComponent` (`app-status-badge`): Inputs `status`, `type ('status'|'role'|'employmentType')`, `showDot`.
  - `StatCardComponent` (`app-stat-card`): Inputs `title`, `value`, `subtitle?`, `trendText?`, `trendPositive`, `iconClass`, `isLoading`; `[icon]` slot.
  - `PaginationComponent` (`app-pagination`): Inputs `total`, `page`, `pageSize`; Output `pageChange`.
  - `ModalComponent` (`app-modal`): Inputs `isOpen`, `title`, `subtitle?`, `size ('sm'|'md'|'lg'|'xl')`, `showFooter`, `closeOnBackdrop`; Output `closeDialog`; `[body]`/`[footer]` slots.
  - `ConfirmDialogComponent` (`app-confirm-dialog`): Inputs `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `isDanger`, `isLoading`; Outputs `confirmed`, `cancelled` (closes on `Esc` + backdrop).
  - `ToastContainerComponent` (`app-toast-container`): renders `NotificationService.toasts$`.
  - `TimeAgoPipe` (`timeAgo`).
  - `PageHeaderComponent` (`app-page-header`): **NOT FOUND**.
- **Rule:** Reuse these; never add new colours or new styling approaches.

---

## 5. Core Services and Models

- **Services:**
  - `AuthService` (`core/services/auth.service.ts`): `currentUser`, `currentRole`, `getToken()`, `getRememberedEmail()`, `isLoggedIn()`, `isAdmin()`, `isHr()`, `isEmployee()`, `hasRole()`, `login()`, `register()`, `loginWithDemoAccount()`, `updateProfile()`, `logout()`. Mock flag: `environment.useMockApi` (`src/environments/environment.ts`).
  - `EmployeeService` (`core/services/employee.service.ts`): `getEmployees()`, `getAllEmployees()`, `getEmployeeById()`, `getEmployeeByEmail()`, `addEmployee()`, `updateEmployee()`, `deleteEmployee()`, `getDashboardStats()`. Mock-only (`localStorage` key `employeehub_employees_v2`, 24 seeded records; no `HttpClient`).
  - `DepartmentService` (`core/services/department.service.ts`): `getDepartments()`, `getDepartmentById()`, `addDepartment()`, `updateDepartment()`, `deleteDepartment()`, `recalculateHeadcounts()`. Mock-only (`localStorage` key `employeehub_departments_v2`, 6 seeded records; no `HttpClient`).
  - `DashboardService` (`core/services/dashboard.service.ts`): `getStats()`, `getDepartmentCounts()`, `getRecentActivity()`. Mock flag: `environment.useMockApi` (`src/environments/environment.ts`). Currently unused by `DashboardHomeComponent`.
  - `NotificationService` (`core/services/notification.service.ts`): `showToast()`, `success()`, `error()`, `warning()`, `info()`, `removeToast()`, `unreadCount`, `markAsRead()`, `markAllAsRead()`. In-memory + `localStorage` (`employeehub_notifications`).
  - `UserService` (`features/users/services/user.service.ts`): `setNotice()`, `consumeNotice()`, `isEmailTaken()`, `getUsers()`, `getUserById()`, `addUser()`, `updateUser()`, `deleteUser()`. Mock flag: `private readonly useMock = true` at top of `user.service.ts` (12 seeded Indian employee records in memory).
- **Models & Enums:**
  - `core/models/user.model.ts`: `UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE'`; `User` (`id`, `name`, `email`, `role`, `avatar?`, `employeeId?`, `department?`, `designation?`, `phone?`, `joinDate?`, `location?`, `status?: 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE'`).
  - `core/models/auth.model.ts`: `LoginRequest` (`email`, `password`, `rememberMe?`), `RegisterRequest` (`name`, `email`, `password`, `role`, `department?`), `LoginResponse` (`token`, `user`).
  - `core/models/employee.model.ts`: `EmployeeStatus = 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE'`; `EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'`; `EmergencyContact`; `Employee`; `EmployeeFilter`.
  - `core/models/department.model.ts`: `Department` (`id`, `code`, `name`, `description`, `headName`, `headEmail`, `headAvatar?`, `employeeCount`, `budget?`, `location?`, `color?`).
  - `core/models/dashboard.model.ts`: `DashboardStats` (`totalUsers`, `activeUsers`, `inactiveUsers`, `departments`, `onLeave`), `DepartmentCount`, `ActivityType`, `ActivityItem`.
  - `core/models/notification.model.ts`: `AppNotification`, `ToastMessage`.
  - `features/users/models/user.model.ts`: imports/re-exports `UserRole` from `core/models/user.model.ts`; `UserStatus = 'ACTIVE' | 'INACTIVE'`; `USER_DEPARTMENTS`; `User` (`id`, `fullName`, `email`, `phone`, `department`, `role`, `status`, `joinedOn`); `UserNotice`.
- **DUPLICATE / CONFLICTING Definitions:**
  - Two different `User` interfaces: `core/models/user.model.ts` (`name`, `joinDate`, 4 statuses) vs `features/users/models/user.model.ts` (`fullName`, `joinedOn`, 2 statuses).
  - `DashboardStats` (`core/models/dashboard.model.ts`) does not match `EmployeeService.getDashboardStats()` return object (`totalEmployees`, `activeEmployees`, `newJoinersCount`, `totalDepartments`, `departmentBreakdown`, `statusBreakdown`, `recentEmployees`).
  - Department names conflict: `DepartmentService` (`Product & Design`, `Marketing`, `Human Resources`, `Finance & Operations`, `Sales & Partnerships`) vs `USER_DEPARTMENTS` (`Engineering`, `HR`, `Finance`, `Sales`, `Operations`, `Support`).

---

## 6. Authentication State

- **Login / Register:** In mock mode (`environment.useMockApi = true`), `AuthService` checks 3 demo accounts (`admin@employeehub.com`, `hr@employeehub.com`, `employee@employeehub.com`) plus `localStorage` (`employeehub_registered_users`), creates an unsigned mock JWT (`header.payload.signature`, 120-minute `exp`), and stores token/user in `localStorage` (`employeehub_token`, `employeehub_user`, `employeehub_remember_email`). Real mode calls `HttpClient` `/auth/login` and `/auth/register`.
- **Session & Logout:** `restoreSession()` restores `currentUserSubject` on startup if token exists and `!isTokenExpired(token)`. `scheduleAutoLogout(token)` sets a `setTimeout` until `exp`. `logout()` clears `localStorage` token/user and navigates to `/login`.
- **JWT & Interceptor:** `jwt.util.ts` decodes base64url payload only (no signature verification). `AuthInterceptor` attaches `Authorization: Bearer <token>` to requests starting with `environment.apiUrl` (excluding `/login`, `/register`, `/auth/login`, `/auth/register`), redirects `401` to `/login?sessionExpired=true`, and `403` to `/forbidden`.
- **Guards & Role Checks:** `authGuard`/`authChildGuard` enforce login; `guestGuard` keeps logged-in users off `/login` & `/register`; `roleGuard`/`roleMatchGuard` check `route.data['roles']`. `UsersModule` uses `users.permissions.ts` (`canViewUsers`, `canAddOrEditUsers`, `canDeleteUsers`).

---

## 7. Module Status Table

| Module | Frontend Status | Backend Status | Key Files | Owner (from git log) |
| :--- | :--- | :--- | :--- | :--- |
| Auth | DONE (mock + HTTP client ready) | IMPLEMENTED (JWT, login, register, security filter, role rules) | `features/auth/login/*`, `core/services/auth.service.ts`, `backend/src/main/java/com/sec/team2/ems/auth/*`, `backend/src/main/java/com/sec/team2/ems/config/SecurityConfig.java` | YUVASHREE R H (`6d88b6f`, `516c582`); Vignesh-015 (`1bc2347`) |
| Dashboard | DONE (connected to DepartmentService & EmployeeService, live metrics & distribution) | MISSING | `features/dashboard/dashboard-home/*`, `core/services/dashboard.service.ts` | YUVASHREE R H (`6d88b6f`, `516c582`); Vignesh-015 (`1bc2347`) |
| Users | DONE (useMock=false, real REST API, access-only management) | IMPLEMENTED (unified with employee fields) | `team2-dashboard/src/app/features/users/*`, `backend/src/main/java/com/sec/team2/ems/user/*` | Vignesh-015 (`ef76182`, `554d4c7`) |
| Reports | PLACEHOLDER (unrouted) | MISSING | `features/reports/reports/*`, `features/reports/reports.module.ts` | Vignesh-015 (`1bc2347`) |
| Profile | DONE (connected to /api/profile REST API, Change Password tab, useMock=false) | IMPLEMENTED (GET/PUT /api/profile/me, POST /change-password) | `features/profile/*`, `backend/src/main/java/com/sec/team2/ems/profile/*` | YUVASHREE R H (`6d88b6f`); Vignesh-015 (`1bc2347`) |
| Employees | DONE (EmployeeService connected to /api/users, useMock=false) | UNIFIED (backend `users` table serves as employee source) | `features/employees/*`, `core/services/employee.service.ts` | YUVASHREE R H (`6d88b6f`, `516c582`) |
| Departments | DONE (connected to `/api/departments`, cached, useMock=false) | IMPLEMENTED (`/api/departments` CRUD, live employee count, cascade rename, seeder & migration) | `features/departments/*`, `backend/src/main/java/com/sec/team2/ems/department/*` | YUVASHREE R H (`6d88b6f`, `516c582`) |
| Layout | DONE | N/A | `layout/app-layout/*`, `layout/public-layout/*` | YUVASHREE R H (`6d88b6f`, `516c582`); Vignesh-015 (`1bc2347`) |
| Role-based access | DONE (guards + `users.permissions.ts`) | MISSING | `core/guards/*`, `pages/forbidden/*`, `features/users/users.permissions.ts` | YUVASHREE R H (`6d88b6f`, `516c582`); Vignesh-015 (`1bc2347`, `ef76182`) |

*(Note: Individual names Viknesh S R, Vetriselvi M, and Sivasakthi A do not appear as git commit authors — **NOT FOUND** in `git log`.)*

---

## 8. API Contract

Base URL from `environment.ts`: `http://localhost:8080/api`. The `/api/users` endpoints are **IMPLEMENTED** in Spring Boot; remaining endpoints are pending assignment to teammates.

| Method | Full Path | Request Body | Response Body | Source File |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{ email, password, rememberMe? }` | `{ token, user }` | `auth.service.ts` |
| `POST` | `/api/auth/register` | `{ name, email, password, role, department? }` | `{ message, user }` | `auth.service.ts` |
| `GET` | `/api/users` | — | `UserResponse[]` (`id`, `employeeCode`, `firstName`, `lastName`, `fullName`, `email`, `phone`, `department`, `designation`, `joinedOn`, `status`, `employmentType`, `workLocation`, `managerName`, `skills`, `bio`, `role`) | `user.service.ts` / `UserController.java` |
| `GET` | `/api/users/{id}` | — | `UserResponse` | `user.service.ts` / `UserController.java` |
| `POST` | `/api/users` | `UserRequest` | `UserResponse` (role `EMPLOYEE`, `EMP-XXXX`) | `user.service.ts` / `UserController.java` |
| `PUT` | `/api/users/{id}` | `UserRequest` | `UserResponse` | `user.service.ts` / `UserController.java` |
| `PATCH` | `/api/users/{id}/role` | `RoleUpdateRequest` (`role`) | `UserResponse` | `UserController.java` |
| `PATCH` | `/api/users/{id}/status` | `StatusUpdateRequest` (`status`) | `UserResponse` | `UserController.java` |
| `DELETE` | `/api/users/{id}` | — | `void` (soft delete: status `INACTIVE`) | `user.service.ts` / `UserController.java` |
| `GET` | `/api/dashboard/stats` | — | `{ totalUsers, activeUsers, inactiveUsers, departments, onLeave }` | `dashboard.service.ts` |
| `GET` | `/api/dashboard/departments` | — | `Array<{ department, count }>` | `dashboard.service.ts` |
| `GET` | `/api/dashboard/recent` | — | `Array<{ id, message, actor, type, timestamp }>` | `dashboard.service.ts` |
| `GET` | `/api/profile/me` | — | `ProfileResponse` (self profile derived from JWT context) | `ProfileController.java` |
| `PUT` | `/api/profile/me` | `ProfileUpdateRequest` | `ProfileResponse` (updates contact, bio, skills, emergency contact) | `ProfileController.java` |
| `POST` | `/api/profile/change-password` | `ChangePasswordRequest` | `{ message }` (validates current hash & strength rules) | `ProfileController.java` |
| `GET` | `/api/departments` | — | `DepartmentResponse[]` (`id`, `name`, `code`, `description`, `headName`, `headEmail`, `headAvatar`, `budget`, `location`, `color`, `employeeCount`) | `department.service.ts` / `DepartmentController.java` |
| `GET` | `/api/departments/{id}` | — | `DepartmentResponse` | `department.service.ts` / `DepartmentController.java` |
| `POST` | `/api/departments` | `DepartmentRequest` | `DepartmentResponse` | `department.service.ts` / `DepartmentController.java` |
| `PUT` | `/api/departments/{id}` | `DepartmentRequest` | `DepartmentResponse` (cascades name change to `users.department`) | `department.service.ts` / `DepartmentController.java` |
| `DELETE` | `/api/departments/{id}` | — | `void` (`409` if has employees, `204` if empty) | `department.service.ts` / `DepartmentController.java` |
| Employees / Reports | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | Mock-only / placeholder |

---

## 9. Conventions

- **Feature Layout:** NgModule-based lazy-loaded modules under `src/app/features/<feature>/` with `<feature>.module.ts`, `<feature>-routing.module.ts`, kebab-case component directories, and `SharedModule` imported for common directives/forms/components.
- **Styling:** Component-scoped `.scss` files using `styles.scss` CSS variables (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`) and `@import 'styles/variables';` (enabled via `angular.json` `includePaths: ["src"]`). Inline outline SVGs (`stroke="currentColor" stroke-width="2" fill="none"`).
- **Forms & Validation:** Reactive forms (`FormBuilder`, `FormGroup`, `Validators`) with `.form-group`, `.form-label`, `.form-control`/`.form-select`, `[class.is-invalid]`, and `.form-error` shown after touch or submit attempt.
- **Notices / Toasts:** Global toasts via `NotificationService` + `<app-toast-container>`, or inline `.notice-bar` with 3-second auto-dismiss in `features/users`.

---

## 10. Known Issues and Mismatches

- **Backend Status:** The `backend/` directory is created with Spring Boot 3.5.16 skeleton and full `User` module implementation. Other member modules (`auth`, `dashboard`, `report`, `profile`) remain to be implemented.
- **Conflicting `User` Models & Departments:** `core/models/user.model.ts` (`name`, `joinDate`, 4 statuses) vs `features/users/models/user.model.ts` (`fullName`, `joinedOn`, 2 statuses); `DepartmentService` (6 corporate names) vs `USER_DEPARTMENTS` (6 short names).
- **Dashboard Unused Code:** `DashboardHomeComponent` uses `EmployeeService.getDashboardStats()` instead of `DashboardService` (whose `DashboardStats` fields differ); `SummaryStripComponent`, `DepartmentListComponent`, and `ActivityTimelineComponent` inside `features/dashboard/components/` are declared in `DashboardModule` but not rendered in `dashboard-home.component.html`.
- **Style Inconsistencies:** `styles.scss` uses `--color-primary-blue: #2563EB` and imports Google Fonts `DM Sans`/`Inter`, whereas `styles/_variables.scss` defines older tokens (`$color-bg: #F6F4EF`, `$color-accent: #2457A6`). `reports.component.scss` references undefined variables `--text-sm` and `--color-text`. `styles.scss` uses `--radius-full` (`9999px`) on `.badge` and `app-layout` profile button.
- **Routing / Guard Gaps:** `/users` routes rely on component-level `users.permissions.ts` redirects (`// replace with route guard in guards task`) instead of `roleMatchGuard`. `ReportsModule` and `RegisterComponent` are unrouted. `NotFoundComponent.goHome()` links to `['/auth/login']` (which redirects to `/login`).
- **Mock Flag Split:** `AuthService` and `DashboardService` use `environment.useMockApi`, while `UserService` uses its own `private readonly useMock = true`, and `EmployeeService`/`DepartmentService` have no HTTP mode.

---

## 11. Rules for Anyone Changing This Project

- Read this file and the files you will touch before writing code.
- Do not rename or move existing files, models, routes or CSS variables.
- Do not change the design, shared components, routing structure or another member's module unless the task says so. If a change in a shared file is unavoidable, list it in the task report.
- Reuse existing services, models and components instead of creating duplicates.
- Add new work inside your own feature folder, and register it with one route entry.
- Keep mock mode working until the backend for that feature is ready.
- At the end of every task, update the Module status table and add one line to the Change log.

---

## 12. Change Log

- `2026-11-12` | Initial context file generated
- `2026-11-13` | Initialized backend skeleton with Spring Boot 3, MySQL config, H2 profile, CORS, and GlobalExceptionHandler
- `2026-11-14` | Implemented User module in backend (Entity, Repository, DTOs, Service, Controller, Seeder) and connected Angular frontend (useMock=false)
- `2026-11-19` | Unified Users and Employees table: added employeeCode, names, designation, employmentType, location, manager, skills, bio; implemented soft delete, PATCH role/status, backfill runner and last-admin guards
- `2026-11-19` | Connected Employees tab to Spring Boot /api/users REST API (useMock=false); refined Users tab for access management (role and status edits, deactivation)
- `2026-11-19` | Implemented Authentication & Security backend (JWT service, filter, /api/auth/login, /api/auth/register, demo accounts runner, and method security role rules)
- `2026-11-19` | Implemented Profile backend (GET /api/profile/me, PUT /api/profile/me, POST /api/profile/change-password, emergency contact columns on User, password validation & BCrypt updates)
- `2026-11-19` | Connected Profile frontend to Spring Boot /api/profile REST API (useMock=false), added Change Password tab with client-side validation, and removed hardcoded fallbacks
- `2026-11-20` | Implemented Department backend in `com.sec.team2.ems.department` (Entity, Repository, Service, Controller, Seeder, MigrationRunner), user department validation on create/update/register, and cascade rename to users
- `2026-11-20` | Connected Departments frontend to Spring Boot /api/departments REST API (useMock=false, caching, role-based controls, backend error messages), and connected Employees & Users filters/dropdowns to DepartmentService
- `2026-11-20` | Dynamic Dashboard Department Metrics & Computed Subtitles: Connected DashboardHomeComponent to DepartmentService (source of truth, forceRefresh=true) & EmployeeService; listed every department including 0-staff units sorted by headcount desc then name asc; cycled palette; added fallback for unlisted departments; dynamic subtitles for workforce, active rate, added this month, and department allocation
- `2026-11-20` | Removed Quick Demo Access cards from login page; added subtle account help hint below Sign In; synchronized logged-in user profile in AuthService when updated via EmployeeService or UserService

