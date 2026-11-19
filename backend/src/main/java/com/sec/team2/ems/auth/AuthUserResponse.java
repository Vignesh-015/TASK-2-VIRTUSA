package com.sec.team2.ems.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sec.team2.ems.common.Role;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

/**
 * Data Transfer Object representing the user entity in authentication responses.
 * Strictly conforms to the shape expected by the Angular frontend (core/models/user.model.ts).
 * Never exposes passwords or internal secrets.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthUserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String avatar;
    private String employeeId;
    private String department;
    private String designation;
    private String phone;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String joinDate;

    private String location;
    private UserStatus status;

    public static AuthUserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        String joinDateStr = null;
        if (user.getJoinedOn() != null) {
            joinDateStr = user.getJoinedOn().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }

        return AuthUserResponse.builder()
                .id(user.getId() != null ? String.valueOf(user.getId()) : null)
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatar(null)
                .employeeId(user.getEmployeeCode())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .phone(user.getPhone())
                .joinDate(joinDateStr)
                .location(user.getWorkLocation())
                .status(user.getStatus())
                .build();
    }
}

