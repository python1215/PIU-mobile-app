package com.piun.piuproject.repository;

import com.piun.piuproject.model.RiskMitigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskMitigationRepository extends JpaRepository<RiskMitigation, Long> {
    List<RiskMitigation> findByRiskAssessment_Id(Long riskId);
    List<RiskMitigation> findByStatus(String status);
}
