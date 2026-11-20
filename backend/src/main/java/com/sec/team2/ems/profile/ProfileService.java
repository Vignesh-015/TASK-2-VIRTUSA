package com.sec.team2.ems.profile;

import com.sec.team2.ems.common.BadRequestException;
import com.sec.team2.ems.common.ResourceNotFoundException;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class implementing business operations for user self-service profile management.
 * Handles reading own profile, updating permitted personal details, and securely changing passwords.
 * Resolves the authenticated user strictly from the JWT SecurityContext.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieves the profile of the currently logged-in user.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return profileMapper.toResponse(user);
    }

    /**
     * Updates permitted profile fields for the logged-in user.
     * System fields (email, role, department, employee code) are completely unaffected.
     */
    public ProfileResponse updateCurrentUserProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setFullName((request.getFirstName().trim() + " " + request.getLastName().trim()).trim());
        user.setPhone(request.getPhone().trim());
        user.setWorkLocation(request.getWorkLocation() != null ? request.getWorkLocation().trim() : null);
        user.setSkills(request.getSkills() != null ? request.getSkills().trim() : null);
        user.setBio(request.getBio() != null ? request.getBio().trim() : null);
        user.setEmergencyContactName(request.getEmergencyContactName() != null ? request.getEmergencyContactName().trim() : null);
        user.setEmergencyContactRelation(request.getEmergencyContactRelation() != null ? request.getEmergencyContactRelation().trim() : null);
        user.setEmergencyContactPhone(request.getEmergencyContactPhone() != null ? request.getEmergencyContactPhone().trim() : null);

        User saved = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", saved.getEmail());
        return profileMapper.toResponse(saved);
    }

    /**
     * Changes password for the logged-in user after validating confirmation,
     * current password hash, and distinctness.
     */
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // 1. Password confirmation match check
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        // 2. Current password verification check
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // 3. New password distinctness check
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from the current password");
        }

        // 4. Encode and persist new password hash
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully updated for user: {}", user.getEmail());
    }

    /**
     * Resolves the User entity matching the email in the current Spring Security context.
     */
    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Extracts email address from the authenticated SecurityContext principal.
     */
    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found in security context");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String principalString && !principalString.equalsIgnoreCase("anonymousUser")) {
            return principalString;
        }

        return auth.getName();
    }
}

