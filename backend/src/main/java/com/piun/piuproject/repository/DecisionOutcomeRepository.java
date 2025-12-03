package com.piun.piuproject.repository;

import com.piun.piuproject.model.DecisionOutcome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DecisionOutcomeRepository extends JpaRepository<DecisionOutcome, Long> {
}
