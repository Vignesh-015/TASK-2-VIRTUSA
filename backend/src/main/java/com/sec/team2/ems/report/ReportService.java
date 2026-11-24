package com.sec.team2.ems.report;

import com.sec.team2.ems.common.BadRequestException;
import com.sec.team2.ems.department.Department;
import com.sec.team2.ems.department.DepartmentRepository;
import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service calculating workforce analytics, department distributions,
 * status health, and monthly hiring trends directly from database queries.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Aggregates headcounts and percentages for all registered departments,
     * including empty departments (headcount 0) and any unlisted departments carried by employees.
     */
    public List<DepartmentReportItem> getDepartmentReport(String startDateStr, String endDateStr) {
        LocalDate startDate = parseDate(startDateStr);
        LocalDate endDate = parseDate(endDateStr);
        validateRange(startDate, endDate);

        long totalFiltered = userRepository.countEmployeesBetween(startDate, endDate);

        List<Department> registeredDepts = departmentRepository.findAllByOrderByNameAsc();
        List<Object[]> grouped = userRepository.countEmployeesByDepartmentGroupedBetween(startDate, endDate);

        Map<String, Long> userCountsLower = new HashMap<>();
        Map<String, String> originalDeptNameMap = new HashMap<>();

        for (Object[] row : grouped) {
            String deptName = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            if (deptName != null && !deptName.isBlank()) {
                String key = deptName.trim().toLowerCase();
                userCountsLower.put(key, count);
                originalDeptNameMap.put(key, deptName.trim());
            }
        }

        List<DepartmentReportItem> registeredList = new ArrayList<>();
        Set<String> matchedKeys = new HashSet<>();

        for (Department dept : registeredDepts) {
            String key = dept.getName().trim().toLowerCase();
            matchedKeys.add(key);
            long count = userCountsLower.getOrDefault(key, 0L);
            double percentage = totalFiltered > 0
                    ? Math.round(((count * 100.0) / totalFiltered) * 10.0) / 10.0
                    : 0.0;

            registeredList.add(DepartmentReportItem.builder()
                    .department(dept.getName())
                    .headcount(count)
                    .percentage(percentage)
                    .build());
        }

        // Unlisted departments carried by employees with count > 0
        List<DepartmentReportItem> unlistedList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : userCountsLower.entrySet()) {
            if (!matchedKeys.contains(entry.getKey()) && entry.getValue() > 0) {
                String originalName = originalDeptNameMap.getOrDefault(entry.getKey(), entry.getKey());
                long count = entry.getValue();
                double percentage = totalFiltered > 0
                        ? Math.round(((count * 100.0) / totalFiltered) * 10.0) / 10.0
                        : 0.0;

                unlistedList.add(DepartmentReportItem.builder()
                        .department(originalName)
                        .headcount(count)
                        .percentage(percentage)
                        .build());
            }
        }

        // Sort registered departments: headcount descending, then name ascending
        registeredList.sort(Comparator
                .comparingLong(DepartmentReportItem::getHeadcount).reversed()
                .thenComparing(DepartmentReportItem::getDepartment, String.CASE_INSENSITIVE_ORDER));

        // Sort unlisted departments: headcount descending, then name ascending
        unlistedList.sort(Comparator
                .comparingLong(DepartmentReportItem::getHeadcount).reversed()
                .thenComparing(DepartmentReportItem::getDepartment, String.CASE_INSENSITIVE_ORDER));

        registeredList.addAll(unlistedList);
        return registeredList;
    }

    /**
     * Aggregates account status counts and percentages across all four statuses in fixed order.
     */
    public List<StatusReportItem> getStatusDistribution(String startDateStr, String endDateStr) {
        LocalDate startDate = parseDate(startDateStr);
        LocalDate endDate = parseDate(endDateStr);
        validateRange(startDate, endDate);

        long totalFiltered = userRepository.countEmployeesBetween(startDate, endDate);
        List<Object[]> grouped = userRepository.countEmployeesByStatusGroupedBetween(startDate, endDate);

        Map<UserStatus, Long> statusCounts = new HashMap<>();
        for (Object[] row : grouped) {
            UserStatus status = (UserStatus) row[0];
            Long count = ((Number) row[1]).longValue();
            if (status != null) {
                statusCounts.put(status, count);
            }
        }

        UserStatus[] fixedOrder = {
                UserStatus.ACTIVE,
                UserStatus.ONBOARDING,
                UserStatus.ON_LEAVE,
                UserStatus.INACTIVE
        };

        List<StatusReportItem> items = new ArrayList<>();
        for (UserStatus status : fixedOrder) {
            long count = statusCounts.getOrDefault(status, 0L);
            double percentage = totalFiltered > 0
                    ? Math.round(((count * 100.0) / totalFiltered) * 10.0) / 10.0
                    : 0.0;

            items.add(StatusReportItem.builder()
                    .status(status.name())
                    .count(count)
                    .percentage(percentage)
                    .build());
        }

        return items;
    }

    /**
     * Compiles chronological monthly join counts (yyyy-MM) for every month in range with zero-fill.
     * Defaults to the last 12 months ending with current month when dates are omitted.
     */
    public List<MonthlyJoinItem> getMonthlyJoins(String startDateStr, String endDateStr) {
        LocalDate startDate = parseDate(startDateStr);
        LocalDate endDate = parseDate(endDateStr);
        validateRange(startDate, endDate);

        YearMonth startMonth;
        YearMonth endMonth;

        if (startDate == null && endDate == null) {
            endMonth = YearMonth.now();
            startMonth = endMonth.minusMonths(11);
        } else if (startDate != null && endDate != null) {
            startMonth = YearMonth.from(startDate);
            endMonth = YearMonth.from(endDate);
        } else if (startDate != null) {
            startMonth = YearMonth.from(startDate);
            endMonth = YearMonth.now();
            if (startMonth.isAfter(endMonth)) {
                endMonth = startMonth;
            }
        } else {
            endMonth = YearMonth.from(endDate);
            startMonth = endMonth.minusMonths(11);
        }

        long months = ChronoUnit.MONTHS.between(startMonth, endMonth) + 1;
        if (months <= 0) {
            throw new BadRequestException("Invalid date range");
        }
        if (months > 60) {
            throw new BadRequestException("Date range too large");
        }

        LocalDate rangeStart = (startDate != null) ? startDate : startMonth.atDay(1);
        LocalDate rangeEnd = (endDate != null) ? endDate : endMonth.atEndOfMonth();

        List<Object[]> grouped = userRepository.countMonthlyJoinsBetween(rangeStart, rangeEnd);
        Map<String, Long> monthlyCounts = new HashMap<>();
        for (Object[] row : grouped) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            String key = String.format("%04d-%02d", year, month);
            monthlyCounts.put(key, count);
        }

        List<MonthlyJoinItem> result = new ArrayList<>();
        YearMonth cur = startMonth;
        while (!cur.isAfter(endMonth)) {
            String key = String.format("%04d-%02d", cur.getYear(), cur.getMonthValue());
            long count = monthlyCounts.getOrDefault(key, 0L);
            result.add(MonthlyJoinItem.builder()
                    .month(key)
                    .count(count)
                    .build());
            cur = cur.plusMonths(1);
        }

        return result;
    }

    /**
     * Returns executive summary figures for the filtered workforce.
     */
    public ReportSummaryResponse getSummary(String startDateStr, String endDateStr) {
        LocalDate startDate = parseDate(startDateStr);
        LocalDate endDate = parseDate(endDateStr);
        validateRange(startDate, endDate);

        long joinedInRange = userRepository.countEmployeesBetween(startDate, endDate);
        List<Object[]> grouped = userRepository.countEmployeesByStatusGroupedBetween(startDate, endDate);

        long active = 0;
        long inactive = 0;
        for (Object[] row : grouped) {
            UserStatus status = (UserStatus) row[0];
            long count = ((Number) row[1]).longValue();
            if (status == UserStatus.ACTIVE) {
                active = count;
            } else if (status == UserStatus.INACTIVE) {
                inactive = count;
            }
        }

        return ReportSummaryResponse.builder()
                .totalEmployees(joinedInRange)
                .activeEmployees(active)
                .inactiveEmployees(inactive)
                .joinedInRange(joinedInRange)
                .build();
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date range");
        }
    }

    private void validateRange(LocalDate start, LocalDate end) {
        if (start != null && end != null && start.isAfter(end)) {
            throw new BadRequestException("Invalid date range");
        }
    }
}

