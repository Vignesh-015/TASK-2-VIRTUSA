package com.sec.team2.ems.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * KPI summary metrics for the filtered employees matching the report date criteria.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSummaryResponse {
    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;
    private long joinedInRange;
}

