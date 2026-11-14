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
 * Data Transfer Object (DTO) for returning user details in API responses.
 * Never exposes the hashed password or database entity references.
 * The joinedOn date is serialized as an ISO-8601 string (yyyy-MM-dd) to match Angular.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private Role role;
    private UserStatus status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate joinedOn;
}

