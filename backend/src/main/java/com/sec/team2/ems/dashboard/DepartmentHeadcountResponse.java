package com.sec.team2.ems.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Department name, headcount, and allocation percentage for the department distribution panel.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentHeadcountResponse {

    private String department;
    private long headcount;
    private double percentage;
}

