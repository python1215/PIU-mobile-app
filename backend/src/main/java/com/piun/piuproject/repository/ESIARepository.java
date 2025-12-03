package com.piun.piuproject.repository;

import com.piun.piuproject.model.ESIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ESIARepository extends JpaRepository<ESIA, Long> {
    List<ESIA> findByProject_ProjectId(String projectId);
}
