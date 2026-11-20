package com.sec.team2.ems.department;

import com.sec.team2.ems.common.BusinessRuleException;
import com.sec.team2.ems.common.DuplicateResourceException;
import com.sec.team2.ems.common.ResourceNotFoundException;
import com.sec.team2.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing business logic for departments.
 * Handles department CRUD operations, live employee counts, and user synchronization on rename.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAllByOrderByNameAsc()
                .stream()
                .map(dept -> {
                    long count = userRepository.countByDepartmentIgnoreCase(dept.getName());
                    return departmentMapper.toResponse(dept, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + id));
        long count = userRepository.countByDepartmentIgnoreCase(dept.getName());
        return departmentMapper.toResponse(dept, count);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        String trimmedName = request.getName().trim();
        if (departmentRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("A department with this name already exists");
        }

        Department entity = departmentMapper.toEntity(request);
        Department saved = departmentRepository.save(entity);
        log.info("Created department '{}' with id {}", saved.getName(), saved.getId());
        return departmentMapper.toResponse(saved, 0L);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + id));

        String oldName = dept.getName();
        String newName = request.getName().trim();

        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new DuplicateResourceException("A department with this name already exists");
        }

        if (!oldName.equalsIgnoreCase(newName)) {
            int updatedUsers = userRepository.updateDepartmentName(oldName, newName);
            log.info("Renamed department from '{}' to '{}', updated {} user records.", oldName, newName, updatedUsers);
        }

        departmentMapper.updateEntity(dept, request);
        Department updated = departmentRepository.save(dept);
        long count = userRepository.countByDepartmentIgnoreCase(updated.getName());
        return departmentMapper.toResponse(updated, count);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + id));

        long employeeCount = userRepository.countByDepartmentIgnoreCase(dept.getName());
        if (employeeCount > 0) {
            throw new BusinessRuleException("Cannot delete a department that still has employees. Move them first.");
        }

        departmentRepository.delete(dept);
        log.info("Deleted department id {} ('{}')", id, dept.getName());
    }
}

