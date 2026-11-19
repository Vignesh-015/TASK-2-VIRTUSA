package com.sec.team2.ems.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) for creating or updating an employee/user record.
 * Used for both the HR view (Employees tab) and access view (Users tab).
 * Excludes role, password, and employeeCode, which are managed separately by system rules.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+91[ -]?)?[0-9]{10}$",
            message = "Enter a 10-digit phone number, optionally starting with +91"
    )
    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Designation is required")
    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @NotNull(message = "Join date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate joinedOn;

    @NotNull(message = "Status is required")
    private UserStatus status;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @Size(max = 100, message = "Work location must not exceed 100 characters")
    private String workLocation;

    @Size(max = 100, message = "Manager name must not exceed 100 characters")
    private String managerName;

    @Size(max = 500, message = "Skills must not exceed 500 characters")
    private String skills;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}
