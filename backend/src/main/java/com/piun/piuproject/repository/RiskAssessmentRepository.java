package com.piun.piuproject.repository;

import com.piun.piuproject.model.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    List<RiskAssessment> findByProject_ProjectId(String projectId);
    List<RiskAssessment> findByRiskLevel(String riskLevel);
    List<RiskAssessment> findByStatus(String status);
    List<RiskAssessment> findBySource(String source);
    long countByRiskLevel(String riskLevel);
    long countByStatus(String status);
}
