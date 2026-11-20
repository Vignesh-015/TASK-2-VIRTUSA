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
 * Payload for changing the authenticated user's password (POST /api/profile/change-password).
 * Enforces validation on current password, minimum 8 characters with alphanumeric constraints,
 * and confirmation match.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 64, message = "Password must be at least 8 characters and include a letter and a number")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).+$", message = "Password must be at least 8 characters and include a letter and a number")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}

