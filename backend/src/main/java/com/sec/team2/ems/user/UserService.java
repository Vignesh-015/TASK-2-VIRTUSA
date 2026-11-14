package com.sec.team2.ems.user;

import com.sec.team2.ems.common.BusinessRuleException;
import com.sec.team2.ems.common.DuplicateResourceException;
import com.sec.team2.ems.common.ResourceNotFoundException;
import com.sec.team2.ems.common.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class implementing the core business logic for user management.
 * Handles user retrieval, validation of email uniqueness, initial password hashing,
 * and business rules like protecting the last remaining admin from deletion.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    // TEMPORARY until the auth module adds proper password setup
    public static final String DEFAULT_TEMP_PASSWORD = "Welcome@123";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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

        // Hash default temporary password for new users
        String passwordHash = passwordEncoder.encode(DEFAULT_TEMP_PASSWORD);
        User entity = userMapper.toEntity(request, passwordHash);
        User saved = userRepository.save(entity);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail().trim(), id)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        userMapper.updateEntity(existingUser, request);
        User updated = userRepository.save(existingUser);
        return userMapper.toResponse(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (existingUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BusinessRuleException("The last admin user cannot be deleted");
            }
        }

        userRepository.delete(existingUser);
    }
}

