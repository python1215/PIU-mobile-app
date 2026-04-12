package com.piun.piuproject.repository;

import com.piun.piuproject.model.EssOshMonitoringType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EssOshMonitoringTypeRepository extends JpaRepository<EssOshMonitoringType, Long> {
}
