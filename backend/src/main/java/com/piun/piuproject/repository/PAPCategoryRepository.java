package com.piun.piuproject.repository;

import com.piun.piuproject.model.PAPCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PAPCategoryRepository extends JpaRepository<PAPCategory, Long> {
}
