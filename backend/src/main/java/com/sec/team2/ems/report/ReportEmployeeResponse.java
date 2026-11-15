package com.sec.team2.ems.report;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) representing an employee record for the Reports module.
 *
 * This class defines the exact shape of the JSON data returned to the client when
 * requesting report datasets. It only exposes fields required for reporting and charts,
 * keeping sensitive credentials (like passwords) completely protected.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEmployeeResponse {

    /**
     * Unique identifier of the employee in the database.
     */
    private Long id;

    /**
     * Full name of the employee.
     */
    private String fullName;

    /**
     * Official corporate email address.
     */
    private String email;

    /**
     * Department where the employee works (e.g. Engineering, HR, Finance).
     */
    private String department;

    /**
     * Account status ("ACTIVE" or "INACTIVE").
     */
    private String status;

    /**
     * Date when the employee joined the company.
     * Formatted as ISO-8601 string (yyyy-MM-dd) to match Angular date handling.
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

    /**
     * Role or designation of the employee.
     * Holds the actual system role value ("ADMIN", "HR", "EMPLOYEE")
     * without inventing fake job titles.
     */
    private String roleOrDesignation;
}
