package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "role_module_permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role_id", "module_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleModulePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnore
    private Role role;

    @NotBlank
    @Column(name = "module_key", nullable = false)
    private String moduleKey;

    @Column(name = "has_access", nullable = false)
    private boolean hasAccess = false;
}
