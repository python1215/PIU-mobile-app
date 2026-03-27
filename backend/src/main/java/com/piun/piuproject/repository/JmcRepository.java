package com.piun.piuproject.repository;

import com.piun.piuproject.model.Jmc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JmcRepository extends JpaRepository<Jmc, Long> {
    List<Jmc> findAllByOrderByDateCreatedDesc();
    List<Jmc> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
}
