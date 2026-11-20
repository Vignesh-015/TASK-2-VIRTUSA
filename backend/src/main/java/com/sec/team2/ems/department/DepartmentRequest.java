package com.sec.team2.ems.department;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for creating or updating a department.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100, message = "Department name must be between 2 and 100 characters")
    private String name;

    @Size(max = 20, message = "Department code must not exceed 20 characters")
    private String code;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Head name must not exceed 100 characters")
    private String headName;

    @Email(message = "Head email must be a valid email address")
    @Size(max = 100, message = "Head email must not exceed 100 characters")
    private String headEmail;

    @Size(max = 500, message = "Head avatar URL must not exceed 500 characters")
    private String headAvatar;

    @Size(max = 50, message = "Budget must not exceed 50 characters")
    private String budget;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 30, message = "Color must not exceed 30 characters")
    private String color;
}

