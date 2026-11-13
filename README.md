# EmployeeHub – Secure Employee Management Portal

Enterprise-grade, secure Employee Management Portal built with **Angular 17 + TypeScript**, designed with inspiration from platforms such as Linear, Workday, and BambooHR.

---

## 🌟 Demo Accounts for Evaluation

Quick one-click login cards and an in-app **Demo Role Switcher** are provided in the header to easily evaluate all role permutations:

| Role | Name | Email | Password | Access Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Alexander Hayes | `admin@employeehub.com` | `admin123` | Full access: Dashboard, Employee CRUD (including permanent deletion), Department management. |
| **HR SPECIALIST** | Sarah Jenkins | `hr@employeehub.com` | `hr123` | People Ops: Dashboard, Employee CRUD (deletion disabled), Department viewing. |
| **EMPLOYEE** | Liam O'Connor | `employee@employeehub.com` | `emp123` | Self-Service: My Profile view and edit only. Direct URL access to `/dashboard`, `/employees`, or `/departments` triggers **403 Forbidden**. |

---

## 🏗️ Architecture & Technical Concepts

- **Feature-based architecture**:
  - `core/`: Centralized authentication (`AuthService`), employee & department state (`EmployeeService`, `DepartmentService`), notification service, route guards, JWT interceptor, data models.
  - `shared/`: Reusable enterprise UI components (`Avatar`, `StatusBadge`, `StatCard`, `Pagination`, `Modal`, `ToastContainer`), pipes, and directives.
  - `features/auth/`: Professional login with validation, show/hide password, and 1-click demo credentials.
  - `features/dashboard/`: Executive summary KPIs, department distribution chart, status breakdown, recent employee additions, quick actions.
  - `features/employees/`: Full directory with live search, department and status filters, sorting, table view vs. grid cards toggle, Add/Edit modal forms, employee dossier view, and delete confirmation dialogs.
  - `features/departments/`: Department cards, headcount tracking, department lead profiles, budget tracking, Add/Edit/Delete modals.
  - `features/profile/`: Employee profile with cover header, personal contact details, employment assignments, skills cloud, and inline profile editing.
  - `layouts/`: Responsive application shell with collapsible desktop sidebar, mobile drawer, page title breadcrumbs, global search, notifications panel, and profile menu.
  - `pages/`: Dedicated **403 Forbidden** (Access Denied) and **404 Not Found** pages.

- **Guards & Routing**:
  - `authGuard` & `authChildGuard`: Protect private routes and preserve `returnUrl`.
  - `guestGuard`: Prevents authenticated users from returning to login/register.
  - `roleMatchGuard` & `roleGuard`: Enforces role-based permissions (`ADMIN`, `HR`, `EMPLOYEE`).
  - Lazy loading configured for all major feature chunks (`dashboard`, `employees`, `departments`, `profile`, `auth`).

- **HTTP & Backend Readiness**:
  - `AuthInterceptor`: Prepared for JWT `Authorization: Bearer <token>` injection on outgoing requests to Spring Boot REST endpoints.
  - Auto-clearing and redirection upon `401 Unauthorized` and `403 Forbidden` responses.
  - Reactive `BehaviorSubject` streams with `localStorage` fallback persistence.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# or: ng serve
```
Navigate to `http://localhost:4200/`.

### Production Build
```bash
npm run build
```
Build output is generated cleanly into `dist/team2-dashboard`.
