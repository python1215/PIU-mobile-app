package com.piun.piuproject.repository;

import com.piun.piuproject.model.OHSMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OHSMonitoringRepository extends JpaRepository<OHSMonitoring, Long> {
    List<OHSMonitoring> findByProject_ProjectId(String projectId);
}
