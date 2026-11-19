package com.sec.team2.ems.user;

import com.sec.team2.ems.common.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for changing a user's system access role (PATCH /api/users/{id}/role).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleUpdateRequest {

    @NotNull(message = "Role is required")
    private Role role;
}

