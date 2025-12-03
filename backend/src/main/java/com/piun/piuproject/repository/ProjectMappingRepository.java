package com.piun.piuproject.repository;

import com.piun.piuproject.model.ProjectMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectMappingRepository extends JpaRepository<ProjectMapping, Long> {
    List<ProjectMapping> findByProject_ProjectId(String projectId);
    List<ProjectMapping> findByRegion_RegionCode(String regionCode);
}
