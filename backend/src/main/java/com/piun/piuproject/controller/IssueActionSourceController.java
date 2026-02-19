package com.piun.piuproject.controller;

import com.piun.piuproject.model.IssueActionSource;
import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.IssueActionSourceRepository;
import com.piun.piuproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issue-action-sources")
@RequiredArgsConstructor
public class IssueActionSourceController {

    private final IssueActionSourceRepository issueActionSourceRepository;
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
    public ResponseEntity<List<IssueActionSource>> getAll() {
        return ResponseEntity.ok(issueActionSourceRepository.findAllByOrderByDateCreatedDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueActionSource> getById(@PathVariable Long id) {
        return issueActionSourceRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<IssueActionSource> create(@RequestBody IssueActionSource source,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        User user;
        if (userDetails != null) {
            user = userRepository.findByUsername(userDetails.getUsername())
                .orElseGet(this::getOrCreateDefaultUser);
        } else {
            user = getOrCreateDefaultUser();
        }

        source.setUser(user);
        source.setDateCreated(LocalDateTime.now());

        return ResponseEntity.ok(issueActionSourceRepository.save(source));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueActionSource> update(@PathVariable Long id,
                                                     @RequestBody IssueActionSource sourceDetails) {
        return issueActionSourceRepository.findById(id)
            .map(source -> {
                source.setIssueActionSource(sourceDetails.getIssueActionSource());
                return ResponseEntity.ok(issueActionSourceRepository.save(source));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return issueActionSourceRepository.findById(id)
            .map(source -> {
                issueActionSourceRepository.delete(source);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
