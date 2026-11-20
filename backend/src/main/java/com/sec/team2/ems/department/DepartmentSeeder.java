package com.sec.team2.ems.department;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeder to initialize standard organizational departments if the table is empty.
 * Runs on startup with Order 1.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DepartmentSeeder implements ApplicationRunner {

    private final DepartmentRepository departmentRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (departmentRepository.count() > 0) {
            log.info("Departments table already contains data ({} records). Skipping DepartmentSeeder.", departmentRepository.count());
            return;
        }

        log.info("Departments table is empty. Seeding initial standard departments...");

        List<Department> initialDepartments = List.of(
                Department.builder()
                        .name("Engineering")
                        .code("ENG")
                        .description("Core platform engineering, cloud infrastructure, security architectures, and microservices.")
                        .headName("Alexander Hayes")
                        .headEmail("alexander.hayes@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                        .budget("$2.4M")
                        .location("Building A, Floor 4")
                        .color("#2563EB")
                        .build(),

                Department.builder()
                        .name("Product & Design")
                        .code("PRD")
                        .description("Product discovery, UX research, enterprise design systems, and product lifecycle roadmap.")
                        .headName("Marcus Chen")
                        .headEmail("marcus.chen@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                        .budget("$1.2M")
                        .location("Building A, Floor 3")
                        .color("#0D9488")
                        .build(),

                Department.builder()
                        .name("Marketing")
                        .code("MKT")
                        .description("Brand positioning, global communications, product marketing, and demand generation.")
                        .headName("Elena Rostova")
                        .headEmail("elena.rostova@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80")
                        .budget("$950K")
                        .location("Building B, Floor 2")
                        .color("#D97706")
                        .build(),

                Department.builder()
                        .name("Human Resources")
                        .code("HRD")
                        .description("People experience, talent acquisition, total rewards, and compliance operations.")
                        .headName("Sarah Jenkins")
                        .headEmail("sarah.jenkins@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80")
                        .budget("$680K")
                        .location("Building A, Floor 2")
                        .color("#7C3AED")
                        .build(),

                Department.builder()
                        .name("Finance & Operations")
                        .code("FIN")
                        .description("Corporate financial planning, treasury, facilities management, and audit governance.")
                        .headName("David Kalu")
                        .headEmail("david.kalu@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                        .budget("$1.5M")
                        .location("Building B, Floor 4")
                        .color("#059669")
                        .build(),

                Department.builder()
                        .name("Sales & Partnerships")
                        .code("SLS")
                        .description("Enterprise account growth, global strategic alliances, client success, and sales enablement.")
                        .headName("Jessica Morales")
                        .headEmail("jessica.morales@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
                        .budget("$1.8M")
                        .location("Building B, Floor 3")
                        .color("#EA580C")
                        .build(),

                Department.builder()
                        .name("Support")
                        .code("SUP")
                        .description("Customer support, client issue resolution, technical helpdesk, and SLA management.")
                        .headName("Divya Menon")
                        .headEmail("divya.menon@employeehub.com")
                        .headAvatar("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80")
                        .budget("$500K")
                        .location("Building B, Floor 1")
                        .color("#6366F1")
                        .build()
        );

        departmentRepository.saveAll(initialDepartments);
        log.info("Successfully seeded {} initial departments.", initialDepartments.size());
    }
}

