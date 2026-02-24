package com.piun.piuproject.controller;

import com.piun.piuproject.dto.ChangePasswordRequest;
import com.piun.piuproject.security.JwtTokenProvider;
import com.piun.piuproject.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(HttpServletRequest request,
                                             @Valid @RequestBody ChangePasswordRequest changeRequest) {
        String authHeader = request.getHeader("Authorization");
        log.info("Change password request - Auth header present: {}, starts with Bearer: {}",
            authHeader != null, authHeader != null && authHeader.startsWith("Bearer "));

        String token = parseJwt(request);
        if (token == null) {
            log.warn("Change password - No JWT token found in request");
            return ResponseEntity.status(401).body(Map.of("error", "No authentication token provided"));
        }

        boolean valid = tokenProvider.validateToken(token);
        log.info("Change password - Token valid: {}, token length: {}", valid, token.length());

        if (!valid) {
            log.warn("Change password - Token validation failed");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token - please log in again"));
        }

        try {
            String username = tokenProvider.getUsernameFromToken(token);
            log.info("Change password - Username from token: {}", username);
            authService.changePassword(username, changeRequest);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            log.error("Change password error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
