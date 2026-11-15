package com.sec.team2.ems.report;

import com.sec.team2.ems.common.BusinessRuleException;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class handling the business logic for the Reports module.
 *
 * It reads employee records from the database using UserRepository,
 * applies optional report filters (department, status, date range),
 * and maps the entities to ReportEmployeeResponse DTOs.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    // Spring Boot automatically injects the existing UserRepository here (Dependency Injection)
    private final UserRepository userRepository;

    /**
     * Retrieves employee records from the database with optional filtering.
     *
     * @param department optional department name filter (e.g. "Engineering")
     * @param status     optional account status filter ("ACTIVE" or "INACTIVE")
     * @param startDate  optional start date filter (employees joined on or after this date)
     * @param endDate    optional end date filter (employees joined on or before this date)
     * @return a list of ReportEmployeeResponse matching the criteria
     */
    public List<ReportEmployeeResponse> getEmployeeReports(
            String department,
            String status,
            LocalDate startDate,
            LocalDate endDate
    ) {
        // Step 1: Validate date range (startDate must not be after endDate)
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessRuleException("Start date cannot be after end date.");
        }

        // Step 2: Fetch all employee records from the database ordered by ID
        List<User> allUsers = userRepository.findAllByOrderByIdAsc();

        // Step 3: Create an empty list to store matching report records
        List<ReportEmployeeResponse> reportList = new ArrayList<>();

        // Step 4: Loop through each employee using a simple Java for-each loop
        for (User user : allUsers) {

            // Filter 1: Check department (null-safe and case-insensitive) if provided
            if (department != null && !department.trim().isEmpty()) {
                if (user.getDepartment() == null || !user.getDepartment().equalsIgnoreCase(department.trim())) {
                    continue; // Skip this employee if department is null or does not match
                }
            }

            // Filter 2: Check status (null-safe and case-insensitive) if provided
            if (status != null && !status.trim().isEmpty()) {
                if (user.getStatus() == null || !user.getStatus().name().equalsIgnoreCase(status.trim())) {
                    continue; // Skip this employee if status is null or does not match
                }
            }

            // Filter 3: Check startDate (joined on or after) if provided
            if (startDate != null) {
                if (user.getJoinedOn() == null || user.getJoinedOn().isBefore(startDate)) {
                    continue; // Skip this employee if joinedOn is null or before startDate
                }
            }

            // Filter 4: Check endDate (joined on or before) if provided
            if (endDate != null) {
                if (user.getJoinedOn() == null || user.getJoinedOn().isAfter(endDate)) {
                    continue; // Skip this employee if joinedOn is null or after endDate
                }
            }

            // Step 5: Convert the User database entity into our ReportEmployeeResponse DTO
            ReportEmployeeResponse reportItem = ReportEmployeeResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .department(user.getDepartment())
                    .status(user.getStatus() != null ? user.getStatus().name() : null)
                    .joiningDate(user.getJoinedOn())
                    .roleOrDesignation(user.getRole() != null ? user.getRole().name() : null)
                    .build();

            // Step 6: Add the matching employee to our report list
            reportList.add(reportItem);
        }

        // Step 7: Return the final filtered list of report records
        return reportList;
    }
}
