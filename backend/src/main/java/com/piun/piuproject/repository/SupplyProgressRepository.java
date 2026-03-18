package com.piun.piuproject.repository;

import com.piun.piuproject.model.SupplyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyProgressRepository extends JpaRepository<SupplyProgress, Long> {
    List<SupplyProgress> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<SupplyProgress> findAllByOrderByDateCreatedDesc();
    List<SupplyProgress> findByContractRefNoOrderByDateCreatedDesc(String contractRefNo);
}
