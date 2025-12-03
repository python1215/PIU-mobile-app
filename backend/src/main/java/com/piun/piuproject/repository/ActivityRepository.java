package com.piun.piuproject.repository;

import com.piun.piuproject.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByProject_ProjectId(String projectId);
    List<Activity> findBySubcomponent_SubcompId(Long subcompId);
}
