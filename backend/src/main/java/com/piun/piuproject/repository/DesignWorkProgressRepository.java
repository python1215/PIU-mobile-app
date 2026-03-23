package com.piun.piuproject.repository;

import com.piun.piuproject.model.DesignWorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignWorkProgressRepository extends JpaRepository<DesignWorkProgress, Long> {
    List<DesignWorkProgress> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<DesignWorkProgress> findAllByOrderByDateCreatedDesc();
    List<DesignWorkProgress> findByProject_ProjectIdAndContractTypeAndContractRefNoOrderByActivityIdAsc(String projectId, String contractType, String contractRefNo);
    List<DesignWorkProgress> findByProject_ProjectIdAndContractTypeAndContractRefNoAndYear_IdOrderByActivityIdAsc(String projectId, String contractType, String contractRefNo, Long yearId);
}
