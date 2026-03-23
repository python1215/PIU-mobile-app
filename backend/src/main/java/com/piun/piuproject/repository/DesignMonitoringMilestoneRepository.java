package com.piun.piuproject.repository;

import com.piun.piuproject.model.DesignMonitoringMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignMonitoringMilestoneRepository extends JpaRepository<DesignMonitoringMilestone, Long> {
    List<DesignMonitoringMilestone> findByDesignProgressMonitoring_IdOrderByLogDateDesc(Long monitoringId);
}
