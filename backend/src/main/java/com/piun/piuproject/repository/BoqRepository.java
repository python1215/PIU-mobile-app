package com.piun.piuproject.repository;

import com.piun.piuproject.model.Boq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoqRepository extends JpaRepository<Boq, Long> {
    List<Boq> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<Boq> findAllByOrderByDateCreatedDesc();
}
