package com.sec.team2.ems.report;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing workforce analytics and reporting endpoints for ADMIN and HR roles.
 * Base path: /api/reports
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class ReportController {

    private final ReportService reportService;

    /**
     * Headcount and allocation percentage per department within an optional joinedOn date range.
     */
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentReportItem>> getDepartments(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getDepartmentReport(startDate, endDate));
    }

    /**
     * Account status breakdown across all four statuses in fixed order within an optional date range.
     */
    @GetMapping("/status-distribution")
    public ResponseEntity<List<StatusReportItem>> getStatusDistribution(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getStatusDistribution(startDate, endDate));
    }

    /**
     * Chronological employee joining volume per month (yyyy-MM) within a date range (capped at 60 months).
     */
    @GetMapping("/monthly-joins")
    public ResponseEntity<List<MonthlyJoinItem>> getMonthlyJoins(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getMonthlyJoins(startDate, endDate));
    }

    /**
     * Overall KPI summary figures for the filtered workforce.
     */
    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary(
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getSummary(startDate, endDate));
    }
}

