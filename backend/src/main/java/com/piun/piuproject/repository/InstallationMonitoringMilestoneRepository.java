package com.piun.piuproject.repository;

import com.piun.piuproject.model.InstallationMonitoringMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstallationMonitoringMilestoneRepository extends JpaRepository<InstallationMonitoringMilestone, Long> {
    List<InstallationMonitoringMilestone> findByInstallation_IdOrderByLogDateAsc(Long installationId);
}
