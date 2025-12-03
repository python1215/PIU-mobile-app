package com.piun.piuproject.repository;

import com.piun.piuproject.model.PhysicalProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhysicalProgressRepository extends JpaRepository<PhysicalProgress, Long> {
}
