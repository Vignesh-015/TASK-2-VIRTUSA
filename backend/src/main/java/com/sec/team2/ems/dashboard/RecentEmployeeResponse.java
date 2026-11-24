package com.sec.team2.ems.dashboard;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sec.team2.ems.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Summary details of a recently added employee for the recent additions panel.
 * Passwords and sensitive contact details are never included.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentEmployeeResponse {

    private Long id;
    private String employeeCode;
    private String fullName;
    private String department;
    private String designation;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate joinedOn;

    private UserStatus status;
}

