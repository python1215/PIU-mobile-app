package com.piun.piuproject.repository;

import com.piun.piuproject.model.CommunityEngagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityEngagementRepository extends JpaRepository<CommunityEngagement, String> {
    List<CommunityEngagement> findByProject_ProjectId(String projectId);
}
