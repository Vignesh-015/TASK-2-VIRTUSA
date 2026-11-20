package com.sec.team2.ems.department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Response payload containing department details and live employee count.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String headName;
    private String headEmail;
    private String headAvatar;
    private String budget;
    private String location;
    private String color;
    private long employeeCount;
    private Instant createdAt;
    private Instant updatedAt;
}

