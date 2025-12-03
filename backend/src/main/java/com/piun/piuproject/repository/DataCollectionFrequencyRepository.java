package com.piun.piuproject.repository;

import com.piun.piuproject.model.DataCollectionFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataCollectionFrequencyRepository extends JpaRepository<DataCollectionFrequency, Long> {
}
