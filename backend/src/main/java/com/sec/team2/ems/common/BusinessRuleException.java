package com.sec.team2.ems.common;

/**
 * Thrown when an operation violates an application business rule, such as attempting
 * to delete the last remaining ADMIN in the system.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}

