package com.piun.piuproject.repository;

import com.piun.piuproject.model.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, String> {
    List<District> findByLga_LgaCode(String lgaCode);
}
