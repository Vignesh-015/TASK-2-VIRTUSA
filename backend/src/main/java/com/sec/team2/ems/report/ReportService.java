package com.sec.team2.ems.report;

import com.sec.team2.ems.common.BusinessRuleException;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;

    public List<ReportEmployeeResponse> getEmployeeReports(
            String department,
            String status,
            LocalDate startDate,
            LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessRuleException("Start date cannot be after end date.");
        }

        List<User> allUsers = userRepository.findAllByOrderByIdAsc();
        List<ReportEmployeeResponse> reportList = new ArrayList<>();

        for (User user : allUsers) {
            if (department != null && !department.trim().isEmpty()) {
                if (user.getDepartment() == null ||
                        !user.getDepartment().equalsIgnoreCase(department.trim())) {
                    continue;
                }
            }

            if (status != null && !status.trim().isEmpty()) {
                if (user.getStatus() == null ||
                        !user.getStatus().name().equalsIgnoreCase(status.trim())) {
                    continue;
                }
            }

            if (startDate != null) {
                if (user.getJoinedOn() == null || user.getJoinedOn().isBefore(startDate)) {
                    continue;
                }
            }

            if (endDate != null) {
                if (user.getJoinedOn() == null || user.getJoinedOn().isAfter(endDate)) {
                    continue;
                }
            }

            ReportEmployeeResponse reportItem = ReportEmployeeResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .department(user.getDepartment())
                    .status(user.getStatus() != null ? user.getStatus().name() : null)
                    .joiningDate(user.getJoinedOn())
                    .roleOrDesignation(user.getRole() != null ? user.getRole().name() : null)
                    .build();

            reportList.add(reportItem);
        }

        return reportList;
    }
}
