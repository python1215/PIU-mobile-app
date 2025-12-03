package com.piun.piuproject.repository;

import com.piun.piuproject.model.LGA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LGARepository extends JpaRepository<LGA, String> {
    List<LGA> findByRegion_RegionCode(String regionCode);
}
