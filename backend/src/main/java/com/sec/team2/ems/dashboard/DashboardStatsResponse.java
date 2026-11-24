package com.sec.team2.ems.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Summary figures for the dashboard stat cards and workforce breakdown.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalEmployees;
    private long activeEmployees;
    private long onboardingEmployees;
    private long onLeaveEmployees;
    private long inactiveEmployees;
    private long newJoinersThisMonth;
    private long totalDepartments;
    private double activePercentage;
}

