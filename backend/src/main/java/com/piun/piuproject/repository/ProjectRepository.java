package com.piun.piuproject.repository;

import com.piun.piuproject.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findAllByOrderByDateCreatedDesc();
    
    @Query("SELECT p FROM Project p JOIN FETCH p.donors")
    List<Project> findAllWithDonors();
    
    boolean existsByProject(String project);
}
