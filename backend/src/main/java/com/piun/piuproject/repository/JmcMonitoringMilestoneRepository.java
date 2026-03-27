package com.piun.piuproject.repository;

import com.piun.piuproject.model.JmcMonitoringMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JmcMonitoringMilestoneRepository extends JpaRepository<JmcMonitoringMilestone, Long> {
    List<JmcMonitoringMilestone> findByJmc_IdOrderByLogDateAsc(Long jmcId);
}
