package com.piun.piuproject.repository;

import com.piun.piuproject.model.PDO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PDORepository extends JpaRepository<PDO, Long> {
    List<PDO> findByProject_ProjectId(String projectId);
}
