package com.piun.piuproject.repository;

import com.piun.piuproject.model.Year;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YearRepository extends JpaRepository<Year, Long> {
}
