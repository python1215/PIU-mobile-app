package com.piun.piuproject.repository;

import com.piun.piuproject.model.ContractProfilingWorks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractProfilingWorksRepository extends JpaRepository<ContractProfilingWorks, Long> {
    List<ContractProfilingWorks> findByProject_ProjectId(String projectId);
}
