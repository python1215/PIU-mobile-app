package com.piun.piuproject.repository;

import com.piun.piuproject.model.DesignProgressMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignProgressMonitoringRepository extends JpaRepository<DesignProgressMonitoring, Long> {
    List<DesignProgressMonitoring> findAllByOrderByDateCreatedDesc();
    List<DesignProgressMonitoring> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<DesignProgressMonitoring> findByProject_ProjectIdAndContractTypeAndContractRefNo(String projectId, String contractType, String contractRefNo);
}
