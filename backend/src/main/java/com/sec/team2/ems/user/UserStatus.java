package com.sec.team2.ems.user;

/**
 * Represents the account and employment status of an employee in the system.
 * ACTIVE: The employee is actively working and has system access.
 * ONBOARDING: The employee has joined and is completing the onboarding process.
 * ON_LEAVE: The employee is on approved leave (medical, sabbatical, etc.).
 * INACTIVE: The account is deactivated (soft-deleted or left the company).
 */
public enum UserStatus {
    ACTIVE,
    ONBOARDING,
    ON_LEAVE,
    INACTIVE
}
