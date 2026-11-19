package com.sec.team2.ems.auth;

import com.sec.team2.ems.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Service for issuing and validating JSON Web Tokens (JWT) using HMAC-SHA256.
 * Encapsulates token lifecycle, claims extraction, and signature verification.
 */
@Slf4j
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-minutes:120}")
    private long expirationMinutes;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a signed JWT for the given authenticated User.
     * Claims include:
     * - sub: email
     * - name: fullName
     * - role: ADMIN | HR | EMPLOYEE (without ROLE_ prefix)
     * - iat: current timestamp
     * - exp: expiration timestamp
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMinutes * 60 * 1000L);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("name", user.getFullName())
                .claim("role", user.getRole() != null ? user.getRole().name() : "EMPLOYEE")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Safely extracts the email (subject) from the token. Returns null if invalid.
     */
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * Checks if the token is valid, unexpired, and authentic.
     * Tampered or expired tokens fail safely and return false.
     */
    public boolean isTokenValid(String token) {
        Claims claims = extractAllClaims(token);
        if (claims == null) {
            return false;
        }
        Date expiration = claims.getExpiration();
        return expiration != null && !expiration.before(new Date());
    }

    /**
     * Extracts all claims from the signed JWT.
     * Catches any JwtException, IllegalArgumentException, or parsing error safely.
     */
    public Claims extractAllClaims(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token.trim())
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT verification failed: {}", ex.getMessage());
            return null;
        }
    }
}

