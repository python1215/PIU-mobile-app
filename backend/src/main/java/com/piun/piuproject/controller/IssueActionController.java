package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueActionController {

    private final IssueActionRepository issueActionRepository;
    private final UserRepository userRepository;

    private User getOrCreateDefaultUser() {
        return userRepository.findByUsername("system")
            .orElseGet(() -> {
                User defaultUser = new User();
                defaultUser.setUsername("system");
                defaultUser.setEmail("system@piun.local");
                defaultUser.setPasswordHash("disabled");
                return userRepository.save(defaultUser);
            });
    }

    @GetMapping
    public ResponseEntity<List<IssueAction>> getAllIssues() {
        return ResponseEntity.ok(issueActionRepository.findAllByOrderByDateCreatedDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueAction> getIssue(@PathVariable Long id) {
        return issueActionRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IssueAction>> getIssuesByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(issueActionRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IssueAction>> getIssuesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(issueActionRepository.findByStatusOrderByDateCreatedDesc(status));
    }

    @PostMapping
    public ResponseEntity<IssueAction> createIssue(@RequestBody IssueAction issue,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user;
        if (userDetails != null) {
            user = userRepository.findByUsername(userDetails.getUsername())
                .orElseGet(this::getOrCreateDefaultUser);
        } else {
            user = getOrCreateDefaultUser();
        }
        
        issue.setLoginUser(user);
        issue.setDateCreated(LocalDateTime.now());
        issue.setDateUpdated(LocalDateTime.now());
        
        return ResponseEntity.ok(issueActionRepository.save(issue));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueAction> updateIssue(@PathVariable Long id,
                                                    @RequestBody IssueAction issueDetails) {
        return issueActionRepository.findById(id)
            .map(issue -> {
                issue.setProject(issueDetails.getProject());
                issue.setYear(issueDetails.getYear());
                issue.setQuarter(issueDetails.getQuarter());
                issue.setIssueCode(issueDetails.getIssueCode());
                issue.setIssueActionType(issueDetails.getIssueActionType());
                issue.setDescriptionOfIssueOrAction(issueDetails.getDescriptionOfIssueOrAction());
                issue.setSourceOfIssueOrAction(issueDetails.getSourceOfIssueOrAction());
                issue.setStatus(issueDetails.getStatus());
                issue.setPriority(issueDetails.getPriority());
                issue.setAssignedTo(issueDetails.getAssignedTo());
                issue.setAssignDate(issueDetails.getAssignDate());
                issue.setDueDate(issueDetails.getDueDate());
                issue.setRemarks(issueDetails.getRemarks());
                return ResponseEntity.ok(issueActionRepository.save(issue));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        return issueActionRepository.findById(id)
            .map(issue -> {
                issueActionRepository.delete(issue);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
