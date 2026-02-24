package com.piun.piuproject.controller;

import com.piun.piuproject.dto.ChangePasswordRequest;
import com.piun.piuproject.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final AuthService authService;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changeRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Change password - Authentication: {}, principal type: {}",
            authentication != null,
            authentication != null ? authentication.getPrincipal().getClass().getSimpleName() : "null");

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {
            log.warn("Change password - Not authenticated");
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated - please log in again"));
        }

        try {
            String username;
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
            } else {
                username = principal.toString();
            }
            log.info("Change password - Username: {}", username);
            authService.changePassword(username, changeRequest);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            log.error("Change password error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
