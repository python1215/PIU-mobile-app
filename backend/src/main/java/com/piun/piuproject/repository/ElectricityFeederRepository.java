package com.piun.piuproject.repository;

import com.piun.piuproject.model.ElectricityFeeder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ElectricityFeederRepository extends JpaRepository<ElectricityFeeder, Long> {
}
