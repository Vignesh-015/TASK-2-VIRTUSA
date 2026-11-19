package com.sec.team2.ems.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Migration runner that safely populates new employee columns for pre-existing user rows.
 * Idempotent: Only updates rows that have missing values (employeeCode, names, designation, etc.)
 * and leaves already populated rows untouched.
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class UserDataBackfill implements ApplicationRunner {

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        List<User> allUsers = userRepository.findAllByOrderByIdAsc();
        if (allUsers.isEmpty()) {
            return;
        }

        // Find the maximum existing numeric employee code
        int maxCode = 1000;
        for (User u : allUsers) {
            if (u.getEmployeeCode() != null && u.getEmployeeCode().startsWith("EMP-")) {
                try {
                    int num = Integer.parseInt(u.getEmployeeCode().substring(4).trim());
                    if (num > maxCode) {
                        maxCode = num;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        List<User> toUpdate = new ArrayList<>();
        int nextCode = maxCode;

        for (User user : allUsers) {
            boolean modified = false;

            // 1. Employee code
            if (user.getEmployeeCode() == null || user.getEmployeeCode().isBlank()) {
                nextCode++;
                user.setEmployeeCode("EMP-" + nextCode);
                modified = true;
            }

            // 2. First name and Last name from fullName
            if (user.getFirstName() == null || user.getFirstName().isBlank()
                    || user.getLastName() == null || user.getLastName().isBlank()) {
                String full = user.getFullName() != null ? user.getFullName().trim() : "User";
                String fName;
                String lName;
                int spaceIndex = full.indexOf(' ');
                if (spaceIndex > 0) {
                    fName = full.substring(0, spaceIndex).trim();
                    lName = full.substring(spaceIndex + 1).trim();
                    if (lName.isEmpty()) {
                        lName = "-";
                    }
                } else {
                    fName = full;
                    lName = "-";
                }
                if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                    user.setFirstName(fName);
                    modified = true;
                }
                if (user.getLastName() == null || user.getLastName().isBlank()) {
                    user.setLastName(lName);
                    modified = true;
                }
            }

            // 3. Designation default
            if (user.getDesignation() == null || user.getDesignation().isBlank()) {
                user.setDesignation(getDefaultDesignation(user.getDepartment()));
                modified = true;
            }

            // 4. Employment Type default
            if (user.getEmploymentType() == null) {
                user.setEmploymentType(EmploymentType.FULL_TIME);
                modified = true;
            }

            // 5. Work location default if null
            if (user.getWorkLocation() == null || user.getWorkLocation().isBlank()) {
                user.setWorkLocation("Chennai (Hybrid)");
                modified = true;
            }

            if (modified) {
                toUpdate.add(user);
            }
        }

        if (!toUpdate.isEmpty()) {
            userRepository.saveAll(toUpdate);
            log.info("UserDataBackfill: Successfully updated {} existing user records with employee details.", toUpdate.size());
        } else {
            log.info("UserDataBackfill: All {} user records already have employee details. Nothing to backfill.", allUsers.size());
        }
    }

    private String getDefaultDesignation(String department) {
        if (department == null) {
            return "Not set";
        }
        String lower = department.toLowerCase();
        if (lower.contains("engineer")) return "Software Engineer";
        if (lower.contains("hr") || lower.contains("human")) return "HR Specialist";
        if (lower.contains("finance")) return "Financial Analyst";
        if (lower.contains("sale")) return "Sales Executive";
        if (lower.contains("operation")) return "Operations Lead";
        if (lower.contains("support")) return "Support Specialist";
        return "Not set";
    }
}

