package com.sec.team2.ems.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response payload returned upon successful registration (POST /api/auth/register).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {

    private String message;
    private AuthUserResponse user;
}

