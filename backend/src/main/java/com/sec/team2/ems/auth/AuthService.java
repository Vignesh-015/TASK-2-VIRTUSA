package com.sec.team2.ems.auth;

import com.sec.team2.ems.common.AuthenticationFailedException;
import com.sec.team2.ems.common.DuplicateResourceException;
import com.sec.team2.ems.common.Role;
import com.sec.team2.ems.user.EmploymentType;
import com.sec.team2.ems.user.User;
import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserService;
import com.sec.team2.ems.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Service managing user authentication and self-registration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationFailedException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AuthenticationFailedException("This account is inactive. Please contact your administrator.");
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(AuthUserResponse.fromEntity(user))
                .build();
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        String trimmedName = request.getName().trim();
        String firstName;
        String lastName;
        int spaceIdx = trimmedName.indexOf(' ');
        if (spaceIdx > 0) {
            firstName = trimmedName.substring(0, spaceIdx).trim();
            lastName = trimmedName.substring(spaceIdx + 1).trim();
            if (lastName.isEmpty()) {
                lastName = "-";
            }
        } else {
            firstName = trimmedName;
            lastName = "-";
        }

        String department = (request.getDepartment() != null && !request.getDepartment().isBlank())
                ? request.getDepartment().trim()
                : "Not assigned";

        User newUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .fullName(trimmedName)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone("Not provided")
                .department(department)
                .designation("Not set")
                .role(Role.EMPLOYEE) // Always default to EMPLOYEE, ignoring requested role
                .status(UserStatus.ACTIVE)
                .employmentType(EmploymentType.FULL_TIME)
                .joinedOn(LocalDate.now())
                .workLocation("Chennai (Hybrid)")
                .build();

        User saved = userService.registerUser(newUser);

        return RegisterResponse.builder()
                .message("Account created successfully. You can sign in now.")
                .user(AuthUserResponse.fromEntity(saved))
                .build();
    }
}

