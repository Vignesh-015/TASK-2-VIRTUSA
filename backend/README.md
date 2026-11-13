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

## Package Structure & Module Owners

Base package: `com.sec.team2.ems`

| Package | Responsibility / Owner |
| :--- | :--- |
| `com.sec.team2.ems.config` | Shared Security and CORS configuration |
| `com.sec.team2.ems.common` | Shared `Role` enum, `ApiError`, exceptions, `GlobalExceptionHandler` |
| `com.sec.team2.ems.health` | `HealthController` (`GET /api/health`) |
| `com.sec.team2.ems.auth` | Authentication & security — **Viknesh S R** |
| `com.sec.team2.ems.user` | User management — **Vigneshwaran R** |
| `com.sec.team2.ems.dashboard` | Dashboard — **Yuvashree R H** |
| `com.sec.team2.ems.report` | Reports & analytics — **Vetriselvi M** |
| `com.sec.team2.ems.profile` | Profile & role-based access — **Sivasakthi A** |

**Rule:** Each team member adds work only inside their own package.

