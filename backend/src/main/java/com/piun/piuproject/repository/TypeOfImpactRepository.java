package com.piun.piuproject.repository;

import com.piun.piuproject.model.TypeOfImpact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeOfImpactRepository extends JpaRepository<TypeOfImpact, Long> {
}
