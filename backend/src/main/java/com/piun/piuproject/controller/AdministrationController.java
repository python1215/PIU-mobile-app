package com.piun.piuproject.controller;

import com.piun.piuproject.model.Role;
import com.piun.piuproject.model.RoleModulePermission;
import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.RoleModulePermissionRepository;
import com.piun.piuproject.repository.RoleRepository;
import com.piun.piuproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdministrationController {

    private final RoleRepository roleRepository;
    private final RoleModulePermissionRepository permissionRepository;
    private final UserRepository userRepository;

    private static final List<String> ALL_MODULES = List.of(
        "dashboard", "systemSetup", "financialManagement", "monitoring",
        "projectActions", "socialEnvironmental", "documentation",
        "projectMap", "issues", "kpi", "administration"
    );

    @GetMapping("/modules")
    public ResponseEntity<List<String>> getAllModules() {
        return ResponseEntity.ok(ALL_MODULES);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<Map<String, Object>> result = roles.stream().map(this::roleToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Map<String, Object>> getRole(@PathVariable Long id) {
        return roleRepository.findById(id)
            .map(role -> ResponseEntity.ok(roleToMap(role)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/roles")
    @Transactional
    public ResponseEntity<Map<String, Object>> createRole(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        if (roleRepository.existsByName(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role name already exists"));
        }

        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        role.setActive(true);
        role.setPermissions(new ArrayList<>());
        role = roleRepository.save(role);

        @SuppressWarnings("unchecked")
        Map<String, Boolean> permissions = (Map<String, Boolean>) payload.get("permissions");
        if (permissions != null) {
            savePermissions(role, permissions);
        }

        role = roleRepository.findById(role.getId()).orElse(role);
        return ResponseEntity.ok(roleToMap(role));
    }

    @PutMapping("/roles/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateRole(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return roleRepository.findById(id).map(role -> {
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");

            if (name != null && !name.isBlank()) {
                role.setName(name);
            }
            if (description != null) {
                role.setDescription(description);
            }
            if (payload.containsKey("isActive")) {
                role.setActive((Boolean) payload.get("isActive"));
            }

            roleRepository.save(role);

            @SuppressWarnings("unchecked")
            Map<String, Boolean> permissions = (Map<String, Boolean>) payload.get("permissions");
            if (permissions != null) {
                permissionRepository.deleteByRoleId(role.getId());
                role.getPermissions().clear();
                savePermissions(role, permissions);
            }

            Role updated = roleRepository.findById(role.getId()).orElse(role);
            return ResponseEntity.ok(roleToMap(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/roles/{id}")
    @Transactional
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<User> usersWithRole = userRepository.findByRoleId(id);
        for (User user : usersWithRole) {
            user.setRole(null);
            userRepository.save(user);
        }
        roleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("department", user.getDepartment());
            map.put("isActive", user.isActive());
            map.put("isSuperuser", user.isSuperuser());
            map.put("roleId", user.getRole() != null ? user.getRole().getId() : null);
            map.put("roleName", user.getRole() != null ? user.getRole().getName() : null);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/role")
    @Transactional
    public ResponseEntity<Map<String, Object>> assignRole(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return userRepository.findById(id).map(user -> {
            Object roleIdObj = payload.get("roleId");
            if (roleIdObj == null) {
                user.setRole(null);
            } else {
                Long roleId = Long.valueOf(roleIdObj.toString());
                Role role = roleRepository.findById(roleId).orElse(null);
                user.setRole(role);
            }
            userRepository.save(user);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", user.getId());
            result.put("username", user.getUsername());
            result.put("roleId", user.getRole() != null ? user.getRole().getId() : null);
            result.put("roleName", user.getRole() != null ? user.getRole().getName() : null);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/connected-users")
    public ResponseEntity<Map<String, Object>> getConnectedUsers() {
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        List<User> recentUsers = userRepository.findByLastActivityAfterOrderByLastActivityDesc(fifteenMinutesAgo);

        List<Map<String, Object>> connectedList = recentUsers.stream().map(user -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("email", user.getEmail());
            map.put("department", user.getDepartment());
            map.put("roleName", user.getRole() != null ? user.getRole().getName() : null);
            map.put("lastActivity", user.getLastActivity());
            map.put("lastLogin", user.getLastLogin());

            String status;
            if (user.getLastActivity() != null) {
                Duration since = Duration.between(user.getLastActivity(), LocalDateTime.now());
                status = since.toMinutes() < 5 ? "active" : "idle";
            } else {
                status = "idle";
            }
            map.put("status", status);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("users", connectedList);
        result.put("totalConnected", connectedList.size());
        result.put("activeCount", connectedList.stream().filter(u -> "active".equals(u.get("status"))).count());
        result.put("idleCount", connectedList.stream().filter(u -> "idle".equals(u.get("status"))).count());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/{userId}/permissions")
    public ResponseEntity<Map<String, Boolean>> getUserPermissions(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            Map<String, Boolean> perms = new LinkedHashMap<>();
            if (user.isSuperuser()) {
                ALL_MODULES.forEach(m -> perms.put(m, true));
            } else if (user.getRole() != null && user.getRole().getPermissions() != null) {
                ALL_MODULES.forEach(m -> perms.put(m, false));
                user.getRole().getPermissions().forEach(p -> perms.put(p.getModuleKey(), p.isHasAccess()));
            } else {
                ALL_MODULES.forEach(m -> perms.put(m, false));
                perms.put("dashboard", true);
            }
            return ResponseEntity.ok(perms);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void savePermissions(Role role, Map<String, Boolean> permissions) {
        List<RoleModulePermission> permList = new ArrayList<>();
        for (Map.Entry<String, Boolean> entry : permissions.entrySet()) {
            RoleModulePermission perm = new RoleModulePermission();
            perm.setRole(role);
            perm.setModuleKey(entry.getKey());
            perm.setHasAccess(entry.getValue());
            permList.add(perm);
        }
        permissionRepository.saveAll(permList);
    }

    private Map<String, Object> roleToMap(Role role) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", role.getId());
        map.put("name", role.getName());
        map.put("description", role.getDescription());
        map.put("isActive", role.isActive());
        Map<String, Boolean> perms = new LinkedHashMap<>();
        ALL_MODULES.forEach(m -> perms.put(m, false));
        if (role.getPermissions() != null) {
            role.getPermissions().forEach(p -> perms.put(p.getModuleKey(), p.isHasAccess()));
        }
        map.put("permissions", perms);
        int userCount = userRepository.findByRoleId(role.getId()).size();
        map.put("userCount", userCount);
        return map;
    }
}
