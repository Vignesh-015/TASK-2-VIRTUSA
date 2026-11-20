package com.sec.team2.ems.profile;

import com.sec.team2.ems.user.User;
import org.springframework.stereotype.Component;

/**
 * Mapper component responsible for transforming User JPA entities into ProfileResponse DTOs.
 */
@Component
public class ProfileMapper {

    public ProfileResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return ProfileResponse.builder()
                .id(user.getId())
                .employeeCode(user.getEmployeeCode())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .joinedOn(user.getJoinedOn())
                .status(user.getStatus())
                .employmentType(user.getEmploymentType())
                .workLocation(user.getWorkLocation())
                .managerName(user.getManagerName())
                .skills(user.getSkills())
                .bio(user.getBio())
                .role(user.getRole())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactRelation(user.getEmergencyContactRelation())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .build();
    }
}

