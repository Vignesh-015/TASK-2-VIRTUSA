package com.sec.team2.ems.user;

import com.sec.team2.ems.common.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds initial employee and user records into the database on application startup.
 * Runs only if the "users" table is completely empty, ensuring tests and fresh database
 * instances immediately have realistic records with all employee details populated.
 */
@Slf4j
@Component
@Order(10)
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

        log.info("Users table is empty. Seeding initial employee records with full profile details...");
        String defaultPasswordHash = passwordEncoder.encode(UserService.DEFAULT_TEMP_PASSWORD);

        List<User> seedUsers = List.of(
                // 1. Known Admin (Engineering)
                User.builder()
                        .employeeCode("EMP-1001")
                        .firstName("System")
                        .lastName("Admin")
                        .fullName("System Admin")
                        .email("admin@ems.com")
                        .phone("9876543210")
                        .department("Engineering")
                        .designation("Engineering Director")
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Bengaluru")
                        .managerName(null)
                        .skills("Architecture, Java, Cloud, Security")
                        .bio("Platform lead and system administrator for EMS.")
                        .joinedOn(LocalDate.of(2023, 1, 10))
                        .password(defaultPasswordHash)
                        .build(),

                // 2. Admin (Finance & Operations)
                User.builder()
                        .employeeCode("EMP-1002")
                        .firstName("Aarav")
                        .lastName("Sharma")
                        .fullName("Aarav Sharma")
                        .email("aarav.sharma@ems.com")
                        .phone("9820145678")
                        .department("Finance & Operations")
                        .designation("Operations Director")
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Chennai (Hybrid)")
                        .managerName("System Admin")
                        .skills("Operations Management, Logistics, Strategy")
                        .bio("Directs internal company operations and service delivery.")
                        .joinedOn(LocalDate.of(2023, 2, 14))
                        .password(defaultPasswordHash)
                        .build(),

                // 3. HR (Human Resources)
                User.builder()
                        .employeeCode("EMP-1003")
                        .firstName("Kavita")
                        .lastName("Deshmukh")
                        .fullName("Kavita Deshmukh")
                        .email("kavita.deshmukh@ems.com")
                        .phone("9811234567")
                        .department("Human Resources")
                        .designation("Lead HR Business Partner")
                        .role(Role.HR)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Mumbai")
                        .managerName("System Admin")
                        .skills("Talent Acquisition, Employee Relations, Policy")
                        .bio("Leads talent management and employee engagement initiatives.")
                        .joinedOn(LocalDate.of(2022, 11, 21))
                        .password(defaultPasswordHash)
                        .build(),

                // 4. HR (Human Resources) - ONBOARDING
                User.builder()
                        .employeeCode("EMP-1004")
                        .firstName("Rohan")
                        .lastName("Kulkarni")
                        .fullName("Rohan Kulkarni")
                        .email("rohan.kulkarni@ems.com")
                        .phone("9765432109")
                        .department("Human Resources")
                        .designation("HR Specialist")
                        .role(Role.HR)
                        .status(UserStatus.ONBOARDING)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Pune (Hybrid)")
                        .managerName("Kavita Deshmukh")
                        .skills("Recruitment, HR Analytics")
                        .bio("Recently transitioned into the corporate HR team.")
                        .joinedOn(LocalDate.of(2024, 1, 15))
                        .password(defaultPasswordHash)
                        .build(),

                // 5. HR (Human Resources)
                User.builder()
                        .employeeCode("EMP-1005")
                        .firstName("Ananya")
                        .lastName("Iyer")
                        .fullName("Ananya Iyer")
                        .email("ananya.iyer@ems.com")
                        .phone("9845012345")
                        .department("Human Resources")
                        .designation("Senior HR Associate")
                        .role(Role.HR)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Bengaluru")
                        .managerName("Kavita Deshmukh")
                        .skills("Payroll, Benefits Administration")
                        .bio("Handles compensation, benefits, and statutory compliance.")
                        .joinedOn(LocalDate.of(2023, 5, 20))
                        .password(defaultPasswordHash)
                        .build(),

                // 6. Employee (Engineering)
                User.builder()
                        .employeeCode("EMP-1006")
                        .firstName("Priya")
                        .lastName("Nair")
                        .fullName("Priya Nair")
                        .email("priya.nair@ems.com")
                        .phone("9830198765")
                        .department("Engineering")
                        .designation("Senior Full Stack Developer")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Bengaluru")
                        .managerName("System Admin")
                        .skills("Angular, Spring Boot, MySQL, REST")
                        .bio("Senior engineer working on core dashboard microservices.")
                        .joinedOn(LocalDate.of(2023, 6, 5))
                        .password(defaultPasswordHash)
                        .build(),

                // 7. Employee (Finance & Operations) - Inactive
                User.builder()
                        .employeeCode("EMP-1007")
                        .firstName("Vikramaditya")
                        .lastName("Rao")
                        .fullName("Vikramaditya Rao")
                        .email("vikram.rao@ems.com")
                        .phone("9900112233")
                        .department("Finance & Operations")
                        .designation("Senior Financial Analyst")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.INACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Hyderabad")
                        .managerName("Aarav Sharma")
                        .skills("Financial Modeling, Budgeting, Auditing")
                        .bio("Former financial analyst currently on inactive status.")
                        .joinedOn(LocalDate.of(2022, 8, 19))
                        .password(defaultPasswordHash)
                        .build(),

                // 8. Employee (Finance & Operations)
                User.builder()
                        .employeeCode("EMP-1008")
                        .firstName("Sneha")
                        .lastName("Patel")
                        .fullName("Sneha Patel")
                        .email("sneha.patel@ems.com")
                        .phone("9822334455")
                        .department("Finance & Operations")
                        .designation("Finance Manager")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Ahmedabad (Hybrid)")
                        .managerName("Aarav Sharma")
                        .skills("Corporate Accounting, Tax Planning, SAP")
                        .bio("Oversees company accounting and quarterly reporting.")
                        .joinedOn(LocalDate.of(2023, 4, 10))
                        .password(defaultPasswordHash)
                        .build(),

                // 9. Employee (Sales & Partnerships) - ON_LEAVE
                User.builder()
                        .employeeCode("EMP-1009")
                        .firstName("Karthik")
                        .lastName("Subramanian")
                        .fullName("Karthik Subramanian")
                        .email("karthik.s@ems.com")
                        .phone("9840987654")
                        .department("Sales & Partnerships")
                        .designation("Account Executive")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ON_LEAVE)
                        .employmentType(EmploymentType.FULL_TIME)
                        .workLocation("Chennai")
                        .managerName("Aarav Sharma")
                        .skills("Client Relations, Enterprise Sales, CRM")
                        .bio("Enterprise sales lead; currently on approved sabbatical leave.")
                        .joinedOn(LocalDate.of(2024, 3, 18))
                        .password(defaultPasswordHash)
                        .build(),

                // 10. Employee (Finance & Operations) - Inactive / Contract
                User.builder()
                        .employeeCode("EMP-1010")
                        .firstName("Siddharth")
                        .lastName("Verma")
                        .fullName("Siddharth Verma")
                        .email("siddharth.verma@ems.com")
                        .phone("9818776655")
                        .department("Finance & Operations")
                        .designation("Logistics Coordinator")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.INACTIVE)
                        .employmentType(EmploymentType.CONTRACT)
                        .workLocation("Delhi NCR")
                        .managerName("Aarav Sharma")
                        .skills("Supply Chain, Vendor Management")
                        .bio("Past operations contractor.")
                        .joinedOn(LocalDate.of(2023, 7, 24))
                        .password(defaultPasswordHash)
                        .build(),

                // 11. Employee (Support) - Part time
                User.builder()
                        .employeeCode("EMP-1011")
                        .firstName("Divya")
                        .lastName("Menon")
                        .fullName("Divya Menon")
                        .email("divya.menon@ems.com")
                        .phone("9895123456")
                        .department("Support")
                        .designation("Customer Success Specialist")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.PART_TIME)
                        .workLocation("Kochi (Remote)")
                        .managerName("Aarav Sharma")
                        .skills("Customer Support, Zendesk, Technical Writing")
                        .bio("Provides customer assistance and helps manage helpdesk SLA.")
                        .joinedOn(LocalDate.of(2024, 5, 2))
                        .password(defaultPasswordHash)
                        .build(),

                // 12. Employee (Support) - Intern
                User.builder()
                        .employeeCode("EMP-1012")
                        .firstName("Arjun")
                        .lastName("Malhotra")
                        .fullName("Arjun Malhotra")
                        .email("arjun.malhotra@ems.com")
                        .phone("9810456789")
                        .department("Support")
                        .designation("Support Intern")
                        .role(Role.EMPLOYEE)
                        .status(UserStatus.ACTIVE)
                        .employmentType(EmploymentType.INTERN)
                        .workLocation("Chandigarh (Hybrid)")
                        .managerName("Divya Menon")
                        .skills("Troubleshooting, Incident Tracking")
                        .bio("Intern supporting the technical support team.")
                        .joinedOn(LocalDate.of(2024, 7, 11))
                        .password(defaultPasswordHash)
                        .build()
        );

        userRepository.saveAll(seedUsers);
        log.info("Successfully seeded {} employee records into users table.", seedUsers.size());
    }
}
