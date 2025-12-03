package com.piun.piuproject.repository;

import com.piun.piuproject.model.NatureOfSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NatureOfSettlementRepository extends JpaRepository<NatureOfSettlement, Long> {
}
