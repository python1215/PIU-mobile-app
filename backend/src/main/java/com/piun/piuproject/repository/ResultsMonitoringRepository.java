package com.piun.piuproject.repository;

import com.piun.piuproject.model.ResultsOrientedMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResultsMonitoringRepository extends JpaRepository<ResultsOrientedMonitoring, Long> {
    List<ResultsOrientedMonitoring> findByProject_ProjectId(String projectId);
}
