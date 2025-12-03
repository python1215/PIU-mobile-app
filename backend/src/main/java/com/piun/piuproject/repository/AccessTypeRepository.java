package com.piun.piuproject.repository;

import com.piun.piuproject.model.AccessType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessTypeRepository extends JpaRepository<AccessType, Long> {
}
