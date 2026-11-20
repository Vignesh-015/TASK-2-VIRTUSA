package com.sec.team2.ems.profile;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sec.team2.ems.common.Role;
import com.sec.team2.ems.user.EmploymentType;
import com.sec.team2.ems.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) representing the profile of the currently authenticated user.
 * Combines personal identity, employment records, contact details, and emergency contacts.
 * Passwords and sensitive internal security data are strictly omitted.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

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
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
}

