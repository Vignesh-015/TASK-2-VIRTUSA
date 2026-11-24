# Dashboard Overview Module (Backend)

**Package:** `com.sec.team2.ems.dashboard`  
**Base URL:** `/api/dashboard`  
**Owner:** Yuvashree R H (SEC – Team 2)  

---

## 1. Overview

The Dashboard module provides high-level organizational analytics, headcount allocations, status distributions, and recent employee additions. It powers the executive and administrative overview cards and charts on the home dashboard.

Key capabilities:
- Real-time workforce metrics (total staff, active staff, onboarding, on-leave, inactive, and new joiners this month).
- Live headcount distribution across all registered business units, guaranteeing that departments with zero employees are still represented.
- Graceful handling of unlisted or legacy department names associated with existing employees.
- Chronologically sorted recent employee additions table for quick directory navigation.

---

## 2. Security & Role Permissions

Access to all dashboard endpoints is strictly restricted to administrative and human resources roles:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
```

| Method | Endpoint | Allowed Roles | Description | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | `ADMIN`, `HR` | Overall workforce figures, status breakdowns, and active rate | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/api/dashboard/departments` | `ADMIN`, `HR` | Department headcounts and percentage allocations | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/api/dashboard/recent` | `ADMIN`, `HR` | Most recent employee additions (ordered by join date desc, id desc) | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |

Employees holding the `EMPLOYEE` role receive HTTP `403 FORBIDDEN` when calling these endpoints. Unauthenticated requests receive HTTP `401 UNAUTHORIZED`.

---

## 3. Why Aggregate on the Backend?

Earlier iterations of the frontend computed dashboard numbers in the browser by fetching all employee records via `GET /api/users`. Shifting metric computation to database queries in the backend provides critical benefits:

1. **Information Security & Principle of Least Privilege:**
   Employees should not be able to download full records (salaries, phone numbers, home locations, emergency contacts) simply to display an aggregate company stat.
2. **Network Efficiency & Scalability:**
   A database `COUNT(*)` returns a single 8-byte integer. Transferring tens of thousands of JSON employee objects across the network causes high bandwidth usage and browser slowdowns.
3. **Accuracy & Single Source of Truth:**
   Aggregating directly against MySQL tables avoids stale browser caches and inconsistent counts when multiple users are updating the system concurrently.

---

## 4. How Each Figure is Calculated

### 4.1 Summary Statistics (`/api/dashboard/stats`)

- **`totalEmployees`:**  
  `userRepository.count()`  
  Total count of all employee rows in the `users` table, regardless of employment status.
- **`activeEmployees`:**  
  `userRepository.countByStatus(UserStatus.ACTIVE)`  
  Headcount of staff actively working.
- **`onboardingEmployees`:**  
  `userRepository.countByStatus(UserStatus.ONBOARDING)`  
  Headcount of new hires currently in the onboarding pipeline.
- **`onLeaveEmployees`:**  
  `userRepository.countByStatus(UserStatus.ON_LEAVE)`  
  Headcount of employees on approved leave (medical, sabbatical, etc.).
- **`inactiveEmployees`:**  
  `userRepository.countByStatus(UserStatus.INACTIVE)`  
  Headcount of deactivated or soft-deleted accounts.
- **`newJoinersThisMonth`:**  
  `userRepository.countByJoinedOnBetween(firstDayOfMonth, lastDayOfMonth)`  
  Count of employees whose `joinedOn` date falls within the current calendar month.
- **`totalDepartments`:**  
  `departmentRepository.count()`  
  Total count of registered departments from the `departments` table.
- **`activePercentage`:**  
  `(activeEmployees * 100.0) / totalEmployees`  
  Rounded to one decimal place (e.g. `85.7`). Returns `0.0` when total workforce is 0.

### 4.2 Department Headcounts (`/api/dashboard/departments`)

1. Fetches all registered departments from `departmentRepository.findAllByOrderByNameAsc()`.
2. Groups and counts employee records by department using JPQL:  
   `SELECT u.department, COUNT(u) FROM User u GROUP BY u.department`
3. Matches grouped counts against registered departments (case-insensitive).
4. Every department in the `departments` table is included, even if its headcount is 0.
5. If any employees carry an unlisted department name not present in the `departments` table and headcount > 0, it is added as an extra row at the end.
6. The list is sorted by **headcount descending**, then by **department name ascending**.

### 4.3 Recent Employee Additions (`/api/dashboard/recent`)

- Fetches user records ordered by `joinedOn DESC, id DESC`.
- Accepts an optional `limit` query parameter (default: 5). Values are bounded between 1 and 20; non-numeric or invalid parameters automatically default to 5 without throwing an error.
- Sensitive details (passwords, emergency contacts, phone numbers) are stripped. Only `id`, `employeeCode`, `fullName`, `department`, `designation`, `joinedOn` (`yyyy-MM-dd`), and `status` are returned.

---

## 5. API Contracts & Sample JSON

### 5.1 Dashboard Stats
**Endpoint:** `GET /api/dashboard/stats`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  
**Response (200 OK):**
```json
{
  "totalEmployees": 14,
  "activeEmployees": 11,
  "onboardingEmployees": 2,
  "onLeaveEmployees": 0,
  "inactiveEmployees": 1,
  "newJoinersThisMonth": 3,
  "totalDepartments": 6,
  "activePercentage": 78.6
}
```

### 5.2 Department Headcounts
**Endpoint:** `GET /api/dashboard/departments`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  
**Response (200 OK):**
```json
 [
  {
    "department": "Engineering",
    "headcount": 6,
    "percentage": 42.9
  },
  {
    "department": "Finance & Operations",
    "headcount": 3,
    "percentage": 21.4
  },
  {
    "department": "Human Resources",
    "headcount": 2,
    "percentage": 14.3
  },
  {
    "department": "Product & Design",
    "headcount": 2,
    "percentage": 14.3
  },
  {
    "department": "Sales & Partnerships",
    "headcount": 1,
    "percentage": 7.1
  },
  {
    "department": "Marketing",
    "headcount": 0,
    "percentage": 0.0
  }
]
```

### 5.3 Recent Employees
**Endpoint:** `GET /api/dashboard/recent?limit=5`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`  
**Response (200 OK):**
```json
[
  {
    "id": 14,
    "employeeCode": "EMP-1014",
    "fullName": "Meera Krishnan",
    "department": "Engineering",
    "designation": "Cloud Security Specialist",
    "joinedOn": "2026-11-15",
    "status": "ONBOARDING"
  },
  {
    "id": 12,
    "employeeCode": "EMP-1012",
    "fullName": "Siddharth Verma",
    "department": "Product & Design",
    "designation": "Associate Product Manager",
    "joinedOn": "2026-11-02",
    "status": "ONBOARDING"
  },
  {
    "id": 8,
    "employeeCode": "EMP-1008",
    "fullName": "Aarav Sharma",
    "department": "Engineering",
    "designation": "Frontend Engineer",
    "joinedOn": "2024-03-01",
    "status": "ACTIVE"
  }
]
```

