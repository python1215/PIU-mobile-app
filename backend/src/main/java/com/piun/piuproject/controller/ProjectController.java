package com.piun.piuproject.controller;

import com.piun.piuproject.model.Project;
import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.ProjectRepository;
import com.piun.piuproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAllByOrderByDateCreatedDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable String id) {
        return projectRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        project.setLoginUser(user);
        project.setDateCreated(LocalDateTime.now());
        
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id,
                                                  @RequestBody Project projectDetails) {
        return projectRepository.findById(id)
            .map(project -> {
                project.setProject(projectDetails.getProject());
                project.setFunding(projectDetails.getFunding());
                project.setCurrency(projectDetails.getCurrency());
                project.setEffectivenessDate(projectDetails.getEffectivenessDate());
                project.setClosureDate(projectDetails.getClosureDate());
                project.setLastDateOfDisbursement(projectDetails.getLastDateOfDisbursement());
                project.setDonors(projectDetails.getDonors());
                return ResponseEntity.ok(projectRepository.save(project));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        return projectRepository.findById(id)
            .map(project -> {
                projectRepository.delete(project);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
