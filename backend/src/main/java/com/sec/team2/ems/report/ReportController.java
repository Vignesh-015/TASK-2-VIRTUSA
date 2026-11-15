package com.sec.team2.ems.report;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller exposing reporting endpoints for the Reports module.
 *
 * Base mapping is "/reports". With the application context-path set to "/api",
 * this controller handles requests starting at: http://localhost:8080/api/reports
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    // Spring Boot automatically injects ReportService here (Dependency Injection)
    private final ReportService reportService;

    /**
     * HTTP GET endpoint to retrieve employee records for reporting and CSV exports.
     * Full URL: GET http://localhost:8080/api/reports/employees
     *
     * Supports optional query parameters for filtering:
     * - department: filter by department name (e.g. "Engineering")
     * - status: filter by account status ("ACTIVE" or "INACTIVE")
     * - startDate: filter employees who joined on or after this date (format: yyyy-MM-dd)
     * - endDate: filter employees who joined on or before this date (format: yyyy-MM-dd)
     *
     * Example requests:
     * - GET /api/reports/employees
     * - GET /api/reports/employees?department=Finance
     * - GET /api/reports/employees?startDate=2023-01-01&endDate=2023-12-31
     *
     * @param department optional department name filter
     * @param status     optional account status filter
     * @param startDate  optional start of joining date range
     * @param endDate    optional end of joining date range
     * @return HTTP 200 OK with a list of matching ReportEmployeeResponse objects
     */
    @GetMapping("/employees")
    public ResponseEntity<List<ReportEmployeeResponse>> getEmployeeReports(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ReportEmployeeResponse> report = reportService.getEmployeeReports(department, status, startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
