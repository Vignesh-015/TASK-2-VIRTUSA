package com.sec.team2.ems.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload for updating the authenticated user's profile details (PUT /api/profile/me).
 * Allows modifications to personal contact, location, skills, bio, and emergency contact details.
 * System attributes (email, role, department, employee code, etc.) cannot be modified here.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+91[ -]?)?[0-9]{10}$", message = "Enter a 10-digit phone number, optionally starting with +91")
    private String phone;

    @Size(max = 100, message = "Work location cannot exceed 100 characters")
    private String workLocation;

    @Size(max = 500, message = "Skills cannot exceed 500 characters")
    private String skills;

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    @Size(max = 100, message = "Emergency contact name cannot exceed 100 characters")
    private String emergencyContactName;

    @Size(max = 50, message = "Emergency contact relation cannot exceed 50 characters")
    private String emergencyContactRelation;

    @Pattern(regexp = "^$|^(\\+91[ -]?)?[0-9]{10}$", message = "Enter a 10-digit phone number, optionally starting with +91")
    @Size(max = 20, message = "Emergency contact phone cannot exceed 20 characters")
    private String emergencyContactPhone;
}
