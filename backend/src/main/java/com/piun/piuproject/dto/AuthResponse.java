package com.piun.piuproject.dto;

import lombok.Data;

import java.util.Map;

@Data
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private Long roleId;
    private String roleName;
    private boolean isSuperuser;
    private Map<String, Boolean> permissions;

    public AuthResponse(String token, String username, String email) {
        this.token = token;
        this.username = username;
        this.email = email;
    }

    public AuthResponse(String token, String username, String email, Long roleId, String roleName, boolean isSuperuser, Map<String, Boolean> permissions) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.roleId = roleId;
        this.roleName = roleName;
        this.isSuperuser = isSuperuser;
        this.permissions = permissions;
    }
}
