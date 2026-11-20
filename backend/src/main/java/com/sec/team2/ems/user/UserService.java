package com.sec.team2.ems.user;

import com.sec.team2.ems.common.BadRequestException;
import com.sec.team2.ems.common.BusinessRuleException;
import com.sec.team2.ems.common.DuplicateResourceException;
import com.sec.team2.ems.common.ResourceNotFoundException;
import com.sec.team2.ems.common.Role;
import com.sec.team2.ems.department.Department;
import com.sec.team2.ems.department.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class implementing the core business logic for user and employee management.
 * Manages employee profiles, email uniqueness, employee code generation, role/status mutations,
 * and business rules preventing deactivation or demotion of the last active admin.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    // TEMPORARY until the auth module adds proper password setup
    public static final String DEFAULT_TEMP_PASSWORD = "Welcome@123";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdAsc()
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            String normalizedDept = validateAndNormalizeDepartment(request.getDepartment(), false);
            request.setDepartment(normalizedDept);
        }

        String passwordHash = passwordEncoder.encode(DEFAULT_TEMP_PASSWORD);
        String employeeCode = generateNextEmployeeCode();
        User entity = userMapper.toEntity(request, passwordHash, employeeCode, Role.EMPLOYEE);

        try {
            User saved = userRepository.save(entity);
            return userMapper.toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Collision detected for code {}. Retrying once with next code.", employeeCode);
            employeeCode = generateNextEmployeeCode();
            entity.setEmployeeCode(employeeCode);
            User saved = userRepository.save(entity);
            return userMapper.toResponse(saved);
        }
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail().trim(), id)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            String normalizedDept = validateAndNormalizeDepartment(request.getDepartment(), false);
            request.setDepartment(normalizedDept);
        }

        userMapper.updateEntity(existingUser, request);
        User updated = userRepository.save(existingUser);
        return userMapper.toResponse(updated);
    }

    @Transactional
    public UserResponse updateRole(Long id, RoleUpdateRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (existingUser.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN
                && existingUser.getStatus() == UserStatus.ACTIVE) {
            long activeAdminCount = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
            if (activeAdminCount <= 1) {
                throw new BusinessRuleException("The last admin cannot be changed");
            }
        }

        existingUser.setRole(request.getRole());
        User updated = userRepository.save(existingUser);
        return userMapper.toResponse(updated);
    }

    @Transactional
    public UserResponse updateStatus(Long id, StatusUpdateRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (existingUser.getRole() == Role.ADMIN && existingUser.getStatus() == UserStatus.ACTIVE
                && request.getStatus() == UserStatus.INACTIVE) {
            long activeAdminCount = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
            if (activeAdminCount <= 1) {
                throw new BusinessRuleException("The last active admin cannot be deactivated");
            }
        }

        existingUser.setStatus(request.getStatus());
        User updated = userRepository.save(existingUser);
        return userMapper.toResponse(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (existingUser.getRole() == Role.ADMIN && existingUser.getStatus() == UserStatus.ACTIVE) {
            long activeAdminCount = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
            if (activeAdminCount <= 1) {
                throw new BusinessRuleException("The last active admin cannot be deactivated");
            }
        }

        // Soft delete: deactivate the record, never drop the database row
        existingUser.setStatus(UserStatus.INACTIVE);
        userRepository.save(existingUser);
    }

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmailIgnoreCase(user.getEmail().trim())) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        if (user.getDepartment() != null && !user.getDepartment().isBlank()) {
            String normalizedDept = validateAndNormalizeDepartment(user.getDepartment(), true);
            user.setDepartment(normalizedDept);
        }

        if (user.getEmployeeCode() == null || user.getEmployeeCode().isBlank()) {
            user.setEmployeeCode(generateNextEmployeeCode());
        }
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Collision detected for code {}. Retrying once with next code.", user.getEmployeeCode());
            user.setEmployeeCode(generateNextEmployeeCode());
            return userRepository.save(user);
        }
    }

    private String validateAndNormalizeDepartment(String rawDepartment, boolean allowNotAssigned) {
        if (rawDepartment == null || rawDepartment.isBlank()) {
            return rawDepartment;
        }
        String trimmed = rawDepartment.trim();
        if (allowNotAssigned && trimmed.equalsIgnoreCase("Not assigned")) {
            return "Not assigned";
        }
        return departmentRepository.findByNameIgnoreCase(trimmed)
                .map(Department::getName)
                .orElseThrow(() -> new BadRequestException("Department does not exist"));
    }

    public synchronized String generateNextEmployeeCode() {
        List<String> codes = userRepository.findAllEmployeeCodes();
        int maxNumber = 1000;
        for (String code : codes) {
            if (code != null && code.startsWith("EMP-")) {
                try {
                    int num = Integer.parseInt(code.substring(4).trim());
                    if (num > maxNumber) {
                        maxNumber = num;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return "EMP-" + (maxNumber + 1);
    }
}
