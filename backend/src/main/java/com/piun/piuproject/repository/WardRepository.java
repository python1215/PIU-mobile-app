package com.piun.piuproject.repository;

import com.piun.piuproject.model.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {
    List<Ward> findByDistrict_DistrictCode(String districtCode);
}
