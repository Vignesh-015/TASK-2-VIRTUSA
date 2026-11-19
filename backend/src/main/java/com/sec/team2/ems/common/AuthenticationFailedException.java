package com.sec.team2.ems.common;

/**
 * Exception thrown when authentication fails due to invalid credentials,
 * deactivated account, or malformed authentication requests.
 * Mapped to HTTP 401 Unauthorized by GlobalExceptionHandler.
 */
public class AuthenticationFailedException extends RuntimeException {

    public AuthenticationFailedException(String message) {
        super(message);
    }
}

