package com.piun.piuproject.service;

import com.piun.piuproject.dto.AuthRequest;
import com.piun.piuproject.dto.AuthResponse;
import com.piun.piuproject.dto.RegisterRequest;
import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.UserRepository;
import com.piun.piuproject.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    private static final List<String> ALL_MODULES = List.of(
        "dashboard", "systemSetup", "financialManagement", "monitoring",
        "projectActions", "socialEnvironmental", "documentation",
        "projectMap", "issues", "kpi", "administration"
    );

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDepartment(request.getDepartment());
        user.setDateJoined(LocalDateTime.now());
        user.setActive(true);

        userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        user.setLastLogin(now);
        user.setLastActivity(now);
        userRepository.save(user);

        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        Map<String, Boolean> permissions = buildPermissions(user);
        Long roleId = user.getRole() != null ? user.getRole().getId() : null;
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return new AuthResponse(token, user.getUsername(), user.getEmail(), roleId, roleName, user.isSuperuser(), permissions);
    }

    private Map<String, Boolean> buildPermissions(User user) {
        Map<String, Boolean> perms = new LinkedHashMap<>();
        if (user.isSuperuser()) {
            ALL_MODULES.forEach(m -> perms.put(m, true));
        } else if (user.getRole() != null && user.getRole().getPermissions() != null) {
            ALL_MODULES.forEach(m -> perms.put(m, false));
            user.getRole().getPermissions().forEach(p -> perms.put(p.getModuleKey(), p.isHasAccess()));
        } else {
            ALL_MODULES.forEach(m -> perms.put(m, true));
        }
        return perms;
    }
}
