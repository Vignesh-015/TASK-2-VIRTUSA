package com.sec.team2.ems.user;

import com.sec.team2.ems.common.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds initial employee data into the database on application startup.
 * Runs only if the "users" table is completely empty, ensuring tests and fresh
 * database instances immediately have realistic records to display and query.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Users table already contains data ({} records). Skipping seeder.", userRepository.count());
            return;
        }

        log.info("Users table is empty. Seeding initial employee records...");
        String defaultPasswordHash = passwordEncoder.encode(UserService.DEFAULT_TEMP_PASSWORD);

        List<User> seedUsers = List.of(
                // 1. Known Admin (Engineering)
                User.builder()
                        .fullName("System Admin")
                        .email("admin@ems.com")
                        .phone("9876543210")
                        .department("Engineering")
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2023, 1, 10))
                        .password(defaultPasswordHash)
                        .build(),

                // 2. Admin (Operations)
                User.builder()
                        .fullName("Aarav Sharma")
                        .email("aarav.sharma@ems.com")
                        .phone("9820145678")
                        .department("Operations")
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2023, 2, 14))
                        .password(defaultPasswordHash)
                        .build(),

                // 3. HR (HR)
                User.builder()
                        .fullName("Kavita Deshmukh")
                        .email("kavita.deshmukh@ems.com")
                        .phone("9811234567")
                        .department("HR")
                        .role(Role.HR)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2022, 11, 21))
                        .password(defaultPasswordHash)
                        .build(),

                // 4. HR (HR)
                User.builder()
                        .fullName("Rohan Kulkarni")
                        .email("rohan.kulkarni@ems.com")
                        .phone("9765432109")
                        .department("HR")
                        .role(Role.HR)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2024, 1, 15))
                        .password(defaultPasswordHash)
                        .build(),

                // 5. HR (HR)
                User.builder()
                        .fullName("Ananya Iyer")
                        .email("ananya.iyer@ems.com")
                        .phone("9845012345")
                        .department("HR")
                        .role(Role.HR)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2023, 5, 20))
                        .password(defaultPasswordHash)
                        .build(),

                // 6. Employee (Engineering)
                User.builder()
                        .fullName("Priya Nair")
                        .email("priya.nair@ems.com")
                        .phone("9830198765")
                        .department("Engineering")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2023, 6, 5))
                        .password(defaultPasswordHash)
                        .build(),

                // 7. Employee (Finance) - Inactive 1
                User.builder()
                        .fullName("Vikramaditya Rao")
                        .email("vikram.rao@ems.com")
                        .phone("9900112233")
                        .department("Finance")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.INACTIVE)
                        .joinedOn(LocalDate.of(2022, 8, 19))
                        .password(defaultPasswordHash)
                        .build(),

                // 8. Employee (Finance)
                User.builder()
                        .fullName("Sneha Patel")
                        .email("sneha.patel@ems.com")
                        .phone("9822334455")
                        .department("Finance")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2023, 4, 10))
                        .password(defaultPasswordHash)
                        .build(),

                // 9. Employee (Sales)
                User.builder()
                        .fullName("Karthik Subramanian")
                        .email("karthik.s@ems.com")
                        .phone("9840987654")
                        .department("Sales")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2024, 3, 18))
                        .password(defaultPasswordHash)
                        .build(),

                // 10. Employee (Operations) - Inactive 2
                User.builder()
                        .fullName("Siddharth Verma")
                        .email("siddharth.verma@ems.com")
                        .phone("9818776655")
                        .department("Operations")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.INACTIVE)
                        .joinedOn(LocalDate.of(2023, 7, 24))
                        .password(defaultPasswordHash)
                        .build(),

                // 11. Employee (Support)
                User.builder()
                        .fullName("Divya Menon")
                        .email("divya.menon@ems.com")
                        .phone("9895123456")
                        .department("Support")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2024, 5, 2))
                        .password(defaultPasswordHash)
                        .build(),

                // 12. Employee (Support)
                User.builder()
                        .fullName("Arjun Malhotra")
                        .email("arjun.malhotra@ems.com")
                        .phone("9810456789")
                        .department("Support")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .joinedOn(LocalDate.of(2024, 7, 11))
                        .password(defaultPasswordHash)
                        .build()
        );

        userRepository.saveAll(seedUsers);
        log.info("Successfully seeded {} employee records into users table.", seedUsers.size());
    }
}

