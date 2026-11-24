package com.sec.team2.ems.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing executive dashboard metrics for administrators and HR managers.
 * Base path: /api/dashboard
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Overall workforce figures, status breakdown counts, and active percentage.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    /**
     * Headcount and allocation percentage per department.
     */
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentHeadcountResponse>> getDepartmentHeadcounts() {
        return ResponseEntity.ok(dashboardService.getDepartmentHeadcounts());
    }

    /**
     * Recent employee additions ordered by joined date descending.
     * Limit defaults to 5 and is capped between 1 and 20.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<RecentEmployeeResponse>> getRecentEmployees(
            @RequestParam(name = "limit", required = false, defaultValue = "5") String limit
    ) {
        int parsedLimit = 5;
        if (limit != null) {
            try {
                int val = Integer.parseInt(limit.trim());
                if (val >= 1 && val <= 20) {
                    parsedLimit = val;
                }
            } catch (NumberFormatException ignored) {
                parsedLimit = 5;
            }
        }
        return ResponseEntity.ok(dashboardService.getRecentEmployees(parsedLimit));
    }
}

