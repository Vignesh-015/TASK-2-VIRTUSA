package com.sec.team2.ems.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Report item representing headcount and relative workforce percentage for a department.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentReportItem {
    private String department;
    private long headcount;
    private double percentage;
}

