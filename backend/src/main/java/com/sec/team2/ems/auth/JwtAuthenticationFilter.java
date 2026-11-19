package com.sec.team2.ems.auth;

import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filter that intercepts incoming HTTP requests to validate Bearer JWT tokens.
 * Populates Spring Security's SecurityContext with the authenticated user and
 * granted authorities ("ROLE_" + role) if the token is valid and user is not INACTIVE.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path != null && path.startsWith("/auth");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7).trim();

        try {
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                        if (user.getStatus() != UserStatus.INACTIVE) {
                            String roleName = user.getRole() != null ? user.getRole().name() : "EMPLOYEE";
                            List<SimpleGrantedAuthority> authorities = List.of(
                                    new SimpleGrantedAuthority("ROLE_" + roleName)
                            );

                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    authorities
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        } else {
                            log.debug("User {} is INACTIVE; skipping authentication.", email);
                        }
                    });
                }
            }
        } catch (Exception ex) {
            log.debug("Error processing JWT token in filter: {}", ex.getMessage());
            // Clear context and continue without authentication; entry point handles 401
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

