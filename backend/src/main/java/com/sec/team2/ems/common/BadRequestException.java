package com.sec.team2.ems.common;

/**
 * Exception thrown when a client request violates input or business constraints
 * that map to HTTP 400 BAD REQUEST (e.g., password mismatch or incorrect current password).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

