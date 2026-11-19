package com.sec.team2.ems.user;

import com.sec.team2.ems.common.Role;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for transforming between User JPA entities and DTOs.
 * Isolates mapping and formatting logic for employee and user details.
 */
@Component
public class UserMapper {

    public UserResponse toResponse(User entity) {
        if (entity == null) {
            return null;
        }
        return UserResponse.builder()
                .id(entity.getId())
                .employeeCode(entity.getEmployeeCode())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .department(entity.getDepartment())
                .designation(entity.getDesignation())
                .joinedOn(entity.getJoinedOn())
                .status(entity.getStatus())
                .employmentType(entity.getEmploymentType())
                .workLocation(entity.getWorkLocation())
                .managerName(entity.getManagerName())
                .skills(entity.getSkills())
                .bio(entity.getBio())
                .role(entity.getRole())
                .build();
    }

    public User toEntity(UserRequest request, String passwordHash, String employeeCode, Role role) {
        if (request == null) {
            return null;
        }

        String fName = request.getFirstName() != null ? request.getFirstName().trim() : "";
        String lName = request.getLastName() != null ? request.getLastName().trim() : "";
        String computedFullName = (fName + " " + lName).trim();

        return User.builder()
                .employeeCode(employeeCode)
                .firstName(fName)
                .lastName(lName)
                .fullName(computedFullName.isEmpty() ? fName : computedFullName)
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : null)
                .designation(request.getDesignation() != null ? request.getDesignation().trim() : null)
                .joinedOn(request.getJoinedOn())
                .status(request.getStatus())
                .employmentType(request.getEmploymentType())
                .workLocation(request.getWorkLocation() != null ? request.getWorkLocation().trim() : null)
                .managerName(request.getManagerName() != null ? request.getManagerName().trim() : null)
                .skills(request.getSkills() != null ? request.getSkills().trim() : null)
                .bio(request.getBio() != null ? request.getBio().trim() : null)
                .role(role != null ? role : Role.EMPLOYEE)
                .password(passwordHash)
                .build();
    }

    public void updateEntity(User entity, UserRequest request) {
        if (entity == null || request == null) {
            return;
        }

        String fName = request.getFirstName() != null ? request.getFirstName().trim() : "";
        String lName = request.getLastName() != null ? request.getLastName().trim() : "";
        String computedFullName = (fName + " " + lName).trim();

        entity.setFirstName(fName);
        entity.setLastName(lName);
        entity.setFullName(computedFullName.isEmpty() ? fName : computedFullName);
        entity.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : entity.getEmail());
        entity.setPhone(request.getPhone() != null ? request.getPhone().trim() : entity.getPhone());
        entity.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : entity.getDepartment());
        entity.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : entity.getDesignation());
        entity.setJoinedOn(request.getJoinedOn());
        entity.setStatus(request.getStatus());
        entity.setEmploymentType(request.getEmploymentType());
        entity.setWorkLocation(request.getWorkLocation() != null ? request.getWorkLocation().trim() : null);
        entity.setManagerName(request.getManagerName() != null ? request.getManagerName().trim() : null);
        entity.setSkills(request.getSkills() != null ? request.getSkills().trim() : null);
        entity.setBio(request.getBio() != null ? request.getBio().trim() : null);

        // Note: role, password, and employeeCode are intentionally NOT modified here.
    }
}
