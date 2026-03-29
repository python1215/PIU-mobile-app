package com.piun.piuproject.repository;

import com.piun.piuproject.model.JmcSnag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JmcSnagRepository extends JpaRepository<JmcSnag, Long> {
    List<JmcSnag> findByMilestone_IdOrderByDateCreatedAsc(Long milestoneId);
}
