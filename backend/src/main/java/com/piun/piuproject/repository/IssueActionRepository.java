package com.piun.piuproject.repository;

import com.piun.piuproject.model.IssueAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueActionRepository extends JpaRepository<IssueAction, Long> {
    List<IssueAction> findAllByOrderByDateCreatedDesc();
    List<IssueAction> findByProject_ProjectIdOrderByDateCreatedDesc(String projectId);
    List<IssueAction> findByStatusOrderByDateCreatedDesc(String status);
    List<IssueAction> findByPriorityOrderByDateCreatedDesc(String priority);
    List<IssueAction> findByAssignedToOrderByDateCreatedDesc(String assignedTo);
}
