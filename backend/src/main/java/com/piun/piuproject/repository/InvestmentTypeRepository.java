package com.piun.piuproject.repository;

import com.piun.piuproject.model.InvestmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvestmentTypeRepository extends JpaRepository<InvestmentType, Long> {
}
