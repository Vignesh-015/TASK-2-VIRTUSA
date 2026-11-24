package com.sec.team2.ems.dashboard;

import com.sec.team2.ems.department.Department;
import com.sec.team2.ems.department.DepartmentRepository;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service providing aggregated workforce metrics, department headcounts,
 * and recent employee additions for the executive dashboard.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Calculates overall workforce statistics and status breakdowns from database counts.
     */
    public DashboardStatsResponse getStats() {
        long totalEmployees = userRepository.count();
        long activeEmployees = userRepository.countByStatus(UserStatus.ACTIVE);
        long onboardingEmployees = userRepository.countByStatus(UserStatus.ONBOARDING);
        long onLeaveEmployees = userRepository.countByStatus(UserStatus.ON_LEAVE);
        long inactiveEmployees = userRepository.countByStatus(UserStatus.INACTIVE);

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        long newJoinersThisMonth = userRepository.countByJoinedOnBetween(startOfMonth, endOfMonth);

        long totalDepartments = departmentRepository.count();

        double activePercentage = totalEmployees > 0
                ? Math.round(((activeEmployees * 100.0) / totalEmployees) * 10.0) / 10.0
                : 0.0;

        return DashboardStatsResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .onboardingEmployees(onboardingEmployees)
                .onLeaveEmployees(onLeaveEmployees)
                .inactiveEmployees(inactiveEmployees)
                .newJoinersThisMonth(newJoinersThisMonth)
                .totalDepartments(totalDepartments)
                .activePercentage(activePercentage)
                .build();
    }

    /**
     * Compiles headcount and percentage allocation for all registered departments,
     * including departments with 0 staff, plus any unlisted departments carried by employees.
     */
    public List<DepartmentHeadcountResponse> getDepartmentHeadcounts() {
        long totalEmployees = userRepository.count();

        // 1. Fetch all registered departments from the departments table
        List<Department> departments = departmentRepository.findAllByOrderByNameAsc();

        // 2. Fetch grouped counts of employees per department name
        List<Object[]> groupedCounts = userRepository.countEmployeesByDepartmentGrouped();
        Map<String, Long> userCountsLower = new HashMap<>();
        Map<String, String> originalDeptNameMap = new HashMap<>();

        for (Object[] row : groupedCounts) {
            String deptName = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            if (deptName != null && !deptName.isBlank()) {
                String key = deptName.trim().toLowerCase();
                userCountsLower.put(key, count);
                originalDeptNameMap.put(key, deptName.trim());
            }
        }

        // 3. Build list for all registered departments
        List<DepartmentHeadcountResponse> registeredList = new ArrayList<>();
        Set<String> matchedKeys = new HashSet<>();

        for (Department dept : departments) {
            String key = (dept.getName() != null) ? dept.getName().trim().toLowerCase() : "";
            matchedKeys.add(key);

            long headcount = userCountsLower.getOrDefault(key, 0L);
            double percentage = totalEmployees > 0
                    ? Math.round(((headcount * 100.0) / totalEmployees) * 10.0) / 10.0
                    : 0.0;

            registeredList.add(DepartmentHeadcountResponse.builder()
                    .department(dept.getName())
                    .headcount(headcount)
                    .percentage(percentage)
                    .build());
        }

        // Sort registered list: headcount descending, then department name ascending
        registeredList.sort(Comparator
                .comparingLong(DepartmentHeadcountResponse::getHeadcount).reversed()
                .thenComparing(DepartmentHeadcountResponse::getDepartment, String.CASE_INSENSITIVE_ORDER));

        // 4. Any unlisted department names that employees carry with count > 0
        List<DepartmentHeadcountResponse> unlistedList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : userCountsLower.entrySet()) {
            String key = entry.getKey();
            Long count = entry.getValue();
            if (!matchedKeys.contains(key) && count != null && count > 0) {
                String originalName = originalDeptNameMap.getOrDefault(key, key);
                double percentage = totalEmployees > 0
                        ? Math.round(((count * 100.0) / totalEmployees) * 10.0) / 10.0
                        : 0.0;

                unlistedList.add(DepartmentHeadcountResponse.builder()
                        .department(originalName)
                        .headcount(count)
                        .percentage(percentage)
                        .build());
            }
        }

        // Sort unlisted list: headcount descending, then name ascending
        unlistedList.sort(Comparator
                .comparingLong(DepartmentHeadcountResponse::getHeadcount).reversed()
                .thenComparing(DepartmentHeadcountResponse::getDepartment, String.CASE_INSENSITIVE_ORDER));

        // Append unlisted departments at the end
        registeredList.addAll(unlistedList);

        return registeredList;
    }

    /**
     * Retrieves the most recent employee additions ordered by joinedOn desc, id desc.
     */
    public List<RecentEmployeeResponse> getRecentEmployees(int limit) {
        int effectiveLimit = (limit >= 1 && limit <= 20) ? limit : 5;
        List<User> users = userRepository.findAllByOrderByJoinedOnDescIdDesc(PageRequest.of(0, effectiveLimit));

        return users.stream()
                .map(this::toRecentEmployeeResponse)
                .toList();
    }

    private RecentEmployeeResponse toRecentEmployeeResponse(User user) {
        String empCode = user.getEmployeeCode();
        if (empCode == null || empCode.isBlank()) {
            empCode = "EMP-" + user.getId();
        }

        return RecentEmployeeResponse.builder()
                .id(user.getId())
                .employeeCode(empCode)
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .joinedOn(user.getJoinedOn())
                .status(user.getStatus())
                .build();
    }
}

