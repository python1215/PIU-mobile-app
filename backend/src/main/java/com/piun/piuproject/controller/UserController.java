package com.piun.piuproject.controller;

import com.piun.piuproject.dto.ChangePasswordRequest;
import com.piun.piuproject.security.JwtTokenProvider;
import com.piun.piuproject.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(HttpServletRequest request,
                                             @Valid @RequestBody ChangePasswordRequest changeRequest) {
        String token = parseJwt(request);
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - please log in again"));
        }
        try {
            String username = tokenProvider.getUsernameFromToken(token);
            authService.changePassword(username, changeRequest);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
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
