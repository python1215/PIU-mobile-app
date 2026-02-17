package com.piun.piuproject.repository;

import com.piun.piuproject.model.KPIContractSetup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KPIContractSetupRepository extends JpaRepository<KPIContractSetup, Long> {
    List<KPIContractSetup> findByMonitoringType_MonitoringTypeCode(String monitoringTypeCode);
    List<KPIContractSetup> findByProject_ProjectId(String projectId);
}
