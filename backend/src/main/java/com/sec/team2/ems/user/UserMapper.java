package com.sec.team2.ems.user;

import org.springframework.stereotype.Component;

/**
 * Mapper utility for transforming between User entities and DTOs (UserRequest, UserResponse).
 * Isolates data transformation logic so neither entities nor controllers need conversion boilerplate.
 */
@Component
public class UserMapper {

    public UserResponse toResponse(User entity) {
        if (entity == null) {
            return null;
        }
        return UserResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .department(entity.getDepartment())
                .role(entity.getRole())
                .status(entity.getStatus())
                .joinedOn(entity.getJoinedOn())
                .build();
    }

    public User toEntity(UserRequest request, String passwordHash) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone().trim())
                .department(request.getDepartment().trim())
                .role(request.getRole())
                .status(request.getStatus())
                .joinedOn(request.getJoinedOn())
                .password(passwordHash)
                .build();
    }

    public void updateEntity(User entity, UserRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setFullName(request.getFullName().trim());
        entity.setEmail(request.getEmail().trim().toLowerCase());
        entity.setPhone(request.getPhone().trim());
        entity.setDepartment(request.getDepartment().trim());
        entity.setRole(request.getRole());
        entity.setStatus(request.getStatus());
        entity.setJoinedOn(request.getJoinedOn());
        // Note: The password hash is preserved and never overwritten by general profile updates.
    }
}

