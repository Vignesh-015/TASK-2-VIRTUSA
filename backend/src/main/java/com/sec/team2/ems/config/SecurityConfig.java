package com.sec.team2.ems.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sec.team2.ems.auth.JwtAuthenticationFilter;
import com.sec.team2.ems.common.ApiError;
import com.sec.team2.ems.user.UserRepository;
import com.sec.team2.ems.user.UserStatus;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.Instant;
import java.util.Arrays;

/**
 * Spring Security configuration enabling JWT-based stateless authentication,
 * endpoint authorization rules, CORS, and custom error responses.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isH2Active = Arrays.asList(environment.getActiveProfiles()).contains("h2");

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/health").permitAll();
                    if (isH2Active) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ApiError error = ApiError.builder()
                    .timestamp(Instant.now())
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                    .message("Authentication required")
                    .build();
            response.getWriter().write(objectMapper.writeValueAsString(error));
            response.getWriter().flush();
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ApiError error = ApiError.builder()
                    .timestamp(Instant.now())
                    .status(HttpStatus.FORBIDDEN.value())
                    .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                    .message("You do not have permission to perform this action")
                    .build();
            response.getWriter().write(objectMapper.writeValueAsString(error));
            response.getWriter().flush();
        };
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByEmailIgnoreCase(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole() != null ? user.getRole().name() : "EMPLOYEE")
                        .disabled(user.getStatus() == UserStatus.INACTIVE)
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
