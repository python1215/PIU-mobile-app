package com.piun.piuproject.repository;

import com.piun.piuproject.model.Subcomponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubcomponentRepository extends JpaRepository<Subcomponent, Long> {
    List<Subcomponent> findByComponent_CompId(Long compId);
    List<Subcomponent> findByProject_ProjectId(String projectId);
}
