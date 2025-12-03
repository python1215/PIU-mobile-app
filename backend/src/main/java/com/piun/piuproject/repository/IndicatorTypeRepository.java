package com.piun.piuproject.repository;

import com.piun.piuproject.model.IndicatorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IndicatorTypeRepository extends JpaRepository<IndicatorType, Long> {
}
