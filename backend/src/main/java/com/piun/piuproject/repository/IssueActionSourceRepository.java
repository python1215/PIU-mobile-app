package com.piun.piuproject.repository;

import com.piun.piuproject.model.IssueActionSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueActionSourceRepository extends JpaRepository<IssueActionSource, Long> {
    List<IssueActionSource> findAllByOrderByDateCreatedDesc();
}
