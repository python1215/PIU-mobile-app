package com.piun.piuproject.repository;

import com.piun.piuproject.model.NawecInfrastructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NawecInfrastructureRepository extends JpaRepository<NawecInfrastructure, Long> {
}
