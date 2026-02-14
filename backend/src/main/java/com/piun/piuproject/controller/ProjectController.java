package com.piun.piuproject.controller;

import com.piun.piuproject.model.Project;
import com.piun.piuproject.model.User;
import com.piun.piuproject.model.Donor;
import com.piun.piuproject.model.Contributor;
import com.piun.piuproject.repository.ProjectRepository;
import com.piun.piuproject.repository.UserRepository;
import com.piun.piuproject.repository.DonorRepository;
import com.piun.piuproject.repository.ContributorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final ContributorRepository contributorRepository;

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
    public ResponseEntity<Project> createProject(@RequestBody Map<String, Object> payload) {
        Project project = new Project();
        project.setProjectId((String) payload.get("projectId"));
        project.setProject((String) payload.get("project"));
        
        if (payload.get("funding") != null) {
            project.setFunding(new java.math.BigDecimal(payload.get("funding").toString()));
        }
        if (payload.get("effectivenessDate") != null && !payload.get("effectivenessDate").toString().isEmpty()) {
            project.setEffectivenessDate(java.time.LocalDate.parse(payload.get("effectivenessDate").toString()));
        }
        if (payload.get("closureDate") != null && !payload.get("closureDate").toString().isEmpty()) {
            project.setClosureDate(java.time.LocalDate.parse(payload.get("closureDate").toString()));
        }
        
        // Handle currency
        if (payload.get("currencyId") != null && !payload.get("currencyId").toString().isEmpty()) {
            com.piun.piuproject.model.Currency currency = new com.piun.piuproject.model.Currency();
            currency.setId(Long.valueOf(payload.get("currencyId").toString()));
            project.setCurrency(currency);
        }
        
        // Handle donors - multi-select
        if (payload.get("donorIds") != null) {
            @SuppressWarnings("unchecked")
            List<Number> donorIds = (List<Number>) payload.get("donorIds");
            Set<Donor> donors = new HashSet<>();
            for (Number id : donorIds) {
                donorRepository.findById(id.longValue()).ifPresent(donors::add);
            }
            project.setDonors(donors);
        }
        
        // Handle contributors - multi-select
        if (payload.get("contributorIds") != null) {
            @SuppressWarnings("unchecked")
            List<Number> contributorIds = (List<Number>) payload.get("contributorIds");
            Set<Contributor> contributors = new HashSet<>();
            for (Number id : contributorIds) {
                contributorRepository.findById(id.longValue()).ifPresent(contributors::add);
            }
            project.setContributors(contributors);
        }
        
        // Set a default user for now (first user in system)
        User user = userRepository.findAll().stream().findFirst()
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("system");
                newUser.setEmail("system@piu.gov");
                newUser.setPasswordHash("$2a$10$dummy");
                return userRepository.save(newUser);
            });
        project.setLoginUser(user);
        project.setDateCreated(LocalDateTime.now());
        
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id,
                                                  @RequestBody Map<String, Object> payload) {
        return projectRepository.findById(id)
            .map(project -> {
                if (payload.get("project") != null) {
                    project.setProject((String) payload.get("project"));
                }
                if (payload.get("funding") != null) {
                    project.setFunding(new java.math.BigDecimal(payload.get("funding").toString()));
                }
                if (payload.get("effectivenessDate") != null && !payload.get("effectivenessDate").toString().isEmpty()) {
                    project.setEffectivenessDate(java.time.LocalDate.parse(payload.get("effectivenessDate").toString()));
                }
                if (payload.get("closureDate") != null && !payload.get("closureDate").toString().isEmpty()) {
                    project.setClosureDate(java.time.LocalDate.parse(payload.get("closureDate").toString()));
                }
                
                // Handle currency
                if (payload.get("currencyId") != null && !payload.get("currencyId").toString().isEmpty()) {
                    com.piun.piuproject.model.Currency currency = new com.piun.piuproject.model.Currency();
                    currency.setId(Long.valueOf(payload.get("currencyId").toString()));
                    project.setCurrency(currency);
                } else if (payload.containsKey("currencyId")) {
                    project.setCurrency(null);
                }
                
                // Handle donors - multi-select
                if (payload.get("donorIds") != null) {
                    @SuppressWarnings("unchecked")
                    List<Number> donorIds = (List<Number>) payload.get("donorIds");
                    Set<Donor> donors = new HashSet<>();
                    for (Number donorId : donorIds) {
                        donorRepository.findById(donorId.longValue()).ifPresent(donors::add);
                    }
                    project.setDonors(donors);
                }
                
                // Handle contributors - multi-select
                if (payload.get("contributorIds") != null) {
                    @SuppressWarnings("unchecked")
                    List<Number> contributorIds = (List<Number>) payload.get("contributorIds");
                    Set<Contributor> contributors = new HashSet<>();
                    for (Number contribId : contributorIds) {
                        contributorRepository.findById(contribId.longValue()).ifPresent(contributors::add);
                    }
                    project.setContributors(contributors);
                }
                
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
