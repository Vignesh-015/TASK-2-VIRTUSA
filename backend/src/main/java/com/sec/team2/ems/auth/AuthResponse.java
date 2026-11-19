package com.sec.team2.ems.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response payload returned upon successful login (POST /api/auth/login).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private AuthUserResponse user;
}

