package com.piun.piuproject.repository;

import com.piun.piuproject.model.KPIContractSetup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KPIContractSetupRepository extends JpaRepository<KPIContractSetup, Long> {
}
