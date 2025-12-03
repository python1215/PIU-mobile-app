package com.piun.piuproject.repository;

import com.piun.piuproject.model.PAP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PAPRepository extends JpaRepository<PAP, String> {
    List<PAP> findByProject_ProjectId(String projectId);
    List<PAP> findByPapCompensated(String compensated);
}
