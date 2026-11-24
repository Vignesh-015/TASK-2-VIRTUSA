package com.sec.team2.ems.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Report item representing account count and percentage for a specific user status.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusReportItem {
    private String status;
    private long count;
    private double percentage;
}

