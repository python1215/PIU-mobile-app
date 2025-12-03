package com.piun.piuproject.repository;

import com.piun.piuproject.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    List<Donor> findAllByOrderByDateCreatedDesc();
    boolean existsByName(String name);
}
