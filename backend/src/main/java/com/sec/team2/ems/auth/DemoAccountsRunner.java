package com.sec.team2.ems.auth;

import com.sec.team2.ems.common.Role;
import com.sec.team2.ems.user.EmploymentType;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserService;
import com.sec.team2.ems.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Runner that creates pre-configured demo accounts for development and demo testing.
 * Runs only if app.seed-demo-accounts=true in application.properties.
 * Idempotent: Never overwrites existing user records.
 */
@Slf4j
@Component
@Order(20)
@ConditionalOnProperty(name = "app.seed-demo-accounts", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
public class DemoAccountsRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.warn("DEV MODE: demo accounts are seeded with weak passwords; use the prod profile for real deployments");
        log.info("Checking demo accounts (app.seed-demo-accounts=true)...");

        List<DemoAccountSpec> specs = List.of(
                // 1. Admin Demo Account
                new DemoAccountSpec(
                        "admin@employeehub.com",
                        "admin123", // development only, weak password
                        "Alexander",
                        "Hayes",
                        "Alexander Hayes",
                        Role.ADMIN,
                        "Engineering",
                        "VP of Engineering",
                        "9876543210",
                        LocalDate.of(2023, 3, 15),
                        "Bengaluru (Hybrid)"
                ),
                // 2. HR Demo Account
                new DemoAccountSpec(
                        "hr@employeehub.com",
                        "hr123", // development only, weak password
                        "Sarah",
                        "Jenkins",
                        "Sarah Jenkins",
                        Role.HR,
                        "Human Resources",
                        "HR Manager",
                        "9811234567",
                        LocalDate.of(2023, 8, 10),
                        "Chennai (Hybrid)"
                ),
                // 3. Employee Demo Account
                new DemoAccountSpec(
                        "employee@employeehub.com",
                        "emp123", // development only, weak password
                        "Liam",
                        "O'Connor",
                        "Liam O'Connor",
                        Role.EMPLOYEE,
                        "Engineering",
                        "Software Engineer",
                        "9820145678",
                        LocalDate.of(2023, 4, 11),
                        "Bengaluru"
                )
        );

        int createdCount = 0;
        for (DemoAccountSpec spec : specs) {
            java.util.Optional<User> existing = userRepository.findByEmailIgnoreCase(spec.email());
            if (existing.isPresent()) {
                User user = existing.get();
                user.setPassword(passwordEncoder.encode(spec.rawPassword()));
                userRepository.save(user);
            } else {
                String code = userService.generateNextEmployeeCode();
                User user = User.builder()
                        .employeeCode(code)
                        .firstName(spec.firstName())
                        .lastName(spec.lastName())
                        .fullName(spec.fullName())
                        .email(spec.email())
                        .password(passwordEncoder.encode(spec.rawPassword()))
                        .role(spec.role())
                        .status(UserStatus.ACTIVE)
                        .department(spec.department())
                        .designation(spec.designation())
                        .employmentType(EmploymentType.FULL_TIME)
                        .phone(spec.phone())
                        .joinedOn(spec.joinedOn())
                        .workLocation(spec.workLocation())
                        .build();

                userRepository.save(user);
                createdCount++;
                log.info("Created demo account {} ({}) with code {}", spec.email(), spec.role(), code);
            }
        }

        if (createdCount > 0) {
            log.info("DemoAccountsRunner: Seeded {} demo accounts successfully.", createdCount);
        } else {
            log.info("DemoAccountsRunner: All demo accounts already exist. Nothing created.");
        }
    }

    private record DemoAccountSpec(
            String email,
            String rawPassword,
            String firstName,
            String lastName,
            String fullName,
            Role role,
            String department,
            String designation,
            String phone,
            LocalDate joinedOn,
            String workLocation
    ) {}
}

