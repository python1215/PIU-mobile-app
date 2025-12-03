package com.piun.piuproject.repository;

import com.piun.piuproject.model.ProjectResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectResultRepository extends JpaRepository<ProjectResult, Long> {
    List<ProjectResult> findByProjectOutcome_Id(Long outcomeId);
}
