package com.piun.piuproject.repository;

import com.piun.piuproject.model.KPIForContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KPIForContractRepository extends JpaRepository<KPIForContract, Long> {
}
