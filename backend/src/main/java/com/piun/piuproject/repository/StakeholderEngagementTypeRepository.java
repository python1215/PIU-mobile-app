package com.piun.piuproject.repository;

import com.piun.piuproject.model.StakeholderEngagementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StakeholderEngagementTypeRepository extends JpaRepository<StakeholderEngagementType, Long> {
}
