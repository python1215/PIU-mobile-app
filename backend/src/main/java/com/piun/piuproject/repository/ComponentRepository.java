package com.piun.piuproject.repository;

import com.piun.piuproject.model.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByProject_ProjectId(String projectId);
    List<Component> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<Component> findAllByOrderByDateCreatedDesc();
}
