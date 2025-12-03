package com.piun.piuproject.repository;

import com.piun.piuproject.model.TypeOfPAP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeOfPAPRepository extends JpaRepository<TypeOfPAP, Long> {
}
