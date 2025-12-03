package com.piun.piuproject.repository;

import com.piun.piuproject.model.ProjectOutcome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectOutcomeRepository extends JpaRepository<ProjectOutcome, Long> {
    List<ProjectOutcome> findByPdo_Id(Long pdoId);
}
