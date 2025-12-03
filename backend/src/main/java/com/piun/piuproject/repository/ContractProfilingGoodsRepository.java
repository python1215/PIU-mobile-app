package com.piun.piuproject.repository;

import com.piun.piuproject.model.ContractProfilingGoods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractProfilingGoodsRepository extends JpaRepository<ContractProfilingGoods, Long> {
    List<ContractProfilingGoods> findByProject_ProjectId(String projectId);
}
