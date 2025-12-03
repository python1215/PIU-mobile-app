package com.piun.piuproject.repository;

import com.piun.piuproject.model.StakeholderEngagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StakeholderEngagementRepository extends JpaRepository<StakeholderEngagement, Long> {
}
