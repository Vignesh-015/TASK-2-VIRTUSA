package com.sec.team2.ems.department;

import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Migration runner that migrates existing user records from legacy department names
 * to standard canonical department names.
 * Runs on startup with Order 2, immediately after DepartmentSeeder.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DepartmentMigrationRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    private static final Map<String, String> LEGACY_DEPARTMENT_MAP = Map.of(
            "hr", "Human Resources",
            "finance", "Finance & Operations",
            "operations", "Finance & Operations",
            "sales", "Sales & Partnerships"
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Running DepartmentMigrationRunner to normalize legacy department names...");

        List<User> users = userRepository.findAll();
        List<User> usersToUpdate = new ArrayList<>();
        int updatedCount = 0;

        for (User user : users) {
            String dept = user.getDepartment();
            if (dept != null) {
                String normalizedKey = dept.trim().toLowerCase();
                if (LEGACY_DEPARTMENT_MAP.containsKey(normalizedKey)) {
                    String canonicalName = LEGACY_DEPARTMENT_MAP.get(normalizedKey);
                    user.setDepartment(canonicalName);
                    usersToUpdate.add(user);
                    updatedCount++;
                }
            }
        }

        if (!usersToUpdate.isEmpty()) {
            userRepository.saveAll(usersToUpdate);
        }

        log.info("Department migration completed: {} user row(s) updated to canonical department names.", updatedCount);

        // Check for any remaining unmatched department names
        Set<String> validDepartments = departmentRepository.findAll().stream()
                .map(d -> d.getName().trim().toLowerCase())
                .collect(Collectors.toSet());

        List<String> unmatchedExamples = new ArrayList<>();
        int unmatchedCount = 0;

        for (User user : userRepository.findAll()) {
            String dept = user.getDepartment();
            if (dept != null && !dept.isBlank() && !dept.equalsIgnoreCase("Not assigned")) {
                if (!validDepartments.contains(dept.trim().toLowerCase())) {
                    unmatchedCount++;
                    if (unmatchedExamples.size() < 5) {
                        unmatchedExamples.add(user.getEmail() + " ('" + dept + "')");
                    }
                }
            }
        }

        if (unmatchedCount > 0) {
            log.warn("Department migration: Found {} user(s) whose department does not match an existing department. Examples: {}",
                    unmatchedCount, unmatchedExamples);
        }
    }
}

