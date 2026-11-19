package com.sec.team2.ems.user;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for changing an employee's account status (PATCH /api/users/{id}/status).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;
}

