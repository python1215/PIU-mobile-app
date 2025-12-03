package com.piun.piuproject.repository;

import com.piun.piuproject.model.MonitoringType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoringTypeRepository extends JpaRepository<MonitoringType, String> {
}
