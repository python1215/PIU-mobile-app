package com.piun.piuproject.repository;

import com.piun.piuproject.model.Installation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstallationRepository extends JpaRepository<Installation, Long> {
    List<Installation> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<Installation> findAllByOrderByDateCreatedDesc();
}
