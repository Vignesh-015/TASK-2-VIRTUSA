package com.sec.team2.ems.department;

import org.springframework.stereotype.Component;

/**
 * Mapper utility to convert between Department entity and DTOs.
 */
@Component
public class DepartmentMapper {

    public DepartmentResponse toResponse(Department entity, long employeeCount) {
        if (entity == null) {
            return null;
        }
        return DepartmentResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .headName(entity.getHeadName())
                .headEmail(entity.getHeadEmail())
                .headAvatar(entity.getHeadAvatar())
                .budget(entity.getBudget())
                .location(entity.getLocation())
                .color(entity.getColor())
                .employeeCount(employeeCount)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Department toEntity(DepartmentRequest request) {
        if (request == null) {
            return null;
        }
        return Department.builder()
                .name(request.getName() != null ? request.getName().trim() : null)
                .code(request.getCode() != null ? request.getCode().trim() : null)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .headName(request.getHeadName() != null ? request.getHeadName().trim() : null)
                .headEmail(request.getHeadEmail() != null ? request.getHeadEmail().trim() : null)
                .headAvatar(request.getHeadAvatar() != null ? request.getHeadAvatar().trim() : null)
                .budget(request.getBudget() != null ? request.getBudget().trim() : null)
                .location(request.getLocation() != null ? request.getLocation().trim() : null)
                .color(request.getColor() != null ? request.getColor().trim() : null)
                .build();
    }

    public void updateEntity(Department entity, DepartmentRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setName(request.getName() != null ? request.getName().trim() : entity.getName());
        entity.setCode(request.getCode() != null ? request.getCode().trim() : null);
        entity.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        entity.setHeadName(request.getHeadName() != null ? request.getHeadName().trim() : null);
        entity.setHeadEmail(request.getHeadEmail() != null ? request.getHeadEmail().trim() : null);
        entity.setHeadAvatar(request.getHeadAvatar() != null ? request.getHeadAvatar().trim() : null);
        entity.setBudget(request.getBudget() != null ? request.getBudget().trim() : null);
        entity.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        entity.setColor(request.getColor() != null ? request.getColor().trim() : null);
    }
}

