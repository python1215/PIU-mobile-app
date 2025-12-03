package com.piun.piuproject.repository;

import com.piun.piuproject.model.Quarter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuarterRepository extends JpaRepository<Quarter, Long> {
}
