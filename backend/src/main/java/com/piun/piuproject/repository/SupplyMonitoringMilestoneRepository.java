package com.piun.piuproject.repository;

import com.piun.piuproject.model.SupplyMonitoringMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyMonitoringMilestoneRepository extends JpaRepository<SupplyMonitoringMilestone, Long> {
    List<SupplyMonitoringMilestone> findBySupplyProgress_IdOrderByLogDateDesc(Long supplyProgressId);
}
