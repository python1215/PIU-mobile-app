package com.piun.piuproject.repository;

import com.piun.piuproject.model.MeasurementUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeasurementUnitRepository extends JpaRepository<MeasurementUnit, Long> {
}
