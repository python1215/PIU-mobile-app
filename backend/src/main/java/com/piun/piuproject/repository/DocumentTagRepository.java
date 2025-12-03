package com.piun.piuproject.repository;

import com.piun.piuproject.model.DocumentTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTagRepository extends JpaRepository<DocumentTag, Long> {
}
