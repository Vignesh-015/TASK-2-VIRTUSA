# Reports & Analytics Module (Backend)

**Package:** `com.sec.team2.ems.report`  
**Base URL:** `/api/reports`  
**Owner:** Vetriselvi M (SEC – Team 2)  

---

## 1. Overview

The Reports & Analytics module provides workforce distributions, account status health, chronological hiring trends, and executive KPI summaries. All calculations are executed directly in the database using optimized JPQL queries, ensuring high performance, low network latency, and strict adherence to the principle of least privilege.

Key capabilities:
- **Department Distribution:** Computes headcount and allocation percentage for every registered department, guaranteeing that departments with zero employees are still represented, and gracefully includes unlisted departments associated with employees.
- **Status Health Distribution:** Always returns all four system statuses (`ACTIVE`, `ONBOARDING`, `ON_LEAVE`, `INACTIVE`) in fixed order with headcount and percentages.
- **Monthly Hiring Trends:** Generates chronological join counts (`yyyy-MM`) with zero-filling so that there are never gaps in timeline charts.
- **Summary Metrics:** Returns executive KPI metrics (`totalEmployees`, `activeEmployees`, `inactiveEmployees`, `joinedInRange`) for the filtered workforce.
- **Date Range Filtering:** Supports optional ISO date filters (`startDate` and `endDate` in `yyyy-MM-dd` format) applied to the employee joining date (`joinedOn`).

---

## 2. Security & Role Permissions

Access to all report endpoints is strictly restricted to administrative and human resources roles:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
```

| Method | Endpoint | Allowed Roles | Description | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/departments` | `ADMIN`, `HR` | Department headcounts and percentage allocations | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/api/reports/status-distribution` | `ADMIN`, `HR` | Account status breakdown across all four statuses | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/api/reports/monthly-joins` | `ADMIN`, `HR` | Chronological monthly join volumes | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |
| `GET` | `/api/reports/summary` | `ADMIN`, `HR` | Summary KPI figures for the filtered workforce | `200 OK` (`403` for `EMPLOYEE`, `401` unauthenticated) |

Employees holding the `EMPLOYEE` role receive HTTP `403 FORBIDDEN` when calling any report endpoint. Unauthenticated requests receive HTTP `401 UNAUTHORIZED`.

---

## 3. Date Range Filtering Rules

All report endpoints accept two optional query parameters:
- `startDate` (format: `YYYY-MM-DD`, inclusive)
- `endDate` (format: `YYYY-MM-DD`, inclusive)

The date filter operates on the employee joining date column (`users.joined_on`).

### Validation Rules
1. **Both missing:** No filter applies (all-time workforce data is queried), except for the monthly report which defaults to the last 12 months ending with the current month.
2. **Invalid format:** If either parameter cannot be parsed as a valid ISO date (e.g. `startDate=invalid` or `startDate=2024-13-45`), the server returns HTTP `400 BAD REQUEST` with message `"Invalid date range"`.
3. **Inverted range:** If `startDate` is chronologically after `endDate`, the server returns HTTP `400 BAD REQUEST` with message `"Invalid date range"`.
4. **Range size limit (Monthly Joins only):** If the requested date span exceeds 60 months, the server returns HTTP `400 BAD REQUEST` with message `"Date range too large"`.

---

## 4. API Endpoints and Sample JSON

### 4.1 Department Distribution (`GET /api/reports/departments`)

Returns a list of department headcounts and allocation percentages for the filtered period.

**Rules:**
- Includes **every** department from the `departments` table. If no employees in that department joined within the filtered range, `headcount` is `0` and `percentage` is `0.0`.
- If existing employees carry a department name that is not in the `departments` table and has a count above 0, it is appended as an extra row.
- `percentage` is calculated as `(headcount / totalFiltered) * 100`, rounded to one decimal place (`0.0` when total is 0).
- Results are sorted by `headcount` descending, then by department name ascending.

**Sample Request:**
```http
GET /api/reports/departments?startDate=2024-01-01&endDate=2026-11-30
Authorization: Bearer <JWT>
```

