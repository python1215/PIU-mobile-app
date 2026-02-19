package com.piun.piuproject.repository;

import com.piun.piuproject.model.RoleModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleModulePermissionRepository extends JpaRepository<RoleModulePermission, Long> {
    List<RoleModulePermission> findByRoleId(Long roleId);
    void deleteByRoleId(Long roleId);
}
