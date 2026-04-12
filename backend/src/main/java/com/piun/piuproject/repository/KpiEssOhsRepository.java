package com.piun.piuproject.repository;

import com.piun.piuproject.model.KpiEssOhs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KpiEssOhsRepository extends JpaRepository<KpiEssOhs, Long> {
}