**Sample Response (`200 OK`):**
```json
[
  {
    "department": "Engineering",
    "headcount": 9,
    "percentage": 42.9
  },
  {
    "department": "Finance & Operations",
    "headcount": 4,
    "percentage": 19.0
  },
  {
    "department": "Human Resources",
    "headcount": 4,
    "percentage": 19.0
  },
  {
    "department": "Support",
    "headcount": 3,
    "percentage": 14.3
  },
  {
    "department": "Sales & Partnerships",
    "headcount": 1,
    "percentage": 4.8
  },
  {
    "department": "AI Development",
    "headcount": 0,
    "percentage": 0.0
  },
  {
    "department": "Marketing",
    "headcount": 0,
    "percentage": 0.0
  },
  {
    "department": "Product & Design",
    "headcount": 0,
    "percentage": 0.0
  }
]
```

---

### 4.2 Status Distribution (`GET /api/reports/status-distribution`)

Returns account counts and relative percentages for all four system statuses.

**Rules:**
- Always returns all four statuses in the exact fixed order: `ACTIVE`, `ONBOARDING`, `ON_LEAVE`, `INACTIVE`.
- If a status has 0 matching employees, `count` is `0` and `percentage` is `0.0`.
- Percentages are rounded to one decimal place.

**Sample Request:**
```http
GET /api/reports/status-distribution
Authorization: Bearer <JWT>
```

**Sample Response (`200 OK`):**
```json
[
  {
    "status": "ACTIVE",
    "count": 15,
    "percentage": 71.4
  },
  {
    "status": "ONBOARDING",
    "count": 0,
    "percentage": 0.0
  },
  {
    "status": "ON_LEAVE",
    "count": 0,
    "percentage": 0.0
  },
  {
    "status": "INACTIVE",
    "count": 6,
    "percentage": 28.6
  }
]
```

---

### 4.3 Monthly Joins (`GET /api/reports/monthly-joins`)

Returns chronological employee hiring volume per month formatted as `yyyy-MM`.

**Rules:**
- Returns one item for **every** calendar month in the requested range in chronological order.
- Months with zero joins are explicitly present with `count: 0` (zero-fill, no missing gaps).
- When `startDate` and `endDate` are omitted, defaults to the last 12 months ending with the current month.
- Maximum range span is capped at 60 months. Ranges larger than 60 months return HTTP `400 BAD REQUEST` (`"Date range too large"`).

**Sample Request:**
```http
GET /api/reports/monthly-joins?startDate=2026-06-01&endDate=2026-11-30
Authorization: Bearer <JWT>
```

**Sample Response (`200 OK`):**
```json
[
  {
    "month": "2026-06",
    "count": 0
  },
  {
    "month": "2026-07",
    "count": 0
  },
  {
    "month": "2026-08",
    "count": 0
  },
  {
    "month": "2026-09",
    "count": 0
  },
  {
    "month": "2026-10",
    "count": 0
  },
  {
    "month": "2026-11",
    "count": 5
  }
]
```

---

### 4.4 Summary KPI Metrics (`GET /api/reports/summary`)

Returns aggregate figures for the filtered employees corresponding to the executive KPI strip on the Reports page.

**Fields:**
- `totalEmployees`: Total number of employees in the filtered set.
- `activeEmployees`: Number of active accounts (`status = 'ACTIVE'`) in the filtered set.
- `inactiveEmployees`: Number of inactive accounts (`status = 'INACTIVE'`) in the filtered set.
- `joinedInRange`: Number of employees whose join date falls within the filter range (matches `totalEmployees`).

**Sample Request:**
```http
GET /api/reports/summary?startDate=2026-11-01&endDate=2026-11-30
Authorization: Bearer <JWT>
```

**Sample Response (`200 OK`):**
```json
{
  "totalEmployees": 5,
  "activeEmployees": 4,
  "inactiveEmployees": 1,
  "joinedInRange": 5
}
```

---

## 5. Error Responses

All error responses use the standard `ApiError` structure:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid date range",
  "timestamp": "2026-11-24T09:25:00.000Z"
}
```

| Scenario | HTTP Status | Response Message |
| :--- | :--- | :--- |
| `startDate` is later than `endDate` | `400 BAD REQUEST` | `"Invalid date range"` |
| Malformed or unparseable date | `400 BAD REQUEST` | `"Invalid date range"` |
| Date range exceeds 60 months in `/monthly-joins` | `400 BAD REQUEST` | `"Date range too large"` |
| Non-admin / non-HR user (`EMPLOYEE` role) | `403 FORBIDDEN` | `"You do not have permission to perform this action"` |
| Missing or expired JWT token | `401 UNAUTHORIZED` | `"Authentication required"` |

