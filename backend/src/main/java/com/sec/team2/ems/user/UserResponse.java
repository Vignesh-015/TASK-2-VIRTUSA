package com.sec.team2.ems.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sec.team2.ems.common.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) for returning full employee and user details in API responses.
 * Provides a unified payload for both the Employees tab (HR view) and Users tab (access view).
 * Never exposes the hashed password.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate joinedOn;

    private UserStatus status;
    private EmploymentType employmentType;
    private String workLocation;
    private String managerName;
    private String skills;
    private String bio;
    private Role role;
}
