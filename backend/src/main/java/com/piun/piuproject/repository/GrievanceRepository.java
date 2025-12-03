package com.piun.piuproject.repository;

import com.piun.piuproject.model.GrievanceMonitoringLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<GrievanceMonitoringLog, String> {
    List<GrievanceMonitoringLog> findByProject_ProjectId(String projectId);
}
